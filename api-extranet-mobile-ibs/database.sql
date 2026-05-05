USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'IBS_Extranet_Mobile')
    CREATE DATABASE IBS_Extranet_Mobile;
GO

USE IBS_Extranet_Mobile;
GO

IF OBJECT_ID('dbo.ReclamationsDet',  'U') IS NOT NULL DROP TABLE dbo.ReclamationsDet;
IF OBJECT_ID('dbo.ReclamationsIdt',  'U') IS NOT NULL DROP TABLE dbo.ReclamationsIdt;
IF OBJECT_ID('dbo.Garanties',        'U') IS NOT NULL DROP TABLE dbo.Garanties;
IF OBJECT_ID('dbo.Sinistres',        'U') IS NOT NULL DROP TABLE dbo.Sinistres;
IF OBJECT_ID('dbo.Quittances',       'U') IS NOT NULL DROP TABLE dbo.Quittances;
IF OBJECT_ID('dbo.PersACharge',      'U') IS NOT NULL DROP TABLE dbo.PersACharge;
IF OBJECT_ID('dbo.Adherents',        'U') IS NOT NULL DROP TABLE dbo.Adherents;
IF OBJECT_ID('dbo.Risques',          'U') IS NOT NULL DROP TABLE dbo.Risques;
IF OBJECT_ID('dbo.Polices',          'U') IS NOT NULL DROP TABLE dbo.Polices;
IF OBJECT_ID('dbo.UsersXClients',    'U') IS NOT NULL DROP TABLE dbo.UsersXClients;
IF OBJECT_ID('dbo.Clients',          'U') IS NOT NULL DROP TABLE dbo.Clients;
IF OBJECT_ID('dbo.Compagnies',       'U') IS NOT NULL DROP TABLE dbo.Compagnies;
IF OBJECT_ID('dbo.Roles',            'U') IS NOT NULL DROP TABLE dbo.Roles;
IF OBJECT_ID('dbo.userConnection',   'U') IS NOT NULL DROP TABLE dbo.userConnection;
IF OBJECT_ID('dbo.Postes_Autorises', 'U') IS NOT NULL DROP TABLE dbo.Postes_Autorises;
IF OBJECT_ID('dbo.sysUser',          'U') IS NOT NULL DROP TABLE dbo.sysUser;
GO

CREATE TABLE dbo.sysUser (
    Id          INT           NOT NULL IDENTITY(1,1),
    Id_Auth     VARCHAR(255)  NULL,
    token       VARCHAR(1000) NULL,
    Nom         VARCHAR(255)  NOT NULL,
    Telephone   VARCHAR(20)   NULL,
    Email       VARCHAR(255)  NULL,
    Nature      CHAR(1)       NULL,
    Extranet    CHAR(1)       NULL DEFAULT 'N',
    Mobile      CHAR(1)       NULL DEFAULT 'N',
    CONSTRAINT PK_sysUser       PRIMARY KEY (Id),
    CONSTRAINT UQ_sysUser_Email UNIQUE (Email)
);
GO

CREATE TABLE dbo.Postes_Autorises (
    Id             INT          NOT NULL IDENTITY(1,1),
    FK_User_Id     INT          NOT NULL,
    Libelle        VARCHAR(255) NOT NULL,
    Identifiant    VARCHAR(255) NULL,
    Actif          CHAR(1)      NULL DEFAULT 'O',
    DateActivation DATETIME     NULL,
    CONSTRAINT PK_Postes_Autorises  PRIMARY KEY (Id),
    CONSTRAINT FK_PostesAut_User    FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id)
);
GO

CREATE TABLE dbo.userConnection (
    Id             INT      NOT NULL IDENTITY(1,1),
    FK_User_Id     INT      NOT NULL,
    FK_Poste_Id    INT      NOT NULL,
    DateConnection DATETIME NULL,
    DateSortie     DATETIME NULL,
    CONSTRAINT PK_userConnection PRIMARY KEY (Id),
    CONSTRAINT FK_userConn_User  FOREIGN KEY (FK_User_Id)  REFERENCES dbo.sysUser(Id),
    CONSTRAINT FK_userConn_Poste FOREIGN KEY (FK_Poste_Id) REFERENCES dbo.Postes_Autorises(Id)
);
GO

CREATE TABLE dbo.Roles (
    Id         INT          NOT NULL IDENTITY(1,1),
    FK_User_Id INT          NOT NULL,
    Role       VARCHAR(100) NOT NULL,
    CONSTRAINT PK_Roles      PRIMARY KEY (Id),
    CONSTRAINT FK_Roles_User FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id)
);
GO

CREATE TABLE dbo.Compagnies (
    Id            INT          NOT NULL IDENTITY(1,1),
    RaisonSociale VARCHAR(255) NOT NULL,
    CONSTRAINT PK_Compagnies PRIMARY KEY (Id)
);
GO

CREATE TABLE dbo.Clients (
    Id            INT          NOT NULL,
    Fk_Client_Id  INT          NULL,
    FK_User_Id    INT          NULL,
    RaisonSociale VARCHAR(255) NOT NULL,
    Particulier   CHAR(1)      NULL DEFAULT 'N',
    Email         VARCHAR(255) NULL,
    Adresse       VARCHAR(500) NULL,
    CONSTRAINT PK_Clients        PRIMARY KEY (Id),
    CONSTRAINT FK_Clients_Parent FOREIGN KEY (Fk_Client_Id) REFERENCES dbo.Clients(Id),
    CONSTRAINT FK_Clients_User   FOREIGN KEY (FK_User_Id)   REFERENCES dbo.sysUser(Id),
    CONSTRAINT UQ_Clients_Email  UNIQUE (Email)
);
GO

CREATE TABLE dbo.UsersXClients (
    FK_User_Id   INT     NOT NULL,
    FK_Client_Id INT     NOT NULL,
    Actif        CHAR(1) NULL DEFAULT 'O',
    CONSTRAINT PK_UsersXClients PRIMARY KEY (FK_User_Id, FK_Client_Id),
    CONSTRAINT FK_UXC_User      FOREIGN KEY (FK_User_Id)   REFERENCES dbo.sysUser(Id),
    CONSTRAINT FK_UXC_Client    FOREIGN KEY (FK_Client_Id) REFERENCES dbo.Clients(Id)
);
GO

CREATE TABLE dbo.Polices (
    Id              INT          NOT NULL,
    Fk_Client_Id    INT          NOT NULL,
    Fk_Assure_Id    INT          NULL,
    FK_Compagnie_Id INT          NOT NULL,
    Branche         VARCHAR(100) NULL,
    Police          VARCHAR(100) NULL,
    DateEcheance    DATETIME     NULL,
    Statut          CHAR(1)      NULL,
    Module          VARCHAR(100) NULL,
    CONSTRAINT PK_Polices           PRIMARY KEY (Id),
    CONSTRAINT FK_Polices_Client    FOREIGN KEY (Fk_Client_Id)    REFERENCES dbo.Clients(Id),
    CONSTRAINT FK_Polices_Compagnie FOREIGN KEY (FK_Compagnie_Id) REFERENCES dbo.Compagnies(Id)
);
GO

CREATE TABLE dbo.Adherents (
    Id            INT          NOT NULL,
    FK_Police_Id  INT          NOT NULL,
    FK_User_Id    INT          NULL,
    Nom           VARCHAR(255) NOT NULL,
    Email         VARCHAR(255) NULL,
    NumAdhesion   VARCHAR(100) NULL,
    Matricule     VARCHAR(100) NULL,
    DateNaissance DATETIME     NULL,
    Actif         CHAR(1)      NULL DEFAULT 'O',
    CONSTRAINT PK_Adherents        PRIMARY KEY (Id),
    CONSTRAINT FK_Adherents_Police FOREIGN KEY (FK_Police_Id) REFERENCES dbo.Polices(Id),
    CONSTRAINT FK_Adherents_User   FOREIGN KEY (FK_User_Id)   REFERENCES dbo.sysUser(Id),
    CONSTRAINT UQ_Adherents_Email  UNIQUE (Email)
);
GO

CREATE TABLE dbo.PersACharge (
    Id             INT          NOT NULL,
    FK_Adherent_Id INT          NOT NULL,
    Nom            VARCHAR(255) NOT NULL,
    Lien           VARCHAR(100) NULL,
    DateNaissance  DATETIME     NULL,
    DateAdhesion   DATETIME     NULL,
    CONSTRAINT PK_PersACharge          PRIMARY KEY (Id),
    CONSTRAINT FK_PersACharge_Adherent FOREIGN KEY (FK_Adherent_Id) REFERENCES dbo.Adherents(Id)
);
GO

CREATE TABLE dbo.Risques (
    Id           INT          NOT NULL IDENTITY(1,1),
    FK_Police_Id INT          NOT NULL,
    Libelle      VARCHAR(255) NOT NULL,
    Identifiant  VARCHAR(100) NULL,
    Description  VARCHAR(500) NULL,
    DateDu       DATETIME     NULL,
    DateEcheance DATETIME     NULL,
    NumeroIBS    VARCHAR(100) NULL,
    CONSTRAINT PK_Risques        PRIMARY KEY (Id),
    CONSTRAINT FK_Risques_Police FOREIGN KEY (FK_Police_Id) REFERENCES dbo.Polices(Id)
);
GO

CREATE TABLE dbo.Garanties (
    Id           INT           NOT NULL IDENTITY(1,1),
    FK_Risque_Id INT           NOT NULL,
    Libelle      VARCHAR(255)  NOT NULL,
    Capital      DECIMAL(18,2) NULL,
    Franchise    DECIMAL(18,2) NULL,
    CONSTRAINT PK_Garanties        PRIMARY KEY (Id),
    CONSTRAINT FK_Garanties_Risque FOREIGN KEY (FK_Risque_Id) REFERENCES dbo.Risques(Id)
);
GO

CREATE TABLE dbo.Sinistres (
    Id              INT           NOT NULL,
    FK_Risque_Id    INT           NOT NULL,
    FK_Police_Id    INT           NOT NULL,
    FK_Adherent_Id  INT           NULL,
    NumeroSin       VARCHAR(100)  NULL,
    DateSin         DATETIME      NULL,
    DateDeclaration DATETIME      NULL,
    Statut          CHAR(1)       NULL,
    DateStatut      DATETIME      NULL,
    MT_Dommages     DECIMAL(18,2) NULL,
    MT_Franchise    DECIMAL(18,2) NULL,
    MT_Indemnite    DECIMAL(18,2) NULL,
    Observations    VARCHAR(1000) NULL,
    CONSTRAINT PK_Sinistres          PRIMARY KEY (Id),
    CONSTRAINT FK_Sinistres_Risque   FOREIGN KEY (FK_Risque_Id)   REFERENCES dbo.Risques(Id),
    CONSTRAINT FK_Sinistres_Police   FOREIGN KEY (FK_Police_Id)   REFERENCES dbo.Polices(Id),
    CONSTRAINT FK_Sinistres_Adherent FOREIGN KEY (FK_Adherent_Id) REFERENCES dbo.Adherents(Id)
);
GO

CREATE TABLE dbo.Quittances (
    Id           INT           NOT NULL,
    FK_Police_Id INT           NOT NULL,
    NumQuittance VARCHAR(100)  NULL,
    DateDu       DATETIME      NULL,
    DateAu       DATETIME      NULL,
    Montant      DECIMAL(18,2) NULL,
    Solde        DECIMAL(18,2) NULL,
    CONSTRAINT PK_Quittances        PRIMARY KEY (Id),
    CONSTRAINT FK_Quittances_Police FOREIGN KEY (FK_Police_Id) REFERENCES dbo.Polices(Id)
);
GO

CREATE TABLE dbo.ReclamationsIdt (
    Id              INT          NOT NULL IDENTITY(1,1),
    FK_User_Client  INT          NOT NULL,
    DateReclamation DATETIME     NULL DEFAULT GETDATE(),
    Sujet           VARCHAR(255) NULL,
    Statut          CHAR(1)      NOT NULL DEFAULT 'E',
    DateStatut      DATETIME     NULL,
    Nature          CHAR(1)      NULL,
    CONSTRAINT PK_ReclamationsIdt        PRIMARY KEY (Id),
    CONSTRAINT FK_ReclamIdt_User         FOREIGN KEY (FK_User_Client) REFERENCES dbo.sysUser(Id)
);
GO

CREATE TABLE dbo.ReclamationsDet (
    Id                INT           NOT NULL IDENTITY(1,1),
    FK_Reclamation_Id INT           NOT NULL,
    FK_User_Id        INT           NOT NULL,
    DateMessage       DATETIME      NULL DEFAULT GETDATE(),
    Nature            CHAR(1)       NULL,
    Message           VARCHAR(2000) NULL,
    CONSTRAINT PK_ReclamationsDet       PRIMARY KEY (Id),
    CONSTRAINT FK_ReclamDet_Reclamation FOREIGN KEY (FK_Reclamation_Id) REFERENCES dbo.ReclamationsIdt(Id),
    CONSTRAINT FK_ReclamDet_User        FOREIGN KEY (FK_User_Id)        REFERENCES dbo.sysUser(Id)
);
GO

CREATE OR ALTER PROCEDURE dbo.ps_GetPolices
    @FK_User_Id   INT,
    @Token        VARCHAR(1000),
    @Source       VARCHAR(50),
    @FK_Police_Id INT = NULL,
    @ParentMode   BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF @Source NOT IN ('Cabinet', 'Extranet', 'Mobile')
    BEGIN
        RAISERROR('Source invalide.', 16, 1);
        RETURN;
    END

    IF @ParentMode = 1
    BEGIN
        SELECT DISTINCT
            p.Id                  AS IdPolice,
            p.Police              AS NumeroPolice,
            p.Branche,
            p.Module,
            p.DateEcheance,
            p.Statut,
            cEnfant.Id            AS IdClientEnfant,
            cEnfant.RaisonSociale AS ClientEnfant,
            cParent.Id            AS IdClientParent,
            cParent.RaisonSociale AS ClientParent,
            cp.RaisonSociale      AS Compagnie
        FROM dbo.Clients cParent
        INNER JOIN dbo.Clients    cEnfant ON cEnfant.Fk_Client_Id = cParent.Id
        INNER JOIN dbo.Polices    p       ON p.Fk_Client_Id       = cEnfant.Id
        INNER JOIN dbo.Compagnies cp      ON cp.Id                = p.FK_Compagnie_Id
        WHERE @Source = 'Cabinet'
           OR (@Source = 'Extranet' AND EXISTS (
                SELECT 1 FROM dbo.UsersXClients uxc
                WHERE uxc.FK_User_Id = @FK_User_Id AND uxc.FK_Client_Id = cParent.Id
           ))
        ORDER BY cEnfant.RaisonSociale, p.DateEcheance DESC;
        RETURN;
    END

    IF @FK_Police_Id IS NOT NULL
    BEGIN
        SELECT
            p.Id                                                                           AS IdPolice,
            p.Police                                                                       AS NumeroPolice,
            p.Branche,
            p.DateEcheance,
            p.Statut                                                                       AS StatutPolice,
            c.RaisonSociale                                                                AS Client,
            cp.RaisonSociale                                                               AS Compagnie,
            (SELECT COUNT(*)        FROM dbo.Adherents a  WHERE a.FK_Police_Id  = p.Id)   AS NombreAdherents,
            (SELECT COUNT(*)        FROM dbo.Risques r    WHERE r.FK_Police_Id  = p.Id)   AS NombreRisques,
            (SELECT COUNT(*)        FROM dbo.Sinistres s  WHERE s.FK_Police_Id  = p.Id)   AS NombreSinistresTotal,
            (SELECT COUNT(*)        FROM dbo.Sinistres s  WHERE s.FK_Police_Id  = p.Id AND s.Statut = 'E') AS NombreSinistresEnCours,
            (SELECT ISNULL(SUM(q.Montant), 0) FROM dbo.Quittances q WHERE q.FK_Police_Id = p.Id)           AS PrimeTotale
        FROM dbo.Polices    p
        INNER JOIN dbo.Clients    c  ON c.Id  = p.Fk_Client_Id
        INNER JOIN dbo.Compagnies cp ON cp.Id = p.FK_Compagnie_Id
        WHERE p.Id = @FK_Police_Id;
        RETURN;
    END

    SELECT DISTINCT
        p.Id              AS IdPolice,
        p.Police          AS NumeroPolice,
        p.Branche,
        p.Module,
        p.DateEcheance,
        p.Statut,
        c.Id              AS IdClient,
        c.RaisonSociale   AS Client,
        cp.RaisonSociale  AS Compagnie,
        (SELECT ISNULL(SUM(q.Montant), 0) FROM dbo.Quittances q WHERE q.FK_Police_Id = p.Id) AS PrimeAnnuelle,
        (SELECT ISNULL(SUM(q.Solde),   0) FROM dbo.Quittances q WHERE q.FK_Police_Id = p.Id) AS TotalImpayes
    FROM dbo.Polices    p
    INNER JOIN dbo.Clients    c  ON p.Fk_Client_Id = c.Id
    INNER JOIN dbo.Compagnies cp ON cp.Id           = p.FK_Compagnie_Id
    WHERE @Source = 'Cabinet'
       OR (@Source = 'Extranet' AND EXISTS (
            SELECT 1 FROM dbo.UsersXClients uxc
            WHERE uxc.FK_User_Id = @FK_User_Id AND uxc.FK_Client_Id = c.Id
       ))
       OR (@Source = 'Mobile' AND c.FK_User_Id = @FK_User_Id AND c.Particulier = 'O')
    ORDER BY p.DateEcheance DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.ps_GetRisques
    @FK_User_Id   INT,
    @Token        VARCHAR(1000),
    @Source       VARCHAR(50),
    @FK_Police_Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @Source NOT IN ('Cabinet', 'Extranet', 'Mobile')
    BEGIN
        RAISERROR('Source invalide.', 16, 1);
        RETURN;
    END

    SELECT
        r.Id          AS IdRisque,
        r.Libelle     AS LibelleRisque,
        r.Identifiant,
        r.Description,
        r.DateDu,
        r.DateEcheance,
        r.NumeroIBS,
        g.Id          AS IdGarantie,
        g.Libelle     AS LibelleGarantie,
        g.Capital,
        g.Franchise
    FROM dbo.Risques   r
    LEFT JOIN dbo.Garanties g ON g.FK_Risque_Id = r.Id
    WHERE r.FK_Police_Id = @FK_Police_Id
    ORDER BY r.Libelle, g.Libelle;
END;
GO

CREATE OR ALTER PROCEDURE dbo.ps_GetAdherents
    @FK_User_Id     INT,
    @Token          VARCHAR(1000),
    @Source         VARCHAR(50),
    @FK_Adherent_Id INT  = NULL,
    @Nom            VARCHAR(255) = NULL,
    @Actif          CHAR(1)      = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Source NOT IN ('Cabinet', 'Extranet', 'Mobile')
    BEGIN
        RAISERROR('Source invalide.', 16, 1);
        RETURN;
    END

    IF @FK_Adherent_Id IS NOT NULL
    BEGIN
        SELECT
            pac.Id           AS IdPersACharge,
            pac.Nom,
            pac.Lien,
            pac.DateNaissance,
            pac.DateAdhesion,
            a.Nom            AS NomAdherent,
            a.NumAdhesion,
            a.Matricule
        FROM dbo.PersACharge pac
        INNER JOIN dbo.Adherents a ON a.Id = pac.FK_Adherent_Id
        WHERE pac.FK_Adherent_Id = @FK_Adherent_Id
        ORDER BY pac.Lien, pac.Nom;
        RETURN;
    END

    SELECT DISTINCT
        a.Id            AS IdAdherent,
        a.Nom           AS NomAdherent,
        a.NumAdhesion,
        a.Matricule,
        a.DateNaissance,
        a.Actif,
        p.Police        AS NumeroPolice,
        p.Branche,
        c.RaisonSociale AS Client,
        u.Nom           AS UserNom
    FROM dbo.Adherents a
    INNER JOIN dbo.Polices  p ON a.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients  c ON p.Fk_Client_Id = c.Id
    LEFT  JOIN dbo.sysUser  u ON a.FK_User_Id   = u.Id
    WHERE (@Nom   IS NULL OR a.Nom  LIKE '%' + @Nom   + '%')
      AND (@Actif IS NULL OR a.Actif = @Actif)
      AND (
            @Source = 'Cabinet'
         OR (@Source = 'Extranet' AND EXISTS (
                SELECT 1 FROM dbo.UsersXClients uxc
                WHERE uxc.FK_User_Id = @FK_User_Id AND uxc.FK_Client_Id = c.Id
            ))
         OR (@Source = 'Mobile' AND (
                a.FK_User_Id = @FK_User_Id
             OR (c.FK_User_Id = @FK_User_Id AND c.Particulier = 'O')
            ))
          )
    ORDER BY a.Nom;
END;
GO

CREATE OR ALTER PROCEDURE dbo.ps_GetSinistres
    @FK_User_Id   INT,
    @Token        VARCHAR(1000),
    @Source       VARCHAR(50),
    @FK_Police_Id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Source NOT IN ('Cabinet', 'Extranet', 'Mobile')
    BEGIN
        RAISERROR('Source invalide.', 16, 1);
        RETURN;
    END

    SELECT DISTINCT
        s.Id              AS IdSinistre,
        s.NumeroSin,
        s.DateSin,
        s.DateDeclaration,
        s.Statut,
        s.DateStatut,
        s.MT_Dommages,
        s.MT_Franchise,
        s.MT_Indemnite,
        s.Observations,
        r.Libelle         AS Risque,
        r.Identifiant     AS IdentifiantRisque,
        p.Police          AS NumeroPolice,
        p.Branche,
        c.RaisonSociale   AS Client
    FROM dbo.Sinistres s
    INNER JOIN dbo.Risques  r ON r.Id = s.FK_Risque_Id
    INNER JOIN dbo.Polices  p ON p.Id = s.FK_Police_Id
    INNER JOIN dbo.Clients  c ON c.Id = p.Fk_Client_Id
    WHERE (@FK_Police_Id IS NULL OR s.FK_Police_Id = @FK_Police_Id)
      AND (
            @Source = 'Cabinet'
         OR (@Source = 'Extranet' AND EXISTS (
                SELECT 1 FROM dbo.UsersXClients uxc
                WHERE uxc.FK_User_Id = @FK_User_Id AND uxc.FK_Client_Id = c.Id
            ))
         OR (@Source = 'Mobile' AND (
                EXISTS (SELECT 1 FROM dbo.Adherents a WHERE a.FK_User_Id = @FK_User_Id AND a.Id = s.FK_Adherent_Id)
             OR (c.FK_User_Id = @FK_User_Id AND c.Particulier = 'O')
            ))
          )
    ORDER BY s.DateSin DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.ps_GetQuittances
    @FK_User_Id   INT,
    @Token        VARCHAR(1000),
    @Source       VARCHAR(50),
    @FK_Police_Id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Source NOT IN ('Cabinet', 'Extranet', 'Mobile')
    BEGIN
        RAISERROR('Source invalide.', 16, 1);
        RETURN;
    END

    SELECT DISTINCT
        q.Id             AS IdQuittance,
        q.NumQuittance,
        q.DateDu,
        q.DateAu,
        q.Montant,
        q.Solde,
        p.Police         AS NumeroPolice,
        p.Branche,
        p.Statut         AS StatutPolice,
        c.RaisonSociale  AS Client,
        cp.RaisonSociale AS Compagnie
    FROM dbo.Quittances q
    INNER JOIN dbo.Polices    p  ON p.Id  = q.FK_Police_Id
    INNER JOIN dbo.Clients    c  ON c.Id  = p.Fk_Client_Id
    INNER JOIN dbo.Compagnies cp ON cp.Id = p.FK_Compagnie_Id
    WHERE (@FK_Police_Id IS NULL OR q.FK_Police_Id = @FK_Police_Id)
      AND (
            @Source = 'Cabinet'
         OR (@Source = 'Extranet' AND EXISTS (
                SELECT 1 FROM dbo.UsersXClients uxc
                WHERE uxc.FK_User_Id = @FK_User_Id AND uxc.FK_Client_Id = c.Id
            ))
         OR (@Source = 'Mobile' AND c.FK_User_Id = @FK_User_Id AND c.Particulier = 'O')
          )
    ORDER BY q.DateDu DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.ps_GetStats
    @FK_User_Id   INT,
    @Token        VARCHAR(1000),
    @Source       VARCHAR(50),
    @FK_Police_Id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Source NOT IN ('Cabinet', 'Extranet', 'Mobile')
    BEGIN
        RAISERROR('Source invalide.', 16, 1);
        RETURN;
    END

    IF @FK_Police_Id IS NOT NULL
    BEGIN
        SELECT
            p.Id                                                                                   AS IdPolice,
            p.Police                                                                               AS NumeroPolice,
            p.Branche,
            p.DateEcheance,
            p.Statut                                                                               AS StatutPolice,
            c.RaisonSociale                                                                        AS Client,
            cp.RaisonSociale                                                                       AS Compagnie,
            (SELECT COUNT(*)        FROM dbo.Adherents a WHERE a.FK_Police_Id = p.Id)              AS NombreAdherents,
            (SELECT COUNT(*)        FROM dbo.Risques   r WHERE r.FK_Police_Id = p.Id)              AS NombreRisques,
            (SELECT COUNT(*)        FROM dbo.Sinistres s WHERE s.FK_Police_Id = p.Id)              AS NombreSinistresTotal,
            (SELECT COUNT(*)        FROM dbo.Sinistres s WHERE s.FK_Police_Id = p.Id AND s.Statut = 'E') AS NombreSinistresEnCours,
            (SELECT ISNULL(SUM(q.Montant), 0) FROM dbo.Quittances q WHERE q.FK_Police_Id = p.Id)  AS PrimeTotale
        FROM dbo.Polices    p
        INNER JOIN dbo.Clients    c  ON c.Id  = p.Fk_Client_Id
        INNER JOIN dbo.Compagnies cp ON cp.Id = p.FK_Compagnie_Id
        WHERE p.Id = @FK_Police_Id;
        RETURN;
    END

    SELECT
        (
            SELECT COUNT(DISTINCT p.Id)
            FROM dbo.Polices p
            INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
            WHERE @Source = 'Cabinet'
               OR (@Source = 'Extranet' AND EXISTS (SELECT 1 FROM dbo.UsersXClients uxc WHERE uxc.FK_User_Id = @FK_User_Id AND uxc.FK_Client_Id = c.Id))
               OR (@Source = 'Mobile' AND c.FK_User_Id = @FK_User_Id AND c.Particulier = 'O')
        ) AS TotalPolices,
        (
            SELECT COUNT(DISTINCT s.Id)
            FROM dbo.Sinistres s
            INNER JOIN dbo.Polices p ON s.FK_Police_Id = p.Id
            INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
            WHERE s.Statut = 'E'
              AND (
                    @Source = 'Cabinet'
                 OR (@Source = 'Extranet' AND EXISTS (SELECT 1 FROM dbo.UsersXClients uxc WHERE uxc.FK_User_Id = @FK_User_Id AND uxc.FK_Client_Id = c.Id))
                 OR (@Source = 'Mobile' AND (
                        EXISTS (SELECT 1 FROM dbo.Adherents a WHERE a.FK_User_Id = @FK_User_Id AND a.Id = s.FK_Adherent_Id)
                     OR (c.FK_User_Id = @FK_User_Id AND c.Particulier = 'O')
                    ))
                  )
        ) AS SinistresEnCours,
        (
            SELECT ISNULL(SUM(q.Solde), 0)
            FROM dbo.Quittances q
            INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
            INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
            WHERE q.Solde > 0
              AND (
                    @Source = 'Cabinet'
                 OR (@Source = 'Extranet' AND EXISTS (SELECT 1 FROM dbo.UsersXClients uxc WHERE uxc.FK_User_Id = @FK_User_Id AND uxc.FK_Client_Id = c.Id))
                 OR (@Source = 'Mobile' AND c.FK_User_Id = @FK_User_Id AND c.Particulier = 'O')
                  )
        ) AS TotalImpayes;
END;
GO

CREATE OR ALTER PROCEDURE dbo.ps_GetReclamations
    @FK_User_Id    INT,
    @Token         VARCHAR(1000),
    @Source        VARCHAR(50),
    @IdReclamation INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @IdReclamation IS NOT NULL
    BEGIN
        SELECT
            r.Id              AS IdReclamation,
            r.DateReclamation,
            r.Sujet,
            r.Statut,
            r.DateStatut,
            r.Nature,
            u.Nom             AS UserDeclarant,
            rd.Id             AS IdMessage,
            rd.DateMessage,
            rd.Nature         AS NatureMessage,
            rd.Message,
            uMsg.Nom          AS AuteurMessage
        FROM dbo.ReclamationsIdt   r
        INNER JOIN dbo.sysUser          u    ON u.Id                 = r.FK_User_Client
        LEFT  JOIN dbo.ReclamationsDet  rd   ON rd.FK_Reclamation_Id = r.Id
        LEFT  JOIN dbo.sysUser          uMsg ON uMsg.Id              = rd.FK_User_Id
        WHERE r.Id = @IdReclamation
        ORDER BY rd.DateMessage ASC;
        RETURN;
    END

    SELECT
        r.Id              AS IdReclamation,
        r.DateReclamation,
        r.Sujet,
        r.Statut,
        r.DateStatut,
        r.Nature,
        COUNT(rd.Id)      AS NombreMessages
    FROM dbo.ReclamationsIdt   r
    LEFT JOIN dbo.ReclamationsDet rd ON rd.FK_Reclamation_Id = r.Id
    WHERE r.FK_User_Client = @FK_User_Id
    GROUP BY r.Id, r.DateReclamation, r.Sujet, r.Statut, r.DateStatut, r.Nature
    ORDER BY r.DateReclamation DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.ps_ManageReclamation
    @FK_User_Id        INT,
    @Token             VARCHAR(1000),
    @Source            VARCHAR(50),
    @Action            VARCHAR(20),
    @IdReclamation     INT           = NULL,
    @Sujet             VARCHAR(255)  = NULL,
    @Nature            CHAR(1)       = NULL,
    @NouveauStatut     CHAR(1)       = NULL,
    @Message           VARCHAR(2000) = NULL,
    @NatureMessage     CHAR(1)       = NULL,
    @NewId             INT           OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @NewId = NULL;

    IF @Action NOT IN ('CREATE', 'ADD_MESSAGE', 'UPDATE_STATUT', 'DELETE')
    BEGIN
        RAISERROR('Action invalide.', 16, 1);
        RETURN;
    END

    IF @Action = 'CREATE'
    BEGIN
        IF @Sujet IS NULL OR @Nature IS NULL
        BEGIN
            RAISERROR('Sujet et Nature sont obligatoires pour la creation.', 16, 1);
            RETURN;
        END
        INSERT INTO dbo.ReclamationsIdt (FK_User_Client, DateReclamation, Sujet, Statut, DateStatut, Nature)
        VALUES (@FK_User_Id, GETDATE(), @Sujet, 'E', GETDATE(), @Nature);
        SET @NewId = SCOPE_IDENTITY();
        RETURN;
    END

    IF @IdReclamation IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @IdReclamation)
    BEGIN
        RAISERROR('Reclamation introuvable.', 16, 1);
        RETURN;
    END

    IF @Action = 'ADD_MESSAGE'
    BEGIN
        IF @Message IS NULL
        BEGIN
            RAISERROR('Message obligatoire.', 16, 1);
            RETURN;
        END
        INSERT INTO dbo.ReclamationsDet (FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message)
        VALUES (@IdReclamation, @FK_User_Id, GETDATE(), @NatureMessage, @Message);
        SET @NewId = SCOPE_IDENTITY();
        RETURN;
    END

    IF @Action = 'UPDATE_STATUT'
    BEGIN
        IF @NouveauStatut NOT IN ('E', 'T', 'C')
        BEGIN
            RAISERROR('Statut invalide. Valeurs acceptees : E, T, C.', 16, 1);
            RETURN;
        END
        UPDATE dbo.ReclamationsIdt
        SET Statut = @NouveauStatut, DateStatut = GETDATE()
        WHERE Id = @IdReclamation;
        RETURN;
    END

    IF @Action = 'DELETE'
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @IdReclamation AND Statut = 'E')
        BEGIN
            RAISERROR('Suppression impossible : reclamation introuvable ou deja traitee/cloturee.', 16, 1);
            RETURN;
        END
        DELETE FROM dbo.ReclamationsDet WHERE FK_Reclamation_Id = @IdReclamation;
        DELETE FROM dbo.ReclamationsIdt WHERE Id                = @IdReclamation;
        RETURN;
    END
END;
GO

CREATE OR ALTER PROCEDURE dbo.ps_ManageUser
    @FK_User_Id INT,
    @Token      VARCHAR(1000),
    @Source     VARCHAR(50),
    @Action     VARCHAR(20),
    @Id         INT           = 0,
    @Id_Auth    VARCHAR(255)  = NULL,
    @Nom        VARCHAR(255)  = NULL,
    @Telephone  VARCHAR(255)  = NULL,
    @Email      VARCHAR(255)  = NULL,
    @Nature     CHAR(1)       = 'C',
    @Extranet   CHAR(1)       = 'N',
    @Mobile     CHAR(1)       = 'N',
    @FilterNom  VARCHAR(255)  = NULL,
    @FilterNature CHAR(1)     = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Action NOT IN ('GET', 'SAVE', 'DELETE')
    BEGIN
        RAISERROR('Action invalide.', 16, 1);
        RETURN;
    END

    IF @Action = 'GET'
    BEGIN
        SELECT Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile
        FROM dbo.sysUser
        WHERE (@FilterNom    IS NULL OR Nom    LIKE '%' + @FilterNom    + '%')
          AND (@FilterNature IS NULL OR Nature = @FilterNature)
        ORDER BY Nom;
        RETURN;
    END

    IF @Action = 'SAVE'
    BEGIN
        IF @Nom IS NULL
        BEGIN
            RAISERROR('Nom obligatoire.', 16, 1);
            RETURN;
        END
        IF @Nature NOT IN ('A', 'C')
        BEGIN
            RAISERROR('Nature invalide. Valeurs attendues : A (Cabinet), C (Client).', 16, 1);
            RETURN;
        END
        IF @Extranet NOT IN ('O', 'N') OR @Mobile NOT IN ('O', 'N')
        BEGIN
            RAISERROR('Extranet et Mobile doivent etre O ou N.', 16, 1);
            RETURN;
        END
        IF @Id = 0
        BEGIN
            INSERT INTO dbo.sysUser (Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile)
            VALUES (@Id_Auth, @Nom, @Telephone, @Email, @Nature, @Extranet, @Mobile);
            SELECT SCOPE_IDENTITY() AS NewId;
        END
        ELSE
        BEGIN
            UPDATE dbo.sysUser
            SET Id_Auth = @Id_Auth, Nom = @Nom, Telephone = @Telephone,
                Email = @Email, Nature = @Nature, Extranet = @Extranet, Mobile = @Mobile
            WHERE Id = @Id;
            SELECT @Id AS NewId;
        END
        RETURN;
    END

    IF @Action = 'DELETE'
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @Id)
        BEGIN
            RAISERROR('Utilisateur introuvable.', 16, 1);
            RETURN;
        END
        DELETE FROM dbo.Roles            WHERE FK_User_Id = @Id;
        DELETE FROM dbo.Postes_Autorises WHERE FK_User_Id = @Id;
        DELETE FROM dbo.UsersXClients    WHERE FK_User_Id = @Id;
        DELETE FROM dbo.sysUser          WHERE Id         = @Id;
        RETURN;
    END
END;
GO

CREATE OR ALTER PROCEDURE dbo.ps_GetClients
    @FK_User_Id    INT,
    @Token         VARCHAR(1000),
    @Source        VARCHAR(50),
    @RaisonSociale VARCHAR(255) = NULL,
    @Particulier   CHAR(1)      = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT c.*, u.Nom AS UserNom
    FROM dbo.Clients  c
    LEFT JOIN dbo.sysUser u ON c.FK_User_Id = u.Id
    WHERE (@RaisonSociale IS NULL OR c.RaisonSociale LIKE '%' + @RaisonSociale + '%')
      AND (@Particulier   IS NULL OR c.Particulier = @Particulier)
    ORDER BY c.RaisonSociale;
END;
GO

CREATE OR ALTER PROCEDURE dbo.ps_CreateUserFromEntity
    @FK_User_Id INT,
    @Token      VARCHAR(1000),
    @Source     VARCHAR(50),
    @EntityType VARCHAR(10),
    @EntityId   INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @EntityType NOT IN ('CLIENT', 'ADHERENT')
    BEGIN
        RAISERROR('EntityType invalide. Valeurs acceptees : CLIENT, ADHERENT.', 16, 1);
        RETURN;
    END

    DECLARE @Nom    VARCHAR(255);
    DECLARE @Email  VARCHAR(255);
    DECLARE @Nature CHAR(1);
    DECLARE @Extran CHAR(1);
    DECLARE @Mob    CHAR(1);
    DECLARE @UserId INT;

    IF @EntityType = 'CLIENT'
    BEGIN
        SELECT @Nom = RaisonSociale, @Email = Email FROM dbo.Clients WHERE Id = @EntityId;
        SET @Nature = 'C'; SET @Extran = 'O'; SET @Mob = 'N';
    END
    ELSE
    BEGIN
        SELECT @Nom = Nom, @Email = Email FROM dbo.Adherents WHERE Id = @EntityId;
        SET @Nature = 'C'; SET @Extran = 'N'; SET @Mob = 'O';
    END

    IF @Nom IS NULL
    BEGIN
        RAISERROR('Entite introuvable.', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.sysUser (Nom, Email, Nature, Extranet, Mobile)
    VALUES (@Nom, @Email, @Nature, @Extran, @Mob);
    SET @UserId = SCOPE_IDENTITY();

    IF @EntityType = 'CLIENT'
        UPDATE dbo.Clients   SET FK_User_Id = @UserId WHERE Id = @EntityId;
    ELSE
        UPDATE dbo.Adherents SET FK_User_Id = @UserId WHERE Id = @EntityId;

    SELECT * FROM dbo.sysUser WHERE Id = @UserId;
END;
GO