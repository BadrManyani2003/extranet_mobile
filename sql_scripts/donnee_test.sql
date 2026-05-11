USE IBS_Extranet_Mobile;
GO

-- Vider les tables pour repartir sur une base propre (attention à l'ordre des dépendances)
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

-- 1. UTILISATEURS (Garder les ID_AUTH existants)
SET IDENTITY_INSERT dbo.sysUser ON;
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (1, '2bbf8b8e-7ac2-4cdb-ad5a-a7eee0ce5313', 'Badr Admin', '0600000001', 'admin@ibs.ma', 'P', 'O', 'O', GETDATE());
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (2, '8be99ee3-fef1-44ca-a702-8bceb53a9013', 'Client Entreprise (ABC)', '0522000001', 'contact@abc.ma', 'M', 'O', 'O', GETDATE());
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (3, 'a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p', 'Mohamed Alaoui', '0611223344', 'm.alaoui@gmail.com', 'P', 'O', 'O', GETDATE());
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (4, 'p5o4n3m2-l1k0-j9i8-h7g6-f5e4d3c2b1a0', 'Fatima Zahra', '0677889955', 'fatima.zahra@example.com', 'P', 'O', 'O', GETDATE());
SET IDENTITY_INSERT dbo.sysUser OFF;

-- 2. RÔLES
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (1, 'admincab');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (2, 'client');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (3, 'adherent');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (4, 'adherent');

-- 3. COMPAGNIES
SET IDENTITY_INSERT dbo.Compagnies ON;
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (1, 'Wafa Assurance', GETDATE());
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (2, 'Atlanta Assurance', GETDATE());
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (3, 'AXA Assurance Maroc', GETDATE());
SET IDENTITY_INSERT dbo.Compagnies OFF;

-- 4. CLIENTS
INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (100, NULL, 'ABC SARL', 'N', 'contact@abc.ma', 'Casablanca, Sidi Maarouf', '0522123456', GETDATE());
INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (102, NULL, 'Mohamed Alaoui', 'O', 'm.alaoui@gmail.com', 'Marrakech, Gueliz', '0611223344', GETDATE());
INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (103, NULL, 'Fatima Zahra', 'O', 'fatima.zahra@example.com', 'Fès, Ville Nouvelle', '0677889955', GETDATE());

-- Liaison Utilisateurs <-> Clients
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (2, 100, 'O', GETDATE());
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (3, 102, 'O', GETDATE());
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (4, 103, 'O', GETDATE());

-- 5. POLICES (CONTRATS)
-- Statuts : E=En cours, S=Suspendu, R=Résilié, M=Mise en demeure
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1000, 100, 1, 'Automobile', 'POL-AUTO-ABC-001', '20270101', 'E', 'Véhicules', '20260101', GETDATE());
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1001, 100, 2, 'Incendie', 'POL-INC-ABC-002', '20260601', 'S', 'Professionnel', '20250601', GETDATE());
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1002, 102, 3, 'Santé', 'POL-SANTE-001', '20270101', 'E', 'Santé', '20260101', GETDATE());
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1003, 103, 1, 'Automobile', 'POL-AUTO-FATIMA', '20261231', 'M', 'Véhicules', '20260101', GETDATE());
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1004, 100, 3, 'Accident du Travail', 'POL-AT-ABC', '20251231', 'R', 'Entreprise', '20250101', GETDATE());

-- 6. ADHÉRENTS
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, Actif, CreatedAt) 
VALUES (500, 1002, 3, 'Mohamed Alaoui', 'm.alaoui@gmail.com', 'ADH-ALAOUI-01', 'MAT-123', '19800510', 'O', GETDATE());
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, Actif, CreatedAt) 
VALUES (501, 1003, 4, 'Fatima Zahra', 'fatima.zahra@example.com', 'ADH-FATIMA-02', 'MAT-456', '19850320', 'O', GETDATE());

-- Personnes à charge (Famille Alaoui)
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (800, 500, 'Salma Alaoui', 'Epouse', '19820412', '20260101', GETDATE());
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (801, 500, 'Youssef Alaoui', 'Fils', '20100815', '20260101', GETDATE());

-- 7. RISQUES (Objets assurés)
SET IDENTITY_INSERT dbo.Risques ON;
INSERT INTO dbo.Risques (Id, FK_Police_Id, Libelle, Identifiant, Description, DateDu, DateEcheance, Statut, NumeroIBS, CreatedAt) 
VALUES (200, 1000, 'Renault Clio V', '1234-A-10', 'Véhicule de fonction direction', '20260101', '20270101', 'E', 'IBS-V-001', GETDATE());
INSERT INTO dbo.Risques (Id, FK_Police_Id, Libelle, Identifiant, Description, DateDu, DateEcheance, Statut, NumeroIBS, CreatedAt) 
VALUES (201, 1003, 'Hyundai i10', '5678-B-15', 'Véhicule personnel', '20260101', '20261231', 'E', 'IBS-V-002', GETDATE());
SET IDENTITY_INSERT dbo.Risques OFF;

-- 8. GARANTIES
SET IDENTITY_INSERT dbo.Garanties ON;
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (300, 200, 'Responsabilité Civile', 1000000.0, 0, GETDATE());
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (301, 200, 'Dommages Collision', 50000.0, 2500.0, GETDATE());
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (302, 201, 'Responsabilité Civile', 500000.0, 0, GETDATE());
SET IDENTITY_INSERT dbo.Garanties OFF;

-- 9. SINISTRES
-- Statuts : E=En cours, C=Clôturé, R=Réouvert
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (400, 200, 1000, NULL, 'SIN-2026-001', '20260215', '20260216', 'E', '20260216', 15000.0, 'Choc avant sur parking', GETDATE());
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Indemnite, Observations, CreatedAt) 
VALUES (401, 201, 1003, 501, 'SIN-2026-002', '20260110', '20260111', 'C', '20260125', 4500.0, 'Bris de glace', GETDATE());
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (402, NULL, 1002, 500, 'SIN-SANTE-99', '20260301', '20260305', 'R', '20260310', 1200.0, 'Révision dossier soins dentaires', GETDATE());

-- 10. QUITTANCES
-- Statuts : E=En cours (Impayée), S=Suspendue, R=Réglée, M=Mise en demeure, A=Annulée
INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (600, 1000, 'QUIT-AUTO-01', '20260101', '20261231', 4500.0, 0.0, '20260115', 'R', GETDATE());
INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (601, 1003, 'QUIT-FATIMA-01', '20260101', '20261231', 3200.0, 3200.0, '20260215', 'E', GETDATE());
INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (602, 1001, 'QUIT-SUSP', '20250601', '20260531', 1500.0, 1500.0, '20250701', 'S', GETDATE());

-- 11. RÉCLAMATIONS
SET IDENTITY_INSERT dbo.ReclamationsIdt ON;
INSERT INTO dbo.ReclamationsIdt (Id, FK_User_Client, DateReclamation, Sujet, Statut, Nature, CreatedAt) 
VALUES (700, 2, '20260301 10:00:00', 'Problème de connexion', 'C', 'D', GETDATE());
INSERT INTO dbo.ReclamationsIdt (Id, FK_User_Client, DateReclamation, Sujet, Statut, Nature, CreatedAt) 
VALUES (701, 3, '20260310 14:00:00', 'Remboursement non reçu', 'E', 'R', GETDATE());
SET IDENTITY_INSERT dbo.ReclamationsIdt OFF;

SET IDENTITY_INSERT dbo.ReclamationsDet ON;
INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (800, 700, 2, '20260301 10:00:00', 'C', 'Je ne vois pas mon nouveau contrat.');
INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (801, 700, 1, '20260302 09:00:00', 'A', 'Bonjour, il sera visible après validation demain.');
INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (802, 701, 3, '20260310 14:00:00', 'C', 'Le dossier SIN-SANTE-99 est toujours en attente.');
SET IDENTITY_INSERT dbo.ReclamationsDet OFF;
GO