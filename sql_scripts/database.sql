USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'IBS_Extranet_Mobile')
    CREATE DATABASE IBS_Extranet_Mobile;
GO

USE IBS_Extranet_Mobile;
GO

IF OBJECT_ID('dbo.ReclamationsDet', 'U') IS NOT NULL DROP TABLE dbo.ReclamationsDet;
IF OBJECT_ID('dbo.ReclamationsIdt', 'U') IS NOT NULL DROP TABLE dbo.ReclamationsIdt;
IF OBJECT_ID('dbo.Garanties', 'U') IS NOT NULL DROP TABLE dbo.Garanties;
IF OBJECT_ID('dbo.Sinistres', 'U') IS NOT NULL DROP TABLE dbo.Sinistres;
IF OBJECT_ID('dbo.Quittances', 'U') IS NOT NULL DROP TABLE dbo.Quittances;
IF OBJECT_ID('dbo.PersACharge', 'U') IS NOT NULL DROP TABLE dbo.PersACharge;
IF OBJECT_ID('dbo.Adherents', 'U') IS NOT NULL DROP TABLE dbo.Adherents;
IF OBJECT_ID('dbo.Risques', 'U') IS NOT NULL DROP TABLE dbo.Risques;
IF OBJECT_ID('dbo.Polices', 'U') IS NOT NULL DROP TABLE dbo.Polices;
IF OBJECT_ID('dbo.UsersXClients', 'U') IS NOT NULL DROP TABLE dbo.UsersXClients;
IF OBJECT_ID('dbo.Clients', 'U') IS NOT NULL DROP TABLE dbo.Clients;
IF OBJECT_ID('dbo.Compagnies', 'U') IS NOT NULL DROP TABLE dbo.Compagnies;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
IF OBJECT_ID('dbo.userConnection', 'U') IS NOT NULL DROP TABLE dbo.userConnection;
IF OBJECT_ID('dbo.Postes_Autorises', 'U') IS NOT NULL DROP TABLE dbo.Postes_Autorises;
IF OBJECT_ID('dbo.sysUser', 'U') IS NOT NULL DROP TABLE dbo.sysUser;
GO

CREATE TABLE dbo.sysUser
(
    Id INT NOT NULL IDENTITY(1,1),
    Id_Auth VARCHAR(255) NULL,
    token VARCHAR(max) NULL,
    Nom VARCHAR(255) NOT NULL,
    Telephone VARCHAR(20) NULL,
    Email VARCHAR(255) NULL,
    Nature CHAR(1) NULL,
    Extranet CHAR(1) NOT NULL CONSTRAINT DF_sysUser_Extranet DEFAULT 'N',
    Mobile CHAR(1) NOT NULL CONSTRAINT DF_sysUser_Mobile DEFAULT 'N',
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_sysUser_CreatedAt DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT PK_sysUser PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_sysUser_Email UNIQUE NONCLUSTERED (Email)
);
GO

CREATE TABLE dbo.Postes_Autorises
(
    Id INT NOT NULL IDENTITY(1,1),
    FK_User_Id INT NOT NULL,
    Libelle VARCHAR(255) NOT NULL,
    Identifiant VARCHAR(255) NULL,
    Actif CHAR(1) NOT NULL CONSTRAINT DF_Postes_Autorises_Actif DEFAULT 'O',
    DateActivation DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Postes_Autorises_CreatedAt DEFAULT GETDATE(),
    CONSTRAINT PK_Postes_Autorises PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_PostesAutorises_User FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.userConnection
(
    Id INT NOT NULL IDENTITY(1,1),
    FK_User_Id INT NOT NULL,
    FK_Poste_Id INT NOT NULL,
    DateConnection DATETIME2 NULL,
    DateSortie DATETIME2 NULL,
    CONSTRAINT PK_userConnection PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_userConn_User FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id) ON DELETE CASCADE,
    CONSTRAINT FK_userConn_Poste FOREIGN KEY (FK_Poste_Id) REFERENCES dbo.Postes_Autorises(Id)
);
GO

CREATE TABLE dbo.Roles
(
    Id INT NOT NULL IDENTITY(1,1),
    FK_User_Id INT NOT NULL,
    Role VARCHAR(100) NOT NULL,
    CONSTRAINT PK_Roles PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Roles_User FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.Compagnies
(
    Id INT NOT NULL IDENTITY(1,1),
    RaisonSociale VARCHAR(255) NOT NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Compagnies_CreatedAt DEFAULT GETDATE(),
    CONSTRAINT PK_Compagnies PRIMARY KEY CLUSTERED (Id)
);
GO

CREATE TABLE dbo.Clients
(
    Id INT NOT NULL,
    Fk_Client_Id INT NULL,
    RaisonSociale VARCHAR(255) NOT NULL,
    Particulier CHAR(1) NOT NULL CONSTRAINT DF_Clients_Particulier DEFAULT 'N',
    Email VARCHAR(255) NULL,
    Adresse VARCHAR(500) NULL,
    Telephone VARCHAR(20) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Clients_CreatedAt DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT PK_Clients PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Clients_Parent FOREIGN KEY (Fk_Client_Id) REFERENCES dbo.Clients(Id),
    CONSTRAINT UQ_Clients_Email UNIQUE NONCLUSTERED (Email)
);
GO

CREATE TABLE dbo.UsersXClients
(
    FK_User_Id INT NOT NULL,
    FK_Client_Id INT NOT NULL,
    Actif CHAR(1) NOT NULL CONSTRAINT DF_UsersXClients_Actif DEFAULT 'O',
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_UsersXClients_CreatedAt DEFAULT GETDATE(),
    CONSTRAINT PK_UsersXClients PRIMARY KEY CLUSTERED (FK_User_Id, FK_Client_Id),
    CONSTRAINT FK_UXC_User FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UXC_Client FOREIGN KEY (FK_Client_Id) REFERENCES dbo.Clients(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.Polices
(
    Id INT NOT NULL,
    Fk_Client_Id INT NOT NULL,
    Fk_Assure_Id INT NULL,
    FK_Compagnie_Id INT NOT NULL,
    Branche VARCHAR(100) NULL,
    Police VARCHAR(100) NULL,
    DateEcheance DATE NULL,
    Statut CHAR(1) NULL,
    Module VARCHAR(100) NULL,
    DateEffet DATE NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Polices_CreatedAt DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT PK_Polices PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Polices_Client FOREIGN KEY (Fk_Client_Id) REFERENCES dbo.Clients(Id),
    CONSTRAINT FK_Polices_Compagnie FOREIGN KEY (FK_Compagnie_Id) REFERENCES dbo.Compagnies(Id)
);
GO

CREATE TABLE dbo.Adherents
(
    Id INT NOT NULL,
    FK_Police_Id INT NOT NULL,
    FK_User_Id INT NULL,
    Nom VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NULL,
    NumAdhesion VARCHAR(100) NULL,
    Matricule VARCHAR(100) NULL,
    DateNaissance DATE NULL,
    Actif CHAR(1) NOT NULL CONSTRAINT DF_Adherents_Actif DEFAULT 'O',
    Prenom VARCHAR(255) NULL,
    Telephone VARCHAR(20) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Adherents_CreatedAt DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT PK_Adherents PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Adherents_Police FOREIGN KEY (FK_Police_Id) REFERENCES dbo.Polices(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Adherents_User FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id),
    CONSTRAINT UQ_Adherents_Email UNIQUE NONCLUSTERED (Email),
    CONSTRAINT UQ_Adherents_Matricule UNIQUE NONCLUSTERED (Matricule)
);
GO

CREATE TABLE dbo.PersACharge
(
    Id INT NOT NULL,
    FK_Adherent_Id INT NOT NULL,
    Nom VARCHAR(255) NOT NULL,
    Lien VARCHAR(100) NULL,
    DateNaissance DATE NULL,
    DateAdhesion DATE NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_PersACharge_CreatedAt DEFAULT GETDATE(),
    CONSTRAINT PK_PersACharge PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_PersACharge_Adherent FOREIGN KEY (FK_Adherent_Id) REFERENCES dbo.Adherents(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.Risques
(
    Id INT NOT NULL IDENTITY(1,1),
    FK_Police_Id INT NOT NULL,
    Libelle VARCHAR(255) NOT NULL,
    Identifiant VARCHAR(100) NULL,
    Description VARCHAR(500) NULL,
    DateDu DATE NULL,
    DateEcheance DATE NULL,
    NumeroIBS VARCHAR(100) NULL,
    Statut CHAR(1) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Risques_CreatedAt DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT PK_Risques PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Risques_Police FOREIGN KEY (FK_Police_Id) REFERENCES dbo.Polices(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Risques_NumeroIBS UNIQUE NONCLUSTERED (NumeroIBS)
);
GO

CREATE TABLE dbo.Garanties
(
    Id INT NOT NULL IDENTITY(1,1),
    FK_Risque_Id INT NOT NULL,
    Libelle VARCHAR(255) NOT NULL,
    Capital DECIMAL(18,2) NULL,
    Franchise DECIMAL(18,2) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Garanties_CreatedAt DEFAULT GETDATE(),
    CONSTRAINT PK_Garanties PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Garanties_Risque FOREIGN KEY (FK_Risque_Id) REFERENCES dbo.Risques(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.Sinistres
(
    Id INT NOT NULL,
    FK_Risque_Id INT NULL,
    FK_Police_Id INT NOT NULL,
    FK_Adherent_Id INT NULL,
    NumeroSin VARCHAR(100) NULL,
    DateSin DATE NULL,
    DateDeclaration DATE NULL,
    Statut CHAR(1) NULL,
    DateStatut DATE NULL,
    MT_Dommages DECIMAL(18,2) NULL,
    MT_Franchise DECIMAL(18,2) NULL,
    MT_Indemnite DECIMAL(18,2) NULL,
    Observations VARCHAR(max) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Sinistres_CreatedAt DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT PK_Sinistres PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Sinistres_Risque FOREIGN KEY (FK_Risque_Id) REFERENCES dbo.Risques(Id),
    CONSTRAINT FK_Sinistres_Police FOREIGN KEY (FK_Police_Id) REFERENCES dbo.Polices(Id),
    CONSTRAINT FK_Sinistres_Adherent FOREIGN KEY (FK_Adherent_Id) REFERENCES dbo.Adherents(Id),
    CONSTRAINT UQ_Sinistres_NumeroSin UNIQUE NONCLUSTERED (NumeroSin)
);
GO

CREATE TABLE dbo.Quittances
(
    Id INT NOT NULL,
    FK_Police_Id INT NOT NULL,
    NumQuittance VARCHAR(100) NULL,
    DateDu DATE NULL,
    DateAu DATE NULL,
    Montant DECIMAL(18,2) NULL,
    Solde DECIMAL(18,2) NULL,
    DateEcheance DATE NULL,
    Statut CHAR(1) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Quittances_CreatedAt DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT PK_Quittances PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Quittances_Police FOREIGN KEY (FK_Police_Id) REFERENCES dbo.Polices(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Quittances_NumQuittance UNIQUE NONCLUSTERED (NumQuittance)
);
GO

CREATE TABLE dbo.ReclamationsIdt
(
    Id INT NOT NULL IDENTITY(1,1),
    FK_User_Client INT NOT NULL,
    DateReclamation DATETIME2 NOT NULL CONSTRAINT DF_ReclamationsIdt_DateReclamation DEFAULT GETDATE(),
    Sujet VARCHAR(255) NULL,
    Statut CHAR(1) NOT NULL CONSTRAINT DF_ReclamationsIdt_Statut DEFAULT 'E',
    DateStatut DATETIME2 NULL,
    Nature CHAR(1) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ReclamationsIdt_CreatedAt DEFAULT GETDATE(),
    CONSTRAINT PK_ReclamationsIdt PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_ReclamIdt_User FOREIGN KEY (FK_User_Client) REFERENCES dbo.sysUser(Id)
);
GO

CREATE TABLE dbo.ReclamationsDet
(
    Id INT NOT NULL IDENTITY(1,1),
    FK_Reclamation_Id INT NOT NULL,
    FK_User_Id INT NOT NULL,
    DateMessage DATETIME2 NOT NULL CONSTRAINT DF_ReclamationsDet_DateMessage DEFAULT GETDATE(),
    Nature CHAR(1) NULL,
    Message VARCHAR(2000) NULL,
    CONSTRAINT PK_ReclamationsDet PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_ReclamDet_Reclamation FOREIGN KEY (FK_Reclamation_Id) REFERENCES dbo.ReclamationsIdt(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ReclamDet_User FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id)
);
GO

CREATE NONCLUSTERED INDEX IX_sysUser_Email ON dbo.sysUser(Email);
CREATE NONCLUSTERED INDEX IX_Postes_Autorises_User ON dbo.Postes_Autorises(FK_User_Id);
CREATE NONCLUSTERED INDEX IX_userConnection_User ON dbo.userConnection(FK_User_Id);
CREATE NONCLUSTERED INDEX IX_userConnection_Date ON dbo.userConnection(DateConnection);
CREATE NONCLUSTERED INDEX IX_Roles_User ON dbo.Roles(FK_User_Id);
CREATE NONCLUSTERED INDEX IX_UsersXClients_Client ON dbo.UsersXClients(FK_Client_Id);
CREATE NONCLUSTERED INDEX IX_Polices_Client ON dbo.Polices(Fk_Client_Id);
CREATE NONCLUSTERED INDEX IX_Polices_Compagnie ON dbo.Polices(FK_Compagnie_Id);
CREATE NONCLUSTERED INDEX IX_Polices_DateEcheance ON dbo.Polices(DateEcheance);
CREATE NONCLUSTERED INDEX IX_Adherents_Police ON dbo.Adherents(FK_Police_Id);
CREATE NONCLUSTERED INDEX IX_Adherents_User ON dbo.Adherents(FK_User_Id);
CREATE NONCLUSTERED INDEX IX_PersACharge_Adherent ON dbo.PersACharge(FK_Adherent_Id);
CREATE NONCLUSTERED INDEX IX_Risques_Police ON dbo.Risques(FK_Police_Id);
CREATE NONCLUSTERED INDEX IX_Risques_DateEcheance ON dbo.Risques(DateEcheance);
CREATE NONCLUSTERED INDEX IX_Garanties_Risque ON dbo.Garanties(FK_Risque_Id);
CREATE NONCLUSTERED INDEX IX_Sinistres_Risque ON dbo.Sinistres(FK_Risque_Id);
CREATE NONCLUSTERED INDEX IX_Sinistres_Police ON dbo.Sinistres(FK_Police_Id);
CREATE NONCLUSTERED INDEX IX_Sinistres_Adherent ON dbo.Sinistres(FK_Adherent_Id);
CREATE NONCLUSTERED INDEX IX_Sinistres_Date ON dbo.Sinistres(DateSin);
CREATE NONCLUSTERED INDEX IX_Sinistres_Statut ON dbo.Sinistres(Statut);
CREATE NONCLUSTERED INDEX IX_Quittances_Police ON dbo.Quittances(FK_Police_Id);
CREATE NONCLUSTERED INDEX IX_Quittances_DateEcheance ON dbo.Quittances(DateEcheance);
CREATE NONCLUSTERED INDEX IX_ReclamationsIdt_User ON dbo.ReclamationsIdt(FK_User_Client);
CREATE NONCLUSTERED INDEX IX_ReclamationsIdt_Statut ON dbo.ReclamationsIdt(Statut);
CREATE NONCLUSTERED INDEX IX_ReclamationsDet_Reclamation ON dbo.ReclamationsDet(FK_Reclamation_Id);
GO

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
        p.Module AS module,
        c.RaisonSociale AS client,
        c.Particulier AS particulier,
        com.RaisonSociale AS compagnie
    FROM dbo.Polices p
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    INNER JOIN dbo.Compagnies com ON p.FK_Compagnie_Id = com.Id
    WHERE 
        @Source = 'A'
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
        ISNULL(s.MT_Indemnite, 0) AS mtRembourse,
        ISNULL(s.MT_Dommages, 0) AS mtDommage,
        ISNULL(s.MT_Dommages, 0) AS mtFrais,
        ISNULL(s.MT_Franchise, 0) AS mtFranchise,
        ISNULL(s.Observations, '') AS observation,
        CASE 
            WHEN p.Branche = 'Santé' THEN a.Nom
            ELSE ISNULL(r.Libelle, '-')
        END AS objet,
        CASE 
            WHEN p.Branche = 'Santé' THEN a.NumAdhesion
            ELSE r.Identifiant
        END AS identifiant
    FROM dbo.Sinistres s
    INNER JOIN dbo.Polices p ON s.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.Risques r ON s.FK_Risque_Id = r.Id
    LEFT JOIN dbo.Adherents a ON s.FK_Adherent_Id = a.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE p.Id = @FK_Police_Id
        AND (
            @Source = 'A'
            OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            OR (s.FK_Adherent_Id IN (SELECT Id FROM dbo.Adherents WHERE FK_User_Id = @FK_User_Id AND Actif = 'O'))
        );
    
    RETURN;
END
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
            WHEN p.Branche = 'Santé' THEN a.Nom
            ELSE ISNULL(r.Libelle, '-')
        END AS objet,
        CASE 
            WHEN p.Branche = 'Santé' THEN a.NumAdhesion
            ELSE r.Identifiant
        END AS identifiant
    FROM dbo.Sinistres s
    INNER JOIN dbo.Polices p ON s.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.Risques r ON s.FK_Risque_Id = r.Id
    LEFT JOIN dbo.Adherents a ON s.FK_Adherent_Id = a.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE p.Id = @FK_Police_Id
        AND s.Statut = 'E'
        AND (
            @Source = 'A'
            OR (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            OR (s.FK_Adherent_Id IN (SELECT Id FROM dbo.Adherents WHERE FK_User_Id = @FK_User_Id AND Actif = 'O'))
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
    INNER JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id
    WHERE uxc.FK_User_Id = @FK_User_Id
        AND uxc.Actif = 'O'
        AND p.Id = @FK_Police_Id
        AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N'));
    
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
            WHEN 'S' THEN 'Suspendu' 
            WHEN 'R' THEN 'Résilié' 
            WHEN 'M' THEN 'Mise en demeure' 
            WHEN 'A' THEN 'Annulée' 
            ELSE q.Statut 
        END AS statut
    FROM dbo.Quittances q
    INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE p.Id = @FK_Police_Id
        AND (
            @Source = 'A'
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
        INNER JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id
        WHERE uxc.FK_User_Id = @FK_User_Id
            AND uxc.Actif = 'O'
            AND p.Id = @FK_Police_Id
            AND ((@Encour = 'O' AND q.Solde > 0) OR (@Encour = 'N'))
            AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N'));
    END
    ELSE
    BEGIN
        SELECT 
            q.Id AS id,
            q.NumQuittance AS numero,
            q.DateDu AS dateDebut,
            q.DateAu AS dateFin,
            ISNULL(q.Montant, 0) AS montantTotal,
            ISNULL(q.Solde, 0) AS montantImpaye,
            q.DateEcheance AS dateEcheance
        FROM dbo.Quittances q
        INNER JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
        INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
        INNER JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id
        WHERE uxc.FK_User_Id = @FK_User_Id
            AND uxc.Actif = 'O'
            AND ((@Encour = 'O' AND q.Solde > 0) OR (@Encour = 'N'))
            AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N'));
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

    SELECT 
        a.Id AS id,
        RTRIM(LTRIM(ISNULL(a.Nom, '') + ' ' + ISNULL(a.Prenom, ''))) AS nom,
        a.Email AS email,
        a.NumAdhesion AS numAdhesion,
        a.Matricule AS matricule,
        a.DateNaissance AS dateNaissance,
        a.Actif AS actif,
        a.Telephone AS telephone,
        a.FK_User_Id AS fkUserId
    FROM dbo.Adherents a
    INNER JOIN dbo.Polices p ON a.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE (@Source = 'A' OR (@FK_Police_Id > 0 AND p.Id = @FK_Police_Id))
        AND a.Actif = 'O'
        AND (
            @Source = 'A'
            OR
            (uxc.FK_User_Id IS NOT NULL AND (@Source = 'E' AND c.Particulier = 'N'))
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

    SELECT 
        g.Id AS id,
        g.Libelle AS nom,
        ISNULL(g.Capital, 0) AS capital,
        ISNULL(g.Franchise, '-') AS franchise
    FROM dbo.Garanties g
    INNER JOIN dbo.Risques r ON g.FK_Risque_Id = r.Id
    INNER JOIN dbo.Polices p ON r.FK_Police_Id = p.Id
    INNER JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    WHERE r.Id = @FK_Risque_Id
        AND (
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
    WHERE (@Source = 'A' OR @Source = 'C' OR r.FK_User_Client = @FK_User_Id)
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

    IF EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id 
               AND (@Source = 'A' OR @Source = 'C' OR FK_User_Client = @FK_User_Id))
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

    INSERT INTO dbo.ReclamationsIdt (FK_User_Client, Sujet, Nature, Statut, DateStatut)
    VALUES (@FK_User_Id, @Sujet, @Nature, 'E', GETDATE());

    SET @NewId = SCOPE_IDENTITY();

    INSERT INTO dbo.ReclamationsDet (FK_Reclamation_Id, FK_User_Id, Nature, Message)
    VALUES (@NewId, @FK_User_Id, @Nature, @Message);

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

    IF EXISTS (SELECT 1 FROM dbo.ReclamationsIdt 
               WHERE Id = @FK_Reclamation_Id 
               AND (@Source IN ('A', 'C') OR FK_User_Client = @FK_User_Id))
    BEGIN
        INSERT INTO dbo.ReclamationsDet (FK_Reclamation_Id, FK_User_Id, Nature, Message)
        VALUES (@FK_Reclamation_Id, @FK_User_Id, @Nature, @Message);

        UPDATE dbo.ReclamationsIdt 
        SET Statut = CASE WHEN @Source IN ('A', 'C') THEN 'T' ELSE 'E' END, 
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

    IF EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id 
               AND (@Source IN ('A', 'C') OR FK_User_Client = @FK_User_Id))
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
    
    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
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
    
    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
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
    
    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END
    
    SELECT DISTINCT
        c.Id AS id,
        c.RaisonSociale AS raisonSociale,
        c.Particulier AS particulier,
        c.Email AS email,
        c.Adresse AS adresse,
        cParent.RaisonSociale AS parentClient,
        u.Nom AS userNom,
        x.FK_User_Id AS fkUserId
    FROM dbo.Clients c
    LEFT JOIN dbo.Clients cParent ON c.Fk_Client_Id = cParent.Id
    LEFT JOIN UsersXClients x ON x.FK_Client_Id = c.id
    LEFT JOIN dbo.sysUser u ON x.FK_User_Id = u.Id
    ORDER BY c.RaisonSociale;
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
    
    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
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
    
    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
        RETURN;
    END
    
    DECLARE @Nom VARCHAR(255), @Email VARCHAR(255), @NewUserId INT;
    SELECT @Nom = Nom, @Email = Email FROM dbo.Adherents WHERE Id = @FK_Adherent_Id;
    
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
    FROM dbo.sysUser ORDER BY Nom;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetStats]
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

    SELECT 
        (SELECT COUNT(DISTINCT p.Id) FROM dbo.Polices p 
         LEFT JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         LEFT JOIN dbo.Adherents a ON p.Id = a.FK_Police_Id AND a.FK_User_Id = @FK_User_Id AND a.Actif = 'O'
         WHERE (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            OR a.Id IS NOT NULL) AS totalPolices,

        (SELECT COUNT(*) FROM dbo.Sinistres s
         JOIN dbo.Polices p ON s.FK_Police_Id = p.Id
         JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         WHERE s.Statut = 'E'
           AND ((uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
            OR s.FK_Adherent_Id IN (SELECT Id FROM dbo.Adherents WHERE FK_User_Id = @FK_User_Id AND Actif = 'O'))) AS sinistresEnCours,

        (SELECT ISNULL(SUM(q.Montant), 0) FROM dbo.Quittances q
         JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
         JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         WHERE YEAR(q.DateDu) = YEAR(GETDATE())
           AND (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))) AS primeAnnuelle,

        (SELECT ISNULL(SUM(q.Solde), 0) FROM dbo.Quittances q
         JOIN dbo.Polices p ON q.FK_Police_Id = p.Id
         JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
         LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
         WHERE q.Solde > 0
           AND (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))) AS totalImpayes;

    SELECT 
        p.Branche AS label, 
        COUNT(*) AS value
    FROM dbo.Polices p
    LEFT JOIN dbo.Clients c ON p.Fk_Client_Id = c.Id
    LEFT JOIN dbo.UsersXClients uxc ON c.Id = uxc.FK_Client_Id AND uxc.FK_User_Id = @FK_User_Id AND uxc.Actif = 'O'
    LEFT JOIN dbo.Adherents a ON p.Id = a.FK_Police_Id AND a.FK_User_Id = @FK_User_Id AND a.Actif = 'O'
    WHERE (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
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
    WHERE (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
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
    WHERE (uxc.FK_User_Id IS NOT NULL AND ((@Source = 'M' AND c.Particulier = 'O') OR (@Source = 'E' AND c.Particulier = 'N')))
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
    
    IF NOT EXISTS (SELECT 1 FROM dbo.sysUser WHERE Id = @FK_User_Id AND token = @Token)
    BEGIN
        RAISERROR('Session expirée', 16, 1);
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

    IF EXISTS (SELECT 1 FROM dbo.ReclamationsIdt WHERE Id = @FK_Reclamation_Id AND (@Source = 'C' OR FK_User_Client = @FK_User_Id))
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
    SELECT Id AS id, Nom AS nom, Email AS email, Mobile AS mobile, Extranet AS extranet 
    FROM dbo.sysUser 
    WHERE Id_Auth = @IdAuth;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetUserByAuthId
    @IdAuth VARCHAR(255)
AS
BEGIN
    SELECT Id AS id, token, Extranet AS extranet 
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