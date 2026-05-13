USE IBS_Extranet_Mobile;
GO

-- Vider les tables
DELETE FROM dbo.ReclamationsDet;
DELETE FROM dbo.ReclamationsIdt;
DELETE FROM dbo.PolDocument;
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
-- Admins
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (1, '70a1c6e1-824a-4c43-bf8d-d87c9166226c', 'Admin Cabinet', '0600000001', 'admin@ibs.ma', 'A', 'O', 'O', '20260102');
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (2, 'd7f07349-272f-4700-b8bc-15e0b712ba48', 'Service Client IBS', '0600000002', 'contact@ibs.ma', 'A', 'O', 'O', '20260102');

-- Clients / Adhérents
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (3, 'c61b5227-2061-462e-a0e4-8e4c51705aa3', 'Sami Alami', '0611111111', 'sami@test.ma', 'C', 'O', 'O', '20260105');
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (4, '45b0921b-7fdb-45fb-98b9-8f85906300f2', 'Leyla Benjelloun', '0622222222', 'leyla@test.ma', 'C', 'O', 'O', '20260110');
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (5, '7cd40bdd-6536-416b-a329-88fc90ecd8e6', 'Yassine Mansouri', '0633333333', 'yassine@test.ma', 'C', 'O', 'O', '20260115');
SET IDENTITY_INSERT dbo.sysUser OFF;

-- 2. RÔLES
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (1, 'admin');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (2, 'commercial');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (3, 'client');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (4, 'client');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (5, 'adherent');

-- 3. COMPAGNIES
SET IDENTITY_INSERT dbo.Compagnies ON;
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (1, 'Wafa Assurance', '20260101');
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (2, 'AXA Assurance Maroc', '20260101');
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (3, 'Saham Assurance', '20260101');
SET IDENTITY_INSERT dbo.Compagnies OFF;

-- 4. CLIENTS
INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (100, NULL, 'ALAMI TRADING SARL', 'N', 'sami@test.ma', 'Casablanca, Anfa', '0522111111', '20260105');
INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (101, NULL, 'BENJELLOUN SERVICES', 'N', 'leyla@test.ma', 'Rabat, Agdal', '0537222222', '20260110');
INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (105, NULL, 'Yassine Mansouri', 'O', 'yassine@test.ma', 'Marrakech, Hivernage', '0633333333', '20260115');

-- Liaisons Users-Clients
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (3, 100, 'O', '20260105');
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (4, 101, 'O', '20260110');
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (5, 105, 'O', '20260115');

-- 5. POLICES
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1000, 100, 1, 'Automobile', 'FLOTTE-ALAMI-2026', '20270101', 'E', 'Véhicules', '20260101', '20260105');
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1001, 100, 2, 'Santé', 'SANTE-GROUP-ALAMI', '20270101', 'E', 'Santé', '20260101', '20260105');
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1002, 101, 3, 'Habitation', 'MRH-BENJELLOUN', '20261231', 'E', 'Bâtiments', '20260101', '20260110');
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1003, 101, 1, 'RC Professionnelle', 'RCP-BENJELLOUN', '20261231', 'E', 'Responsabilité', '20260101', '20260110');
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1004, 105, 2, 'Santé', 'SANTE-IND-MANSOURI', '20270101', 'E', 'Santé', '20260201', '20260201');

-- 6. RISQUES
SET IDENTITY_INSERT dbo.Risques ON;
INSERT INTO dbo.Risques (Id, FK_Police_Id, Libelle, Identifiant, Description, DateDu, DateEcheance, Statut, NumeroIBS, CreatedAt) 
VALUES (200, 1000, 'Range Rover Sport', '1234-A-10', 'Véhicule Direction', '20260101', '20270101', 'E', 'IBS-V-001', '20260105');
INSERT INTO dbo.Risques (Id, FK_Police_Id, Libelle, Identifiant, Description, DateDu, DateEcheance, Statut, NumeroIBS, CreatedAt) 
VALUES (201, 1000, 'Dacia Duster', '5678-B-10', 'Véhicule Livraison 1', '20260101', '20270101', 'E', 'IBS-V-002', '20260105');
INSERT INTO dbo.Risques (Id, FK_Police_Id, Libelle, Identifiant, Description, DateDu, DateEcheance, Statut, NumeroIBS, CreatedAt) 
VALUES (205, 1002, 'Appartement Casablanca', 'APP-ANFA-01', 'Résidence Principale', '20260101', '20261231', 'E', 'IBS-H-001', '20260110');
SET IDENTITY_INSERT dbo.Risques OFF;

-- 7. GARANTIES
SET IDENTITY_INSERT dbo.Garanties ON;
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (300, 200, 'RC Obligatoire', 5000000.0, 0, '20260105');
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (301, 200, 'Tierce Collision', 450000.0, 5000.0, '20260105');
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (302, 205, 'Incendie', 2000000.0, 1000.0, '20260110');
SET IDENTITY_INSERT dbo.Garanties OFF;

-- 8. ADHÉRENTS
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, Actif, CreatedAt) 
VALUES (500, 1001, 3, 'Sami Alami', 'sami@test.ma', 'ADH-100-01', 'MAT-001', '19850615', 'O', '20260105');
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, Actif, CreatedAt) 
VALUES (501, 1001, NULL, 'Karim Alami', 'karim@test.ma', 'ADH-100-02', 'MAT-002', '19900220', 'O', '20260105');
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, Actif, CreatedAt) 
VALUES (505, 1004, 5, 'Yassine Mansouri', 'yassine@test.ma', 'ADH-500-01', 'MAT-MANS', '19921130', 'O', '20260201');

-- Familles (PersACharge)
-- Famille Sami Alami
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (810, 500, 'Sarah Alami', 'Epouse', '19880312', '20260105', '20260105');
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (811, 500, 'Adam Alami', 'Fils', '20180722', '20260105', '20260105');
-- Famille Karim Alami
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (815, 501, 'Nora Alami', 'Fille', '20211105', '20260105', '20260105');
-- Famille Yassine Mansouri
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (800, 505, 'Hind Mansouri', 'Epouse', '19940510', '20260201', '20260201');
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (801, 505, 'Omar Mansouri', 'Fils', '20200315', '20260201', '20260201');

-- 9. QUITTANCES
INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (600, 1000, 'Q-AUTO-01', '20260101', '20260131', 2500.0, 0.0, '20260115', 'R', '20260105');
INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (601, 1001, 'Q-SANTE-01', '20260101', '20261231', 15000.0, 5000.0, '20260215', 'M', '20260105');

-- 10. DOCUMENTS
INSERT INTO dbo.PolDocument (fk_police_id, fk_document_id, libelle) VALUES (1000, 101, 'Conditions Générales Auto');
INSERT INTO dbo.PolDocument (fk_police_id, fk_document_id, libelle) VALUES (1000, 102, 'Conditions Particulières Auto');
INSERT INTO dbo.PolDocument (fk_police_id, fk_document_id, libelle) VALUES (1001, 201, 'Tableau de Garanties Santé');
INSERT INTO dbo.PolDocument (fk_police_id, fk_document_id, libelle) VALUES (1001, 202, 'Guide de l''Adhérent');
INSERT INTO dbo.PolDocument (fk_police_id, fk_document_id, libelle) VALUES (1002, 301, 'Contrat MRH');

-- 11. SINISTRES (Minimum 2 par police)
-- Police 1000 (Auto)
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (400, 200, 1000, NULL, 'SIN-AUTO-101', '20260210', '20260212', 'E', '20260212', 12500.0, 'Bris de glace', '20260212');
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (401, 201, 1000, NULL, 'SIN-AUTO-102', '20260305', '20260306', 'E', '20260306', 8900.0, 'Choc stationnement', '20260306');

-- Police 1001 (Santé Group)
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Indemnite, Observations, CreatedAt) 
VALUES (402, NULL, 1001, 500, 'REM-SNT-201', '20260120', '20260125', 'C', '20260205', 1250.0, 'Hospitalisation', '20260125');
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Indemnite, Observations, CreatedAt) 
VALUES (403, NULL, 1001, 500, 'REM-SNT-202', '20260215', '20260220', 'E', '20260220', 350.0, 'Pharmacie', '20260220');

-- Police 1002 (MRH)
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (404, 205, 1002, NULL, 'SIN-MRH-301', '20260115', '20260117', 'C', '20260210', 4500.0, 'Dégât des eaux', '20260117');
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (405, 205, 1002, NULL, 'SIN-MRH-302', '20260310', '20260311', 'E', '20260311', 12000.0, 'Vol contenu', '20260311');

-- Police 1003 (RC Pro)
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (406, NULL, 1003, NULL, 'SIN-RCP-401', '20260220', '20260225', 'E', '20260225', 55000.0, 'Erreur conseil', '20260225');
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (407, NULL, 1003, NULL, 'SIN-RCP-402', '20260315', '20260316', 'E', '20260316', 15000.0, 'Dommage immatériel', '20260316');

-- Police 1004 (Santé Ind)
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Indemnite, Observations, CreatedAt) 
VALUES (408, NULL, 1004, 505, 'REM-IND-501', '20260215', '20260220', 'C', '20260301', 650.0, 'Consultation', '20260220');
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Indemnite, Observations, CreatedAt) 
VALUES (409, NULL, 1004, 505, 'REM-IND-502', '20260310', '20260312', 'E', '20260312', 1100.0, 'Analyses labo', '20260312');

-- 12. RÉCLAMATIONS
SET IDENTITY_INSERT dbo.ReclamationsIdt ON;
INSERT INTO dbo.ReclamationsIdt (Id, FK_User_Client, DateReclamation, Sujet, Statut, Nature, CreatedAt) 
VALUES (700, 3, '20260310 10:00:00', 'Question Prime', 'E', 'C', '20260310');
SET IDENTITY_INSERT dbo.ReclamationsIdt OFF;

SET IDENTITY_INSERT dbo.ReclamationsDet ON;
INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (800, 700, 3, '20260310 10:00:00', 'C', 'Bonjour, pourquoi mon solde est de 5000 DH sur la police Santé ?');
SET IDENTITY_INSERT dbo.ReclamationsDet OFF;

GO