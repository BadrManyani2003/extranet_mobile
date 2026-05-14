USE [IBS_Extranet_Mobile];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetPolices
-- RÔLE : Récupérer les polices accessibles selon le contexte utilisateur
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetPolices
    @FK_User_Id INT,
    @Source     CHAR(1), -- 'A'=Admin, 'E'=Extranet (client particulier N), 'M'=Mobile (client particulier O)
    @Token      VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    -- Vérification de session
    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        p.Id AS id,
        p.Branche AS branche,
        p.Police AS police,
        p.DateEcheance AS dateEcheance,
        CASE p.Statut 
            WHEN 'E' THEN 'En cours' 
            WHEN 'S' THEN 'Suspendu' 
            WHEN 'R' THEN 'Résilié' 
            WHEN 'M' THEN 'Mise en demeure' 
            ELSE p.Statut 
        END AS statut,
        CASE p.Statut 
            WHEN 'E' THEN 'success' 
            WHEN 'S' THEN 'warning' 
            ELSE 'error' 
        END AS statut_variant,
        CASE WHEN p.Statut = 'E' THEN 1 ELSE 0 END AS is_active,
        p.Module AS module,
        c.RaisonSociale AS client,
        c.Particulier AS particulier,
        com.RaisonSociale AS compagnie
    FROM dbo.Polices p
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    INNER JOIN dbo.Compagnies com ON p.FK_Compagnie_Id = com.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE
    (
        -- Admin : voit tout
        (@Source = 'A' AND @UserNature = 'A')
        OR
        -- Extranet (Client particulier N) : lié au client via UsersXClients
        (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
        OR
        -- Mobile (Client particulier O) : lié au client via UsersXClients
        (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
        OR
        -- Adhérent : lié à la police via la table Adherents
        EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
    );

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetSinistres
-- RÔLE : Récupérer les sinistres d'une police donnée
-- ==================================================================================
create or ALTER   PROCEDURE [dbo].[sp_GetSinistres]
    @FK_User_Id   INT,
    @Source       CHAR(1),
    @Token        VARCHAR(MAX),
    @FK_Police_Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        s.Id AS id,
        s.NumeroSin AS numero,
        s.DateSin AS date,
        s.DateDeclaration AS dateDeclaration,
        CASE s.Statut 
            WHEN 'E' THEN 'En cours' 
            WHEN 'C' THEN 'Clôturé' 
            WHEN 'R' THEN 'Réouvert' 
            ELSE s.Statut 
        END AS statut,
        CASE s.Statut 
            WHEN 'E' THEN 'warning' 
            WHEN 'C' THEN 'success' 
            WHEN 'R' THEN 'error' 
            ELSE 'neutral' 
        END AS statut_variant,
        CASE WHEN s.Statut = 'E' THEN 1 ELSE 0 END AS is_active,
        ISNULL(s.MT_Indemnite, 0) AS mtRembourse,
        ISNULL(s.MT_Dommages, 0) AS mtDommage,
        ISNULL(s.MT_Dommages, 0) AS mtFrais,
        ISNULL(s.MT_Franchise, 0) AS mtFranchise,
        ISNULL(s.Observations, '') AS observation,
        CASE 
            WHEN p.Branche = 'Santé' THEN a.NomComplet
            ELSE ISNULL(r.Libelle, '-')
        END AS objet,
        CASE 
            WHEN p.Branche = 'Santé' THEN a.NumAdhesion
            ELSE r.Identifiant
        END AS identifiant,
        p.Branche AS branche,
        p.Police AS police
    FROM dbo.Sinistres s
    INNER JOIN dbo.Polices p ON s.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.Risques r ON s.FK_Risque_Id = r.Id
    LEFT JOIN dbo.Adherents a ON s.FK_Adherent_Id = a.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE (s.FK_Police_Id = @FK_Police_Id or @FK_Police_Id is null)
      AND
      (
          (@Source = 'A' AND @UserNature = 'A')
          OR
          (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
          OR
          (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
          OR
          EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
      );

    RETURN;
END;

go
-- ==================================================================================
-- PROCÉDURE : sp_GetSinistresEncour
-- RÔLE : Récupérer les sinistres en cours d'une police
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetSinistresEncour
    @FK_User_Id   INT,
    @Source       CHAR(1),
    @Token        VARCHAR(MAX),
    @FK_Police_Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        s.Id AS id,
        s.NumeroSin AS numero,
        s.DateSin AS date,
        s.DateDeclaration AS dateDeclaration,
        'En cours' AS statut,
        ISNULL(s.MT_Indemnite, 0) AS mtRembourse,
        ISNULL(s.MT_Dommages, 0) AS mtDommage,
        ISNULL(s.MT_Dommages, 0) AS mtFrais,
        ISNULL(s.MT_Franchise, 0) AS mtFranchise,
        ISNULL(s.Observations, '') AS observation,
        CASE 
            WHEN p.Branche = 'Santé' THEN a.NomComplet
            ELSE ISNULL(r.Libelle, '-')
        END AS objet,
        CASE 
            WHEN p.Branche = 'Santé' THEN a.NumAdhesion
            ELSE r.Identifiant
        END AS identifiant,
        p.Branche AS branche
    FROM dbo.Sinistres s
    INNER JOIN dbo.Polices p ON s.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.Risques r ON s.FK_Risque_Id = r.Id
    LEFT JOIN dbo.Adherents a ON s.FK_Adherent_Id = a.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE s.Statut = 'E'
      AND
      (
          (@Source = 'A' AND @UserNature = 'A')
          OR
          (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL AND p.Id = @FK_Police_Id)
          OR
          (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL AND p.Id = @FK_Police_Id)
          OR
          EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
      );

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetRisques
-- RÔLE : Récupérer les risques d'une police
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetRisques
    @FK_User_Id   INT,
    @Source       CHAR(1),
    @Token        VARCHAR(MAX),
    @FK_Police_Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        r.Id AS id,
        r.Libelle AS nom,
        r.Libelle AS marque,
        r.Identifiant AS identifiant,
        ISNULL(r.Description, 'Risque') AS description,
        r.DateDu AS dateMiseEnCirculation,
        r.DateEcheance AS dateEcheance,
        r.Statut AS statut
    FROM dbo.Risques r
    INNER JOIN dbo.Polices p ON r.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE
    (
        (@Source = 'A' AND @UserNature = 'A')
        OR
        (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL AND p.Id = @FK_Police_Id)
        OR
        (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL AND p.Id = @FK_Police_Id)
        OR
        EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
    );

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetQuittances
-- RÔLE : Récupérer les quittances d'une police
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetQuittances
    @FK_User_Id   INT,
    @Source       CHAR(1),
    @Token        VARCHAR(MAX),
    @FK_Police_Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        q.Id AS id,
        q.NumQuittance AS numero,
        q.DateDu AS dateDebut,
        q.DateAu AS dateFin,
        ISNULL(q.Montant, 0) AS montantTotal,
        ISNULL(q.Solde, 0) AS montantImpaye,
        q.DateEcheance AS dateEcheance,
        CASE q.Statut 
            WHEN 'E' THEN 'En cours' 
            WHEN 'S' THEN 'Suspendue' 
            WHEN 'R' THEN 'Réglée' 
            WHEN 'M' THEN 'Mise en demeure' 
            WHEN 'A' THEN 'Annulée' 
            ELSE q.Statut 
        END AS statut,
        CASE q.Statut 
            WHEN 'E' THEN 'error' 
            WHEN 'S' THEN 'warning' 
            WHEN 'R' THEN 'success' 
            ELSE 'neutral' 
        END AS statut_variant,
        CASE WHEN q.Statut = 'R' THEN 1 ELSE 0 END AS is_active,
        p.Police AS police
    FROM dbo.Quittances q
    INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE
    (
        (@Source = 'A' AND @UserNature = 'A')
        OR
        (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL AND p.Id = @FK_Police_Id)
        OR
        (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL AND p.Id = @FK_Police_Id)
    );

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetImpayes
-- RÔLE : Récupérer les impayés (toutes polices ou une seule) selon filtre encours
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetImpayes
    @FK_User_Id   INT,
    @Source       CHAR(1),
    @Token        VARCHAR(MAX),
    @FK_Police_Id INT = NULL,
    @Encour       CHAR(1) -- 'O' = seulement solde > 0, 'N' = tous
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    -- Si police spécifique
    IF @FK_Police_Id IS NOT NULL
    BEGIN
        SELECT 
            q.Id AS id,
            q.NumQuittance AS numero,
            q.DateDu AS dateDebut,
            q.DateAu AS dateFin,
            ISNULL(q.Montant, 0) AS montantTotal,
            ISNULL(q.Solde, 0) AS montantImpaye,
            q.DateEcheance AS dateEcheance,
            p.Branche AS branche
        FROM dbo.Quittances q
        INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
        INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
        LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
        WHERE q.FK_Police_Id = @FK_Police_Id
          AND (@Encour = 'N' OR (@Encour = 'O' AND q.Solde > 0))
          AND
          (
              (@Source = 'A' AND @UserNature = 'A')
              OR
              (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
              OR
              (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
          );
    END
    ELSE
    BEGIN
        -- Toutes polices accessibles
        SELECT 
            q.Id AS id,
            q.NumQuittance AS numero,
            p.Police AS numPolice,
            p.Branche AS branche,
            q.DateDu AS dateDebut,
            q.DateAu AS dateFin,
            ISNULL(q.Montant, 0) AS montantTotal,
            ISNULL(q.Solde, 0) AS montantImpaye,
            q.DateEcheance AS dateEcheance
        FROM dbo.Quittances q
        INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
        INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
        LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
        WHERE (@Encour = 'N' OR (@Encour = 'O' AND q.Solde > 0))
          AND
          (
              (@Source = 'A' AND @UserNature = 'A')
              OR
              (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
              OR
              (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
          );
    END

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetAdherents
-- RÔLE : Récupérer les adhérents d'une police
-- ==================================================================================
create or ALTER   PROCEDURE [dbo].[sp_GetAdherents]
    @FK_User_Id   INT,
    @Source       CHAR(1),
    @Token        VARCHAR(MAX),
    @FK_Police_Id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        a.Id AS id,
        a.NomComplet AS nom,
        a.Email AS email,
        a.NumAdhesion AS numAdhesion,
        a.Matricule AS matricule,
        a.DateNaissance AS dateNaissance,
        a.Actif AS actif,
        a.Telephone AS telephone,
        a.FK_User_Id AS fkUserId,
        u.Nom AS userNom
    FROM dbo.Adherents a
    INNER JOIN dbo.Polices p ON a.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    LEFT JOIN dbo.sysUser u ON a.FK_User_Id = u.Id
    WHERE (@Source = 'A' AND @UserNature = 'A') 
      OR
          (
              (p.Id = @FK_Police_Id  )
              AND (
              (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
              OR
              (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
              OR
              (a.FK_User_Id = @FK_User_Id)
              )
          );

    RETURN;
END;

go

-- ==================================================================================
-- PROCÉDURE : sp_GetPersACharge
-- RÔLE : Récupérer les personnes à charge d'un adhérent
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetPersACharge
    @FK_User_Id      INT,
    @Source          CHAR(1),
    @Token           VARCHAR(MAX),
    @FK_Adherent_Id  INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        pc.Id AS id,
        pc.Nom AS nom,
        pc.Lien AS lien,
        pc.DateNaissance AS dateNaissance,
        pc.DateAdhesion AS dateAdhesion
    FROM dbo.PersACharge pc
    INNER JOIN dbo.Adherents a ON pc.FK_Adherent_Id = a.Id
    INNER JOIN dbo.Polices p ON a.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE a.Id = @FK_Adherent_Id
      AND a.Actif = 'O'
      AND
      (
          (@Source = 'A' AND @UserNature = 'A')
          OR
          (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
          OR
          (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
          OR
          (a.FK_User_Id = @FK_User_Id) -- L'adhérent lui-même
      );

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetGarantiesByRisque
-- RÔLE : Récupérer les garanties d'un risque
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetGarantiesByRisque
    @FK_User_Id   INT,
    @Source       CHAR(1),
    @Token        VARCHAR(MAX),
    @FK_Risque_Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        g.Id AS id,
        g.Libelle AS nom,
        ISNULL(g.Capital, 0) AS capital,
        ISNULL(g.Franchise, 0) AS franchise
    FROM dbo.Garanties g
    INNER JOIN dbo.Risques r ON g.FK_Risque_Id = r.Id
    INNER JOIN dbo.Polices p ON r.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE r.Id = @FK_Risque_Id
      AND
      (
          (@Source = 'A' AND @UserNature = 'A')
          OR
          (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
          OR
          (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
          OR
          EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
      );

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetReclamations
-- RÔLE : Récupérer les réclamations
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetReclamations
    @FK_User_Id INT,
    @Source     CHAR(1),
    @Token      VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        r.Id AS id,
        r.DateReclamation AS dateReclamation,
        r.Sujet AS sujet,
        CASE r.Statut 
            WHEN 'E' THEN 'En cours' 
            WHEN 'C' THEN 'Clôturé' 
            WHEN 'T' THEN 'Traité' 
            ELSE r.Statut 
        END AS statut,
        CASE r.Statut 
            WHEN 'E' THEN 'warning' 
            WHEN 'C' THEN 'success' 
            WHEN 'T' THEN 'info' 
            ELSE 'neutral' 
        END AS statut_variant,
        CASE WHEN r.Statut = 'E' THEN 1 ELSE 0 END AS is_active,
        r.DateStatut AS dateStatut,
        CASE r.Nature 
            WHEN 'R' THEN 'Réclamation' 
            WHEN 'D' THEN 'Demande d''info' 
            WHEN 'S' THEN 'Sinistre' 
            ELSE r.Nature 
        END AS nature,
        u.Nom AS client
    FROM dbo.ReclamationsIdt r
    INNER JOIN dbo.sysUser u ON r.FK_User_Client = u.Id
    WHERE (@UserNature = 'A') OR (r.FK_User_Client = @FK_User_Id)
    ORDER BY r.DateReclamation DESC;

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetReclamationDetails
-- RÔLE : Récupérer les détails d'une réclamation (messages)
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetReclamationDetails
    @FK_User_Id        INT,
    @Source            CHAR(1),
    @Token             VARCHAR(MAX),
    @FK_Reclamation_Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    -- Vérification des droits d'accès à la réclamation
    IF NOT EXISTS (
        SELECT 1 FROM dbo.ReclamationsIdt 
        WHERE Id = @FK_Reclamation_Id 
          AND (@UserNature = 'A' OR FK_User_Client = @FK_User_Id)
    )
    BEGIN
        RAISERROR('Réclamation introuvable', 16, 1);
        RETURN;
    END

    DECLARE @LastMsgId INT;
    SELECT @LastMsgId = MAX(Id) FROM dbo.ReclamationsDet WHERE FK_Reclamation_Id = @FK_Reclamation_Id;

    SELECT 
        rd.Id AS id,
        rd.DateMessage AS dateMessage,
        CASE rd.Nature 
            WHEN 'C' THEN 'Client' 
            WHEN 'A' THEN 'Admin' 
            ELSE rd.Nature 
        END AS nature,
        rd.Message AS message,
        rd.FK_User_Id AS fkUserId,
        u.Nom AS envoyeur,
        CASE WHEN rd.FK_User_Id = @FK_User_Id AND rd.Id = @LastMsgId THEN 1 ELSE 0 END AS canDelete
    FROM dbo.ReclamationsDet rd
    INNER JOIN dbo.sysUser u ON rd.FK_User_Id = u.Id
    WHERE rd.FK_Reclamation_Id = @FK_Reclamation_Id
    ORDER BY rd.DateMessage ASC;

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_CreateReclamation
-- RÔLE : Créer une nouvelle réclamation
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_CreateReclamation
    @FK_User_Id INT,
    @Source     CHAR(1),
    @Token      VARCHAR(MAX),
    @Sujet      VARCHAR(255),
    @Nature     CHAR(1),
    @Message    VARCHAR(2000)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @NewId INT;
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    INSERT INTO dbo.ReclamationsIdt (FK_User_Client, Sujet, Nature, Statut, DateStatut)
    VALUES (@FK_User_Id, @Sujet, @Nature, 'E', GETDATE());

    SET @NewId = SCOPE_IDENTITY();

    INSERT INTO dbo.ReclamationsDet (FK_Reclamation_Id, FK_User_Id, Nature, Message)
    VALUES (@NewId, @FK_User_Id, @UserNature, @Message);

    SELECT @NewId AS id;

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_AddMessageReclamation
-- RÔLE : Ajouter un message à une réclamation existante
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_AddMessageReclamation
    @FK_User_Id        INT,
    @Source            CHAR(1),
    @Token             VARCHAR(MAX),
    @FK_Reclamation_Id INT,
    @Nature            CHAR(1),
    @Message           VARCHAR(2000)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    -- Vérification que la réclamation n'est pas clôturée
    IF EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id AND Statut = 'C')
    BEGIN
        RAISERROR('La réclamation est clôturée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    -- Vérification des droits d'accès
    IF NOT EXISTS (
        SELECT 1 FROM dbo.ReclamationsIdt 
        WHERE Id = @FK_Reclamation_Id 
          AND (@UserNature = 'A' OR FK_User_Client = @FK_User_Id)
    )
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.ReclamationsDet (FK_Reclamation_Id, FK_User_Id, Nature, Message)
    VALUES (@FK_Reclamation_Id, @FK_User_Id, @UserNature, @Message);

    -- Mise à jour du statut (Traité si admin, En cours si client)
    UPDATE dbo.ReclamationsIdt 
    SET Statut = CASE WHEN @UserNature = 'A' THEN 'T' ELSE 'E' END, 
        DateStatut = GETDATE() 
    WHERE Id = @FK_Reclamation_Id;

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_UpdateReclamationStatus
-- RÔLE : Changer le statut d'une réclamation (admin uniquement)
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_UpdateReclamationStatus
    @FK_User_Id        INT,
    @Source            CHAR(1),
    @Token             VARCHAR(MAX),
    @FK_Reclamation_Id INT,
    @Statut            CHAR(1)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    -- Seul un admin peut modifier le statut
    IF @UserNature = 'A' AND EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id)
    BEGIN
        UPDATE dbo.ReclamationsIdt 
        SET Statut = @Statut, 
            DateStatut = GETDATE() 
        WHERE Id = @FK_Reclamation_Id;
        RETURN;
    END

    RAISERROR('Action non autorisée', 16, 1);
    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_DeleteMessageReclamation
-- RÔLE : Supprimer son dernier message (client uniquement)
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_DeleteMessageReclamation
    @FK_User_Id INT,
    @Token      VARCHAR(MAX),
    @MessageId  INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    -- Vérification que le message appartient à l'utilisateur
    IF NOT EXISTS (SELECT 1 FROM dbo.ReclamationsDet WHERE Id = @MessageId AND FK_User_Id = @FK_User_Id)
    BEGIN
        RAISERROR('Non autorisé à supprimer ce message', 16, 1);
        RETURN;
    END

    DECLARE @FK_Reclamation_Id INT;
    SELECT @FK_Reclamation_Id = FK_Reclamation_Id FROM dbo.ReclamationsDet WHERE Id = @MessageId;

    -- Vérification que c'est bien le dernier message
    IF EXISTS (SELECT 1 FROM dbo.ReclamationsDet WHERE FK_Reclamation_Id = @FK_Reclamation_Id AND Id > @MessageId)
    BEGIN
        RAISERROR('Impossible de supprimer : ce n''est pas le dernier message', 16, 1);
        RETURN;
    END

    DELETE FROM dbo.ReclamationsDet WHERE Id = @MessageId;
    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetDocumentsByPolice
-- RÔLE : Récupérer les documents associés à une police
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetDocumentsByPolice
    @FK_User_Id   INT,
    @Source       CHAR(1),
    @Token        VARCHAR(MAX),
    @FK_Police_Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        d.Id AS id,
        d.fk_police_id AS fkPoliceId,
        d.fk_document_id AS fkDocumentId,
        d.libelle AS libelle
    FROM dbo.PolDocument d
    INNER JOIN dbo.Polices p ON d.fk_police_id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE p.Id = @FK_Police_Id
      AND
      (
          (@Source = 'A' AND @UserNature = 'A')
          OR
          (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
          OR
          (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
          OR
          EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
      );

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_GetStats
-- RÔLE : Récupérer les statistiques globales
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetStats
    @FK_User_Id INT,
    @Source     CHAR(1),
    @Token      VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    -- Statistiques globales
    SELECT 
        (SELECT COUNT(DISTINCT p.Id) 
         FROM dbo.Polices p
         INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         WHERE
         (
             (@Source = 'A' AND @UserNature = 'A')
             OR (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
             OR (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
             OR EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
         )) AS totalPolices,

        (SELECT COUNT(*) 
         FROM dbo.Sinistres s
         INNER JOIN dbo.Polices p ON s.FK_Police_Id = p.Id
         INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         WHERE s.Statut = 'E'
           AND
           (
               (@Source = 'A' AND @UserNature = 'A')
               OR (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
               OR (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
               OR EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
           )) AS sinistresEnCours,

        (SELECT ISNULL(SUM(q.Montant), 0) 
         FROM dbo.Quittances q
         INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
         INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         WHERE YEAR(q.DateDu) = YEAR(GETDATE())
           AND
           (
               (@Source = 'A' AND @UserNature = 'A')
               OR (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
               OR (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
           )) AS primeAnnuelle,

        (SELECT ISNULL(SUM(q.Solde), 0) 
         FROM dbo.Quittances q
         INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
         INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         WHERE q.Solde > 0
           AND
           (
               (@Source = 'A' AND @UserNature = 'A')
               OR (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
               OR (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
           )) AS totalImpayes;

    -- Répartition par branche
    SELECT 
        p.Branche AS label, 
        COUNT(*) AS value
    FROM dbo.Polices p
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE
    (
        (@Source = 'A' AND @UserNature = 'A')
        OR (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
        OR (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
        OR EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
    )
    GROUP BY p.Branche;

    -- Évolution mensuelle
    SELECT 
        FORMAT(q.DateDu, 'MMM', 'fr-FR') AS month,
        MONTH(q.DateDu) AS month_num,
        SUM(ISNULL(q.Montant, 0)) AS total,
        SUM(ISNULL(q.Solde, 0)) AS impayes
    FROM dbo.Quittances q
    INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE YEAR(q.DateDu) = YEAR(GETDATE())
      AND
      (
          (@Source = 'A' AND @UserNature = 'A')
          OR (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
          OR (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
      )
    GROUP BY FORMAT(q.DateDu, 'MMM', 'fr-FR'), MONTH(q.DateDu)
    ORDER BY MONTH(q.DateDu);

    -- Prime par branche
    SELECT 
        p.Branche AS branche,
        SUM(ISNULL(q.Montant, 0)) AS totalPrime,
        SUM(ISNULL(q.Solde, 0)) AS totalImpaye
    FROM dbo.Quittances q
    INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE YEAR(q.DateDu) = YEAR(GETDATE())
      AND
      (
          (@Source = 'A' AND @UserNature = 'A')
          OR (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
          OR (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
      )
    GROUP BY p.Branche;

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : ps_GetStatsByPolice
-- RÔLE : Récupérer les statistiques d'une police spécifique
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.ps_GetStatsByPolice
    @FK_User_Id   INT,
    @Token        VARCHAR(MAX),
    @Source       VARCHAR(50),
    @FK_Police_Id INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    -- Vérification des droits d'accès à la police
    IF NOT EXISTS (
        SELECT 1 FROM dbo.Polices p
        INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
        LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
        WHERE p.Id = @FK_Police_Id
          AND
          (
              (@Source = 'A' AND @UserNature = 'A')
              OR (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
              OR (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
              OR EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
          )
    )
    BEGIN
        RAISERROR('Accès refusé à cette police', 16, 1);
        RETURN;
    END

    DECLARE @PrimeAnnuelle DECIMAL(18,2) = 0;
    DECLARE @Impayes DECIMAL(18,2) = 0;
    DECLARE @NbRisques INT = 0;
    DECLARE @NbAdherents INT = 0;
    DECLARE @NbSinistres INT = 0;
    DECLARE @NbSinistresEnCours INT = 0;

    SELECT @PrimeAnnuelle = ISNULL(SUM(Montant), 0)
    FROM dbo.Quittances 
    WHERE FK_Police_Id = @FK_Police_Id;

    SELECT @Impayes = ISNULL(SUM(Solde), 0)
    FROM dbo.Quittances 
    WHERE FK_Police_Id = @FK_Police_Id AND Solde > 0;

    SELECT @NbRisques = COUNT(*)
    FROM dbo.Risques 
    WHERE FK_Police_Id = @FK_Police_Id AND Statut = 'O';

    SELECT @NbAdherents = COUNT(*)
    FROM dbo.Adherents 
    WHERE FK_Police_Id = @FK_Police_Id;

    SELECT @NbSinistres = COUNT(*)
    FROM dbo.Sinistres
    WHERE FK_Police_Id = @FK_Police_Id;

    SELECT @NbSinistresEnCours = COUNT(*)
    FROM dbo.Sinistres
    WHERE FK_Police_Id = @FK_Police_Id AND Statut = 'E';

    SELECT 
        @PrimeAnnuelle AS primeAnnuelle,
        @Impayes AS impayes,
        @NbRisques AS nbRisques,
        @NbAdherents AS nbAdherents,
        @NbSinistres AS nbSinistres,
        @NbSinistresEnCours AS nbSinistresEnCours;

    RETURN;
END;
GO

-- ==================================================================================
-- PROCÉDURE : sp_DeleteReclamation
-- RÔLE : Supprimer une réclamation
-- ==================================================================================
CREATE OR ALTER PROCEDURE dbo.sp_DeleteReclamation
    @FK_User_Id        INT,
    @Source            CHAR(1),
    @Token             VARCHAR(MAX),
    @FK_Reclamation_Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    -- Seul l'auteur de la réclamation peut la supprimer (ou admin)
    IF EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id AND (FK_User_Client = @FK_User_Id OR @UserNature = 'A'))
    BEGIN
        DELETE FROM dbo.ReclamationsDet WHERE FK_Reclamation_Id = @FK_Reclamation_Id;
        DELETE FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id;
        RETURN;
    END

    RAISERROR('Action non autorisée', 16, 1);
    RETURN;
END;
GO