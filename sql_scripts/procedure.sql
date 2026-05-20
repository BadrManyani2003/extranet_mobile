USE [IBS_Extranet_Mobile]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetPolices
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX)
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
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    INNER JOIN dbo.Compagnies com ON p.FK_Compagnie_Id = com.Id
    WHERE 
        (@Source = 'A' AND @UserNature = 'A')
        OR (
            uxc.FK_User_Id IS NOT NULL 
            AND (
                (@Source = 'M' AND c.Particulier = 'O')
                OR (@Source = 'E' AND c.Particulier = 'N')
            )
        )
        OR EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O');
    
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetSinistres
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
            WHEN p.Branche = 'Santé' THEN CAST(a.NumAdhesion AS VARCHAR(50))
            ELSE r.Identifiant
        END AS identifiant,
        p.Id AS policeId,
        p.Police AS police,
        p.Branche AS branche
    FROM dbo.Sinistres s
    INNER JOIN dbo.Polices p ON s.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.Risques r ON s.FK_Risque_Id = r.Id
    LEFT JOIN dbo.Adherents a ON s.FK_Adherent_Id = a.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE (@FK_Police_Id IS NULL OR s.FK_Police_Id = @FK_Police_Id)
      AND
      (
          (@Source = 'A' AND @UserNature = 'A')
          OR
          (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
          OR
          (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
          OR
          (s.FK_Adherent_Id IN (SELECT Id FROM dbo.Adherents WHERE FK_User_Id = @FK_User_Id AND Actif = 'O'))
      );

    RETURN;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetSinistresEncour
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
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
            WHEN p.Branche = 'Santé' THEN CAST(a.NumAdhesion AS VARCHAR(50))
            ELSE r.Identifiant
        END AS identifiant,
        p.Id AS policeId,
        p.Police AS police,
        p.Branche AS branche
    FROM dbo.Sinistres s
    INNER JOIN dbo.Polices p ON s.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.Risques r ON s.FK_Risque_Id = r.Id
    LEFT JOIN dbo.Adherents a ON s.FK_Adherent_Id = a.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE s.Statut = 'E'
        AND (@FK_Police_Id IS NULL OR s.FK_Police_Id = @FK_Police_Id)
        AND (
            (@Source = 'A' AND @UserNature = 'A')
            OR
            (@Source = 'E' AND @UserNature = 'C' AND c.Particulier = 'N' AND uxc.FK_User_Id IS NOT NULL)
            OR
            (@Source = 'M' AND @UserNature = 'C' AND c.Particulier = 'O' AND uxc.FK_User_Id IS NOT NULL)
            OR
            (s.FK_Adherent_Id IN (SELECT Id FROM dbo.Adherents WHERE FK_User_Id = @FK_User_Id AND Actif = 'O'))
        );
    
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetRisques]
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
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
    WHERE (
            (p.Id = @FK_Police_Id
                AND (
                    (@Source = 'A' AND @UserNature = 'A')
                    OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
                )
            )
            OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            OR EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
        );
    
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetQuittances
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
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
    WHERE (
            (p.Id = @FK_Police_Id
                AND (
                    (@Source = 'A' AND @UserNature = 'A')
                    OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
                )
            )
            OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
        );
    
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetImpayes]
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
    @FK_Police_Id INT,
    @Encour CHAR(1)
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
        WHERE ((@Encour = 'O' AND q.Solde > 0) OR (@Encour = 'N'))
            AND (
                (p.Id = @FK_Police_Id
                    AND (
                        (@Source = 'A' AND @UserNature = 'A')
                        OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
                    )
                )
                OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            );
    END
    ELSE
    BEGIN
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
        WHERE ((@Encour = 'O' AND q.Solde > 0) OR (@Encour = 'N'))
            AND (
                (@Source = 'A' AND @UserNature = 'A')
                OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            );
    END

    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetAdherents
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
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
    WHERE (@Source = 'A' OR @FK_Police_Id IS NULL OR p.Id = @FK_Police_Id)
        AND a.Actif = 'O'
        AND (
            (@Source = 'A' AND @UserNature = 'A')
            OR
            (uxc.FK_User_Id IS NOT NULL AND (@Source = 'E' AND c.Particulier = 'N'))
            OR
            (uxc.FK_User_Id IS NOT NULL AND (@Source = 'M' AND c.Particulier = 'O'))
            OR
            (a.FK_User_Id = @FK_User_Id)
        );
    
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetPersACharge
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
    @FK_Adherent_Id INT
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
        AND (
            (@Source = 'A' AND @UserNature = 'A')
            OR
            (a.FK_User_Id = @FK_User_Id)
            OR
            (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
        );
    
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetGarantiesByRisque
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
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
        AND (
            (@Source = 'A' AND @UserNature = 'A')
            OR
            (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            OR
            EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
        );
    
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetReclamations
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX)
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
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetReclamationDetails
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
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

    IF EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id 
               AND (@UserNature = 'A' OR FK_User_Client = @FK_User_Id))
    BEGIN
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
    END
    
    RAISERROR('Réclamation introuvable', 16, 1);
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_CreateReclamation
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
    @Sujet VARCHAR(255),
    @Nature CHAR(1),
    @Message VARCHAR(2000)
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
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_AddMessageReclamation
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
    @FK_Reclamation_Id INT,
    @Nature CHAR(1),
    @Message VARCHAR(2000)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id AND Statut = 'C')
    BEGIN
        RAISERROR('La réclamation est clôturée', 16, 1);
        RETURN;
    END

    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF EXISTS (SELECT 1 FROM dbo.ReclamationsIdt 
               WHERE Id = @FK_Reclamation_Id 
               AND (@UserNature = 'A' OR FK_User_Client = @FK_User_Id))
    BEGIN
        INSERT INTO dbo.ReclamationsDet (FK_Reclamation_Id, FK_User_Id, Nature, Message)
        VALUES (@FK_Reclamation_Id, @FK_User_Id, @UserNature, @Message);

        UPDATE dbo.ReclamationsIdt 
        SET Statut = CASE WHEN @Source IN ('A', 'E', 'M') THEN 'T' ELSE 'E' END, 
            DateStatut = GETDATE() 
        WHERE Id = @FK_Reclamation_Id;
        
        RETURN;
    END
    
    RAISERROR('Action non autorisée', 16, 1);
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_UpdateReclamationStatus
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
    @FK_Reclamation_Id INT,
    @Statut CHAR(1)
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
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_SaveUser
    @FK_User_Id    INT,
    @Token         VARCHAR(MAX),
    @Source        VARCHAR(50),
    @FK_Target_Id  INT,
    @Id_Auth       VARCHAR(255),
    @Nom           VARCHAR(255),
    @Telephone     VARCHAR(20),
    @Email         VARCHAR(255),
    @Nature        CHAR(1),
    @Extranet      CHAR(1),
    @Mobile        CHAR(1)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT (@Source = 'A' AND @UserNature = 'A')
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.sysUser WHERE Email = @Email AND Id <> @FK_Target_Id)
    BEGIN
        RAISERROR('Email déjà utilisé', 16, 1);
        RETURN;
    END

    IF @FK_Target_Id = 0
    BEGIN
        INSERT INTO dbo.sysUser (Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile)
        VALUES (@Id_Auth, @Nom, @Telephone, @Email, @Nature, @Extranet, @Mobile);
        SELECT SCOPE_IDENTITY() AS newId;
    END
    ELSE
    BEGIN
        UPDATE dbo.sysUser
        SET Id_Auth = @Id_Auth, Nom = @Nom, Telephone = @Telephone,
            Email = @Email, Nature = @Nature, Extranet = @Extranet, Mobile = @Mobile
        WHERE Id = @FK_Target_Id;
        SELECT @FK_Target_Id AS newId;
    END
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_DeleteUser
    @FK_User_Id    INT,
    @Token         VARCHAR(MAX),
    @Source        VARCHAR(50),
    @FK_Delete_Id  INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT (@Source = 'A' AND @UserNature = 'A')
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM UsersXClients  WHERE FK_User_Id = @FK_Delete_Id)
    BEGIN
        RAISERROR('Impossible de supprimer : cet utilisateur est lié à un client', 16, 1);
        RETURN;
    END
    
    IF EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_User_Id = @FK_Delete_Id)
    BEGIN
        RAISERROR('Impossible de supprimer : cet utilisateur est lié à un adhérent', 16, 1);
        RETURN;
    END
    
    DELETE FROM dbo.Roles            WHERE FK_User_Id = @FK_Delete_Id;
    DELETE FROM dbo.Postes_Autorises WHERE FK_User_Id = @FK_Delete_Id;
    DELETE FROM dbo.UsersXClients    WHERE FK_User_Id = @FK_Delete_Id;
    DELETE FROM dbo.sysUser          WHERE Id         = @FK_Delete_Id;
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_GetClients
    @FK_User_Id   INT,
    @Token        VARCHAR(MAX),
    @Source       VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF @Source = 'A' AND @UserNature = 'A'
    BEGIN
        SELECT 
            c.Id AS id,
            c.RaisonSociale AS raisonSociale,
            c.Particulier AS particulier,
            c.Email AS email,
            c.Adresse AS adresse,
            c.recClt AS recClt,
            c.recAdh AS recAdh,
            cParent.RaisonSociale AS parentClient,
            STUFF((
                SELECT ', ' + u.Nom
                FROM dbo.UsersXClients x
                INNER JOIN dbo.sysUser u ON x.FK_User_Id = u.Id
                WHERE x.FK_Client_Id = c.Id
                FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS userNom,
            STUFF((
                SELECT ', ' + CAST(x.FK_User_Id AS VARCHAR)
                FROM dbo.UsersXClients x
                WHERE x.FK_Client_Id = c.Id
                FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS fkUserId
        FROM dbo.Clients c
        LEFT JOIN dbo.Clients cParent ON c.Fk_Client_Id = cParent.Id
        ORDER BY c.RaisonSociale;
    END
    ELSE
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
    END
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_CreateUserFromClient
    @FK_User_Id   INT,
    @Token        VARCHAR(MAX),
    @Source       VARCHAR(50),
    @FK_Client_Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT (@Source = 'A' AND @UserNature = 'A')
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END
    
    DECLARE @Nom VARCHAR(255), @Email VARCHAR(255), @NewUserId INT;
    SELECT @Nom = RaisonSociale, @Email = Email FROM dbo.Clients WHERE Id = @FK_Client_Id;
    
    IF @Nom IS NULL
    BEGIN
        RAISERROR('Client introuvable', 16, 1);
        RETURN;
    END
    
    IF EXISTS (SELECT 1 FROM dbo.sysUser WHERE Email = @Email)
    BEGIN
        RAISERROR('Email déjà utilisé', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.sysUser (Nom, Email, Nature, Extranet, Mobile) 
    VALUES (@Nom, @Email, 'C', 'O', 'N');
    
    SET @NewUserId = SCOPE_IDENTITY();
    
    INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif)
    VALUES (@NewUserId, @FK_Client_Id, 'O');
    
    SELECT 
        Id AS id,
        Id_Auth AS idAuth,
        token,
        Nom AS nom,
        Telephone AS telephone,
        Email AS email,
        Nature AS nature,
        Extranet AS extranet,
        Mobile AS mobile,
        CreatedAt AS createdAt,
        UpdatedAt AS updatedAt
    FROM dbo.sysUser WHERE Id = @NewUserId;
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_CreateUserFromAdherent
    @FK_User_Id     INT,
    @Token          VARCHAR(MAX),
    @Source         VARCHAR(50),
    @FK_Adherent_Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT (@Source = 'A' AND @UserNature = 'A')
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END
    
    DECLARE @Nom VARCHAR(255), @Email VARCHAR(255), @NewUserId INT;
    SELECT @Nom = NomComplet, @Email = Email FROM dbo.Adherents WHERE Id = @FK_Adherent_Id;
    
    IF @Nom IS NULL
    BEGIN
        RAISERROR('Adhérent introuvable', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.sysUser WHERE Email = @Email)
    BEGIN
        RAISERROR('Email déjà utilisé', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.sysUser (Nom, Email, Nature, Extranet, Mobile) 
    VALUES (@Nom, @Email, 'C', 'N', 'O');
    
    SET @NewUserId = SCOPE_IDENTITY();
    UPDATE dbo.Adherents SET FK_User_Id = @NewUserId WHERE Id = @FK_Adherent_Id;
    
    SELECT 
        Id AS id,
        Id_Auth AS idAuth,
        token,
        Nom AS nom,
        Telephone AS telephone,
        Email AS email,
        Nature AS nature,
        Extranet AS extranet,
        Mobile AS mobile,
        CreatedAt AS createdAt,
        UpdatedAt AS updatedAt
    FROM dbo.sysUser WHERE Id = @NewUserId;
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_GetUsers
    @FK_User_Id INT,
    @Token      VARCHAR(MAX),
    @Source     VARCHAR(50)
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

    IF @Source = 'A' AND @UserNature = 'A'
    BEGIN
        SELECT 
            u.Id AS id,
            u.Id_Auth AS idAuth,
            u.token,
            u.Nom AS nom,
            u.Telephone AS telephone,
            u.Email AS email,
            u.Nature AS nature,
            u.Extranet AS extranet,
            u.Mobile AS mobile,
            u.CreatedAt AS createdAt,
            u.UpdatedAt AS updatedAt,
            STUFF((
                SELECT ', ' + r.Role
                FROM dbo.Roles r
                WHERE r.FK_User_Id = u.Id
                FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS roles
        FROM dbo.sysUser u ORDER BY u.Nom;
    END
    ELSE
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
    END
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetStats]
    @FK_User_Id INT,
    @Source     CHAR(1),
    @Token      VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    SELECT 
        (SELECT COUNT(DISTINCT p.Id) FROM dbo.Polices p 
         LEFT JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         LEFT JOIN dbo.Adherents a ON p.Id = a.FK_Police_Id AND a.FK_User_Id = @FK_User_Id AND a.Actif = 'O'
         WHERE (@Source = 'A' AND @UserNature = 'A')
            OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            OR a.Id IS NOT NULL) AS totalPolices,

        (SELECT COUNT(*) FROM dbo.Sinistres s
         JOIN dbo.Polices p ON s.FK_Police_Id = p.Id
         JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         WHERE s.Statut = 'E'
           AND (
            (@Source = 'A' AND @UserNature = 'A')
            OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            OR s.FK_Adherent_Id IN (SELECT Id FROM dbo.Adherents WHERE FK_User_Id = @FK_User_Id AND Actif = 'O')
           )) AS sinistresEnCours,

        (SELECT ISNULL(SUM(q.Montant), 0) FROM dbo.Quittances q
         JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
         JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         WHERE YEAR(q.DateDu) = YEAR(GETDATE())
           AND (
            (@Source = 'A' AND @UserNature = 'A')
            OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
           )) AS primeAnnuelle,

        (SELECT ISNULL(SUM(q.Solde), 0) FROM dbo.Quittances q
         JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
         JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         WHERE q.Solde > 0
           AND (
            (@Source = 'A' AND @UserNature = 'A')
            OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
           )) AS totalImpayes;

    SELECT 
        p.Branche AS label, 
        COUNT(*) AS value
    FROM dbo.Polices p
    LEFT JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    LEFT JOIN dbo.Adherents a ON p.Id = a.FK_Police_Id AND a.FK_User_Id = @FK_User_Id AND a.Actif = 'O'
    WHERE (@Source = 'A' AND @UserNature = 'A')
       OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
       OR a.Id IS NOT NULL
    GROUP BY p.Branche;

    SELECT 
        FORMAT(q.DateDu, 'MMM', 'fr-FR') AS month,
        MONTH(q.DateDu) AS month_num,
        SUM(ISNULL(q.Montant, 0)) AS total,
        SUM(ISNULL(q.Solde, 0)) AS impayes
    FROM dbo.Quittances q
    INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
    LEFT JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE (
        (@Source = 'A' AND @UserNature = 'A')
        OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
      )
      AND YEAR(q.DateDu) = YEAR(GETDATE())
    GROUP BY FORMAT(q.DateDu, 'MMM', 'fr-FR'), MONTH(q.DateDu)
    ORDER BY MONTH(q.DateDu);

    SELECT 
        p.Branche AS branche,
        SUM(ISNULL(q.Montant, 0)) AS totalPrime,
        SUM(ISNULL(q.Solde, 0)) AS totalImpaye
    FROM dbo.Quittances q
    INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
    LEFT JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE (
        (@Source = 'A' AND @UserNature = 'A')
        OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
      )
      AND YEAR(q.DateDu) = YEAR(GETDATE())
    GROUP BY p.Branche;

    RETURN;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[ps_GetStatsByPolice]
    @FK_User_Id   INT,
    @Token        VARCHAR(MAX),
    @Source       VARCHAR(50),
    @FK_Police_Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.Polices p
        LEFT JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
        LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
        WHERE p.Id = @FK_Police_Id
          AND (
              (@Source = 'A' AND @UserNature = 'A')
              OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
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
    WHERE FK_Police_Id = @FK_Police_Id 
      AND Solde > 0;

    SELECT @NbRisques = COUNT(*)
    FROM dbo.Risques 
    WHERE FK_Police_Id = @FK_Police_Id 
      AND Statut = 'O';

    SELECT @NbAdherents = COUNT(*)
    FROM dbo.Adherents 
    WHERE FK_Police_Id = @FK_Police_Id;

    SELECT @NbSinistres = COUNT(*)
    FROM dbo.Sinistres s
    WHERE s.FK_Police_Id = @FK_Police_Id;
    
    SELECT @NbSinistresEnCours = COUNT(*)
    FROM dbo.Sinistres s
    WHERE s.FK_Police_Id = @FK_Police_Id 
      AND s.Statut = 'E';

    SELECT 
        @PrimeAnnuelle AS primeAnnuelle,
        @Impayes AS impayes,
        @NbRisques AS nbRisques,
        @NbAdherents AS nbAdherents,
        @NbSinistres AS nbSinistres,
        @NbSinistresEnCours AS nbSinistresEnCours;
END
GO

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

    IF EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id AND (@Source IN ('E', 'M') OR FK_User_Client = @FK_User_Id))
    BEGIN
        DELETE FROM dbo.ReclamationsDet WHERE FK_Reclamation_Id = @FK_Reclamation_Id;
        DELETE FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id;
        RETURN;
    END
    
    RAISERROR('Action non autorisée', 16, 1);
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetReclamationStatut
    @ReclamationId INT
AS
BEGIN
    SELECT Statut FROM dbo.ReclamationsIdt WHERE Id = @ReclamationId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_UpdateToken
    @Token  VARCHAR(MAX),
    @IdAuth VARCHAR(255)
AS
BEGIN
    UPDATE dbo.sysUser SET token = @Token, UpdatedAt = GETDATE() WHERE Id_Auth = @IdAuth;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetUserInfoByAuthId
    @IdAuth VARCHAR(255)
AS
BEGIN
    DECLARE @FK_User_Id INT;
    DECLARE @UserNature CHAR(1);
    DECLARE @canReclaim CHAR(1) = 'N';
    
    SELECT @FK_User_Id = Id, @UserNature = Nature 
    FROM dbo.sysUser 
    WHERE Id_Auth = @IdAuth;

    IF @UserNature = 'A'
    BEGIN
        SET @canReclaim = 'O';
    END
    ELSE IF EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_User_Id = @FK_User_Id AND Actif = 'O')
    BEGIN
        IF EXISTS (
            SELECT 1 
            FROM dbo.Adherents a
            INNER JOIN dbo.Polices p ON a.FK_Police_Id = p.Id
            INNER JOIN dbo.Clients c ON p.FK_Client_Id = c.Id
            WHERE a.FK_User_Id = @FK_User_Id AND a.Actif = 'O' AND c.recAdh = 'O'
        )
        BEGIN
            SET @canReclaim = 'O';
        END
    END
    ELSE IF EXISTS (SELECT 1 FROM dbo.UsersXClients WHERE FK_User_Id = @FK_User_Id AND Actif = 'O')
    BEGIN
        IF EXISTS (
            SELECT 1 
            FROM dbo.UsersXClients uxc
            INNER JOIN dbo.Clients c ON uxc.FK_Client_Id = c.Id
            WHERE uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O' AND c.recClt = 'O'
        )
        BEGIN
            SET @canReclaim = 'O';
        END
    END

    SELECT 
        Id AS id, 
        Nom AS nom, 
        CASE 
            WHEN CHARINDEX('@', Email) > 1 
            THEN STUFF(Email, 2, CHARINDEX('@', Email) - 2, '*****') 
            ELSE Email 
        END AS email, 
        Mobile AS mobile, 
        Extranet AS extranet,
        @canReclaim AS reclamation
    FROM dbo.sysUser 
    WHERE Id_Auth = @IdAuth;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetUserByAuthId
    @IdAuth VARCHAR(255)
AS
BEGIN
    SELECT Id AS id, token, Extranet AS extranet, Mobile AS mobile 
    FROM dbo.sysUser 
    WHERE Id_Auth = @IdAuth;
END
GO

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

    IF NOT EXISTS (SELECT 1 FROM dbo.ReclamationsDet WHERE Id = @MessageId AND FK_User_Id = @FK_User_Id)
    BEGIN
        RAISERROR('Non autorisé à supprimer ce message', 16, 1);
        RETURN;
    END

    DECLARE @FK_Reclamation_Id INT;
    SELECT @FK_Reclamation_Id = FK_Reclamation_Id FROM dbo.ReclamationsDet WHERE Id = @MessageId;

    IF EXISTS (SELECT 1 FROM dbo.ReclamationsDet WHERE FK_Reclamation_Id = @FK_Reclamation_Id AND Id > @MessageId)
    BEGIN
        RAISERROR('Impossible de supprimer : ce n''est pas le dernier message', 16, 1);
        RETURN;
    END

    DELETE FROM dbo.ReclamationsDet WHERE Id = @MessageId;
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_LinkUserToClient
    @FK_User_Id     INT,
    @Token          VARCHAR(MAX),
    @Source         VARCHAR(50),
    @FK_Target_User_Id INT,
    @FK_Client_Id   INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT (@Source = 'A' AND @UserNature = 'A')
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.UsersXClients WHERE FK_Client_Id = @FK_Client_Id AND FK_User_Id = @FK_Target_User_Id)
    BEGIN
        RAISERROR('Cet utilisateur est déjà lié à ce client', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif)
    VALUES (@FK_Target_User_Id, @FK_Client_Id, 'O');
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_UnlinkUserFromClient
    @FK_User_Id     INT,
    @Token          VARCHAR(MAX),
    @Source         VARCHAR(50),
    @FK_Target_User_Id INT,
    @FK_Client_Id   INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT (@Source = 'A' AND @UserNature = 'A')
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END

    DELETE FROM dbo.UsersXClients 
    WHERE FK_User_Id = @FK_Target_User_Id AND FK_Client_Id = @FK_Client_Id;
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_LinkUserToAdherent
    @FK_User_Id     INT,
    @Token          VARCHAR(MAX),
    @Source         VARCHAR(50),
    @FK_Target_User_Id INT,
    @FK_Adherent_Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT (@Source = 'A' AND @UserNature = 'A')
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END

    UPDATE dbo.Adherents SET FK_User_Id = @FK_Target_User_Id WHERE Id = @FK_Adherent_Id;
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_SyncKeycloak
    @FK_User_Id    INT,
    @Token         VARCHAR(MAX),
    @Source        VARCHAR(50),
    @IdToSync      INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT (@Source = 'A' AND @UserNature = 'A')
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END

    UPDATE dbo.sysUser 
    SET UpdatedAt = GETDATE()
    WHERE Id = @IdToSync;

    SELECT 1 as success;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetDocumentsByPolice
    @FK_User_Id INT,
    @Source CHAR(1),
    @Token VARCHAR(MAX),
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
        AND (
            (@Source = 'A' AND @UserNature = 'A')
            OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            OR EXISTS (SELECT 1 FROM dbo.Adherents WHERE FK_Police_Id = p.Id AND FK_User_Id = @FK_User_Id AND Actif = 'O')
        );
    
    RETURN;
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_UpdateUserRoles
    @FK_User_Id    INT,
    @Token         VARCHAR(MAX),
    @Source        VARCHAR(50),
    @Target_User_Id INT,
    @RolesCSV      VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT (@Source = 'A' AND @UserNature = 'A')
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END

    DELETE FROM dbo.Roles WHERE FK_User_Id = @Target_User_Id;

    INSERT INTO dbo.Roles (FK_User_Id, Role)
    SELECT @Target_User_Id, value
    FROM STRING_SPLIT(@RolesCSV, ',');

    SELECT 1 as success;
END
GO

CREATE OR ALTER PROCEDURE dbo.ps_UpdateClientOptions
    @FK_User_Id    INT,
    @Token         VARCHAR(MAX),
    @Source        VARCHAR(50),
    @FK_Client_Id  INT,
    @recClt        CHAR(1),
    @recAdh        CHAR(1)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserNature CHAR(1);
    SELECT @UserNature = Nature FROM dbo.sysUser WHERE Id = @FK_User_Id;

    IF NOT (@Source = 'A' AND @UserNature = 'A')
    BEGIN
        RAISERROR('Action non autorisée', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Clients WHERE Id = @FK_Client_Id)
    BEGIN
        RAISERROR('Client introuvable', 16, 1);
        RETURN;
    END

    UPDATE dbo.Clients
    SET recClt = @recClt,
        recAdh = @recAdh
    WHERE Id = @FK_Client_Id;

    SELECT 1 as success;
END
GO