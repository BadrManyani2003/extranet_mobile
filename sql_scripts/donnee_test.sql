USE IBS_Extranet_Mobile;
GO

-- Vider les tables
DELETE FROM dbo.ReclamationsDet;
DELETE FROM dbo.ReclamationsIdt;
DELETE FROM dbo.Quittances;
DELETE FROM dbo.Sinistres;
DELETE FROM dbo.Garanties;
DELETE FROM dbo.Risques;
DELETE FROM dbo.PersACharge;
DELETE FROM dbo.Adherents;
DELETE FROM dbo.Polices;
DELETE FROM dbo.UsersXClients;
DELETE FROM dbo.Clients;
DELETE FROM dbo.Compagnies;
DELETE FROM dbo.Roles;
DELETE FROM dbo.userConnection;
DELETE FROM dbo.Postes_Autorises;
DELETE FROM dbo.sysUser;
GO

-- 1. UTILISATEURS
SET IDENTITY_INSERT dbo.sysUser ON;
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (1, 'bc3d71ef-6c83-4aa5-bf16-98cb7dca91d9', 'Admin Cabinet', '0600000001', 'admin_cabinet@ibs.ma', 'A', 'O', 'O', GETDATE());

INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (2, '83135d15-1d9e-4657-8335-cf7e8d379b9f', 'Commercial Cabinet', '0600000002', 'commercial_cabinet@ibs.ma', 'A', 'O', 'O', GETDATE());

INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (3, '39a0ee46-d3af-4705-9657-7d6bdceb8564', 'Client Alpha', '0611111111', 'client1@test.ma', 'C', 'O', 'O', GETDATE());

INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (4, 'f54f4545-2f20-4152-a45c-49cb85e2b45a', 'Client Beta', '0622222222', 'client2@test.ma', 'C', 'O', 'O', GETDATE());

INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (5, 'e5207aed-c931-4241-a762-defe0f67a324', 'Adherent Solo', '0633333333', 'adherent1@test.ma', 'C', 'O', 'O', GETDATE());

INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (6, '5df05dec-075a-4f23-9f35-43c3385b0e66', 'Adherent Famille', '0644444444', 'adherent2@test.ma', 'C', 'O', 'O', GETDATE());
SET IDENTITY_INSERT dbo.sysUser OFF;

-- 2. RÔLES
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (1, 'admin');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (2, 'commercial');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (3, 'client');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (4, 'client');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (5, 'adherent');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (6, 'adherent');

-- 3. COMPAGNIES
SET IDENTITY_INSERT dbo.Compagnies ON;
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (1, 'Wafa Assurance', GETDATE());
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (2, 'Atlanta Assurance', GETDATE());
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (3, 'AXA Assurance Maroc', GETDATE());
SET IDENTITY_INSERT dbo.Compagnies OFF;

-- 4. CLIENTS (Pas d'IDENTITY)
INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (100, NULL, 'SOCIETE ALPHA', 'N', 'client1@test.ma', 'Zone Ind.', '0522111111', GETDATE());

INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (101, NULL, 'BETA SERVICES', 'N', 'client2@test.ma', 'Centre Ville', '0522222222', GETDATE());

INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (105, NULL, 'Adherent Solo', 'O', 'adherent1@test.ma', 'Rue 1', '0633333333', GETDATE());

INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (106, NULL, 'Adherent Famille', 'O', 'adherent2@test.ma', 'Rue 2', '0644444444', GETDATE());

-- Liaisons
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (3, 100, 'O', GETDATE());
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (4, 101, 'O', GETDATE());
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (5, 105, 'O', GETDATE());
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (6, 106, 'O', GETDATE());

-- 5. POLICES (Pas d'IDENTITY)
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1000, 100, 1, 'Automobile', 'POL-ALPHA-AUTO', '20270101', 'E', 'Véhicules', '20260101', GETDATE());

INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1001, 100, 3, 'Santé', 'POL-ALPHA-SANTE', '20270101', 'E', 'Santé', '20260101', GETDATE());

INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1002, 101, 2, 'Incendie', 'POL-BETA-INC', '20261231', 'M', 'Bâtiments', '20260101', GETDATE());

INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1003, 105, 3, 'Santé', 'POL-SOLO-SANTE', '20270601', 'E', 'Santé', '20260601', GETDATE());

INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1004, 106, 1, 'Santé', 'POL-FAMILLE-SANTE', '20270101', 'E', 'Santé', '20260101', GETDATE());

-- 6. ADHÉRENTS (Pas d'IDENTITY)
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, Actif, CreatedAt) 
VALUES (500, 1003, 5, 'Adherent Solo', 'adherent1@test.ma', 'ADH-SOLO-01', 'MAT-SOLO', '19900101', 'O', GETDATE());

INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, Actif, CreatedAt) 
VALUES (501, 1004, 6, 'Adherent Famille', 'adherent2@test.ma', 'ADH-FAM-02', 'MAT-FAM', '19850515', 'O', GETDATE());

-- Personnes à charge pour Adherent 2 (Pas d'IDENTITY)
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (800, 501, 'Conjoint Famille', 'Epouse', '19870210', '20260101', GETDATE());
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (801, 501, 'Enfant 1 Famille', 'Fils', '20150320', '20260101', GETDATE());
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (802, 501, 'Enfant 2 Famille', 'Fille', '20180905', '20260101', GETDATE());

-- 7. RISQUES (IDENTITY)
SET IDENTITY_INSERT dbo.Risques ON;
INSERT INTO dbo.Risques (Id, FK_Police_Id, Libelle, Identifiant, Description, DateDu, DateEcheance, Statut, NumeroIBS, CreatedAt) 
VALUES (200, 1000, 'Peugeot 3008', '1111-B-10', 'Véhicule de fonction', '20260101', '20270101', 'E', 'IBS-V-ALPHA', GETDATE());

INSERT INTO dbo.Risques (Id, FK_Police_Id, Libelle, Identifiant, Description, DateDu, DateEcheance, Statut, NumeroIBS, CreatedAt) 
VALUES (201, 1002, 'Entrepôt Principal', 'BAT-01', 'Stock marchandises', '20260101', '20261231', 'E', 'IBS-B-BETA', GETDATE());
SET IDENTITY_INSERT dbo.Risques OFF;

-- 8. GARANTIES (IDENTITY)
SET IDENTITY_INSERT dbo.Garanties ON;
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (300, 200, 'Responsabilité Civile', 2000000.0, 0, GETDATE());
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (301, 200, 'Dommages', 150000.0, 3000.0, GETDATE());
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (302, 201, 'Incendie & Explosion', 5000000.0, 10000.0, GETDATE());
SET IDENTITY_INSERT dbo.Garanties OFF;

-- 9. SINISTRES (Pas d'IDENTITY dans votre schéma actuel pour cette table)
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (400, 200, 1000, NULL, 'SIN-AUTO-001', '20260201', '20260202', 'E', '20260202', 25000.0, 'Choc latéral', GETDATE());

INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Indemnite, Observations, CreatedAt) 
VALUES (401, NULL, 1004, 501, 'SIN-SANTE-002', '20260115', '20260120', 'C', '20260201', 850.0, 'Pharmacie', GETDATE());

INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (402, NULL, 1003, 500, 'SIN-SANTE-003', '20260310', '20260312', 'E', '20260312', 4500.0, 'Hospitalisation', GETDATE());

-- 10. QUITTANCES (Pas d'IDENTITY)
INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (600, 1000, 'QUIT-001', '20260101', '20261231', 6500.0, 0.0, '20260115', 'R', GETDATE());

INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (601, 1002, 'QUIT-002', '20260101', '20261231', 12000.0, 12000.0, '20260201', 'M', GETDATE());

INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (602, 1003, 'QUIT-003', '20260601', '20270531', 3500.0, 0.0, '20260615', 'R', GETDATE());

-- 11. RÉCLAMATIONS (IDENTITY)
SET IDENTITY_INSERT dbo.ReclamationsIdt ON;
INSERT INTO dbo.ReclamationsIdt (Id, FK_User_Client, DateReclamation, Sujet, Statut, Nature, CreatedAt) 
VALUES (700, 3, '20260301 09:00:00', 'Question Prime Auto', 'C', 'D', GETDATE());

INSERT INTO dbo.ReclamationsIdt (Id, FK_User_Client, DateReclamation, Sujet, Statut, Nature, CreatedAt) 
VALUES (701, 6, '20260315 11:30:00', 'Remboursement Sinistre 401', 'E', 'R', GETDATE());
SET IDENTITY_INSERT dbo.ReclamationsIdt OFF;

SET IDENTITY_INSERT dbo.ReclamationsDet ON;
INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (800, 700, 3, '20260301 09:00:00', 'C', 'Bonjour, pourquoi ma prime auto a augmenté ?');

INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (801, 700, 2, '20260301 10:00:00', 'A', 'Bonjour, cest dû à la taxe légale de 2%.');

INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (802, 701, 6, '20260315 11:30:00', 'C', 'Je nai pas encore reçu le virement pour le sinistre du 15/01.');
SET IDENTITY_INSERT dbo.ReclamationsDet OFF;
GO