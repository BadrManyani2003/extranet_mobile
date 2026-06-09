USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'IBS_Extranet_Mobile')
    CREATE DATABASE IBS_Extranet_Mobile;
GO

USE IBS_Extranet_Mobile;
GO

IF OBJECT_ID('dbo.ReclamationsDet', 'U') IS NOT NULL DROP TABLE dbo.ReclamationsDet;
IF OBJECT_ID('dbo.ReclamationsIdt', 'U') IS NOT NULL DROP TABLE dbo.ReclamationsIdt;
IF OBJECT_ID('dbo.UserSimulationClients', 'U') IS NOT NULL DROP TABLE dbo.UserSimulationClients;
IF OBJECT_ID('dbo.PolDocument', 'U') IS NOT NULL DROP TABLE dbo.PolDocument;
IF OBJECT_ID('dbo.Garanties', 'U') IS NOT NULL DROP TABLE dbo.Garanties;
IF OBJECT_ID('dbo.sinComplement', 'U') IS NOT NULL DROP TABLE dbo.sinComplement;
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
    Extranet CHAR(1) NOT NULL DEFAULT 'N',
    Mobile CHAR(1) NOT NULL DEFAULT 'N',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
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
    Actif CHAR(1) NOT NULL  DEFAULT 'O',
    DateActivation DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
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
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Compagnies PRIMARY KEY CLUSTERED (Id)
);
GO

CREATE TABLE dbo.Clients
(
    Id INT NOT NULL,
    Fk_Client_Id INT NULL,
    RaisonSociale VARCHAR(255) NOT NULL,
    Particulier CHAR(1) NOT NULL DEFAULT 'N',
    Email VARCHAR(255) NULL,
    Adresse VARCHAR(500) NULL,
    Telephone VARCHAR(20) NULL,
    recClt CHAR(1) NOT NULL DEFAULT 'N',
    recAdh CHAR(1) NOT NULL DEFAULT 'N',
    CreatedAt DATETIME2 NOT NULL  DEFAULT GETDATE(),
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
    Actif CHAR(1) NOT NULL  DEFAULT 'O',
    CreatedAt DATETIME2 NOT NULL  DEFAULT GETDATE(),
    CONSTRAINT PK_UsersXClients PRIMARY KEY CLUSTERED (FK_User_Id, FK_Client_Id),
    CONSTRAINT FK_UXC_User FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UXC_Client FOREIGN KEY (FK_Client_Id) REFERENCES dbo.Clients(Id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.UserSimulationClients
(
    fk_user_id INT NOT NULL,
    fk_client_id INT NOT NULL,
    CONSTRAINT PK_UserSimulationClients PRIMARY KEY CLUSTERED (fk_user_id, fk_client_id),
    CONSTRAINT FK_USC_User FOREIGN KEY (fk_user_id) REFERENCES dbo.sysUser(Id) ON DELETE CASCADE,
    CONSTRAINT FK_USC_Client FOREIGN KEY (fk_client_id) REFERENCES dbo.Clients(Id) ON DELETE CASCADE
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
    PBistime DECIMAL(18,2) NULL,
    bp DECIMAL(18,2) NULL,
    bpconsome DECIMAL(18,2) NULL,
    CreatedAt DATETIME2 NOT NULL  DEFAULT GETDATE(),
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
    NomComplet VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NULL,
    NumAdhesion INT NULL,
    Matricule INT NULL,
    DateNaissance DATE NULL,
    DateAdhesion DATE NULL,
    Actif CHAR(1) NOT NULL DEFAULT 'O',
    Telephone VARCHAR(20) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
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
    CreatedAt DATETIME2 NOT NULL  DEFAULT GETDATE(),
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
    Assure VARCHAR(255) NULL,
    DateDu DATE NULL,
    DateEcheance DATE NULL,
    NumeroIBS INT NULL,
    Statut CHAR(1) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
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
    Franchise VARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL  DEFAULT GETDATE(),
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
    NumeroSin INT NULL,
    DateSin DATE NULL,
    DateDeclaration DATE NULL,
    Statut CHAR(1) NULL,
    DateStatut DATE NULL,
    MT_Dommages DECIMAL(18,2) NULL,
    MT_Franchise VARCHAR(255) NULL,
    MT_Indemnite DECIMAL(18,2) NULL,
    Observations VARCHAR(max) NULL,
    CreatedAt DATETIME2 NOT NULL  DEFAULT GETDATE(),
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
    NumQuittance INT NULL,
    DateDu DATE NULL,
    DateAu DATE NULL,
    Montant DECIMAL(18,2) NULL,
    Solde DECIMAL(18,2) NULL,
    DateEcheance DATE NULL,
    Statut CHAR(1) NULL,
    CreatedAt DATETIME2 NOT NULL  DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT PK_Quittances PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Quittances_Police FOREIGN KEY (FK_Police_Id) REFERENCES dbo.Polices(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Quittances_NumQuittance UNIQUE NONCLUSTERED (NumQuittance)
);
GO

CREATE TABLE dbo.PolDocument
(
    Id INT NOT NULL IDENTITY(1,1),
    fk_police_id INT NOT NULL,
    fk_document_id INT NOT NULL,
    libelle VARCHAR(255) NULL,
    CONSTRAINT PK_PolDocument PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_PolDocument_Police FOREIGN KEY (fk_police_id) REFERENCES dbo.Polices(Id) ON DELETE CASCADE
);
GO

IF OBJECT_ID('dbo.StdDocument', 'U') IS NOT NULL DROP TABLE dbo.StdDocument;
GO

CREATE TABLE dbo.StdDocument
(
    Id            INT            NOT NULL IDENTITY(1,1),
    Nature        VARCHAR(50)    NOT NULL,                       
    Identifiant   INT            NOT NULL,                       
    Type          VARCHAR(255)   NOT NULL,                      
    Document      VARBINARY(MAX) NOT NULL,                       
    Transfere     CHAR(1)        NOT NULL DEFAULT 'N',           
    FK_User_Id    INT            NOT NULL,                       
    DateCreation  DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_StdDocument PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_StdDocument_User FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id)
);
GO

CREATE TABLE dbo.ReclamationsIdt
(
    Id INT NOT NULL IDENTITY(1,1),
    FK_User_Client INT NOT NULL,
    DateReclamation DATETIME2 NOT NULL DEFAULT GETDATE(),
    Sujet VARCHAR(255) NULL,
    Statut CHAR(1) NOT NULL  DEFAULT 'E',
    DateStatut DATETIME2 NULL,
    Nature CHAR(1) NULL,
    CreatedAt DATETIME2 NOT NULL  DEFAULT GETDATE(),
    CONSTRAINT PK_ReclamationsIdt PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_ReclamIdt_User FOREIGN KEY (FK_User_Client) REFERENCES dbo.sysUser(Id)
);
GO

CREATE TABLE dbo.ReclamationsDet
(
    Id INT NOT NULL IDENTITY(1,1),
    FK_Reclamation_Id INT NOT NULL,
    FK_User_Id INT NOT NULL,
    DateMessage DATETIME2 NOT NULL  DEFAULT GETDATE(),
    Nature CHAR(1) NULL,
    Message VARCHAR(2000) NULL,
    CONSTRAINT PK_ReclamationsDet PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_ReclamDet_Reclamation FOREIGN KEY (FK_Reclamation_Id) REFERENCES dbo.ReclamationsIdt(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ReclamDet_User FOREIGN KEY (FK_User_Id) REFERENCES dbo.sysUser(Id)
);
GO

CREATE TABLE dbo.sinComplement
(
    id INT NOT NULL IDENTITY(1,1),
    fk_sinistre_id INT NOT NULL,
    Ref_Sinistre INT NULL,
    Date_Sinistre DATE NULL,
    Victime VARCHAR(255) NULL,
    Lieu VARCHAR(255) NULL,
    Type_Sinistre VARCHAR(255) NULL,
    Circonstances VARCHAR(max) NULL,
    Lesion VARCHAR(255) NULL,
    Etape VARCHAR(255) NULL,
    ITT VARCHAR(255) NULL,
    IPP_Estime DECIMAL(18,2) NULL,
    IPP_Traitant DECIMAL(18,2) NULL,
    IPP_Conseil DECIMAL(18,2) NULL,
    IPP_Retenu DECIMAL(18,2) NULL,
    Frais_Medicaux DECIMAL(18,2) NULL,
    Frais_Transport DECIMAL(18,2) NULL,
    Indem_Jrn DECIMAL(18,2) NULL,
    Nature_indem VARCHAR(255) NULL,
    Montant_indem DECIMAL(18,2) NULL,
    CONSTRAINT PK_sinComplement PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_sinComplement_Sinistre FOREIGN KEY (fk_sinistre_id) REFERENCES dbo.Sinistres(Id) ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_sysUser_Email ON dbo.sysUser(Email);
CREATE NONCLUSTERED INDEX IX_Postes_Autorises_User ON dbo.Postes_Autorises(FK_User_Id);
CREATE NONCLUSTERED INDEX IX_userConnection_User ON dbo.userConnection(FK_User_Id);
CREATE NONCLUSTERED INDEX IX_userConnection_Date ON dbo.userConnection(DateConnection);
CREATE NONCLUSTERED INDEX IX_Roles_User ON dbo.Roles(FK_User_Id);
CREATE NONCLUSTERED INDEX IX_UsersXClients_Client ON dbo.UsersXClients(FK_Client_Id);
CREATE NONCLUSTERED INDEX IX_UserSimulationClients_Client ON dbo.UserSimulationClients(fk_client_id);
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
CREATE NONCLUSTERED INDEX IX_PolDocument_Police ON dbo.PolDocument(fk_police_id);
CREATE NONCLUSTERED INDEX IX_StdDocument_Nature ON dbo.StdDocument(Nature);
CREATE NONCLUSTERED INDEX IX_StdDocument_Identifiant ON dbo.StdDocument(Nature, Identifiant);
CREATE NONCLUSTERED INDEX IX_StdDocument_User ON dbo.StdDocument(FK_User_Id);
CREATE NONCLUSTERED INDEX IX_StdDocument_DateCreation ON dbo.StdDocument(DateCreation);
CREATE NONCLUSTERED INDEX IX_sinComplement_Sinistre ON dbo.sinComplement(fk_sinistre_id);
GO


