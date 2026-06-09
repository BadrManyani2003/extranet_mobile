USE [IBS_Extranet_Mobile];
GO

-- =====================================================
-- NETTOYAGE COMPLET
-- =====================================================
DELETE FROM dbo.ReclamationsDet;
DELETE FROM dbo.ReclamationsIdt;
DELETE FROM dbo.StdDocument;
DELETE FROM dbo.PolDocument;
DELETE FROM dbo.Garanties;
DELETE FROM dbo.sinComplement;
DELETE FROM dbo.Sinistres;
DELETE FROM dbo.Quittances;
DELETE FROM dbo.PersACharge;
DELETE FROM dbo.Adherents;
DELETE FROM dbo.Risques;
DELETE FROM dbo.Polices;
DELETE FROM dbo.UserSimulationClients;
DELETE FROM dbo.UsersXClients;
DELETE FROM dbo.Clients;
DELETE FROM dbo.userConnection;
DELETE FROM dbo.Postes_Autorises;
DELETE FROM dbo.Roles;
DELETE FROM dbo.sysUser;
DELETE FROM dbo.Compagnies;
GO

-- Réinitialisation des colonnes d'identité
DBCC CHECKIDENT ('dbo.Compagnies', RESEED, 0);
DBCC CHECKIDENT ('dbo.Risques', RESEED, 0);
DBCC CHECKIDENT ('dbo.Garanties', RESEED, 0);
DBCC CHECKIDENT ('dbo.ReclamationsIdt', RESEED, 0);
DBCC CHECKIDENT ('dbo.Postes_Autorises', RESEED, 0);
GO

-- =====================================================
-- 1. COMPAGNIES D'ASSURANCE
-- =====================================================
INSERT INTO dbo.Compagnies (RaisonSociale, CreatedAt) VALUES
('Wafa Assurance', '20260101'),
('Sanlam Maroc', '20260101'),
('RMA Watanya', '20260101'),
('AtlantaSanad', '20260101'),
('AXA Assurance Maroc', '20260101');

DECLARE @Comp1Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'Wafa Assurance');
DECLARE @Comp2Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'Sanlam Maroc');
DECLARE @Comp3Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'RMA Watanya');
DECLARE @Comp4Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'AtlantaSanad');
DECLARE @Comp5Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'AXA Assurance Maroc');

-- =====================================================
-- 2. UTILISATEURS (id_auth conserves)
-- =====================================================
SET IDENTITY_INSERT dbo.sysUser ON;
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt, token) VALUES
(1, 'b192749b-683c-408c-bfbc-876c045c5b4c', 'YTS', '0661223344', 'yts@ibs.ma', 'A', 'O', 'N', '20260101', 'token_admin_001'),
(2, 'commercial_keycloak_002', 'Meryem Ouazzani', '0661556677', 'com1@test.ma', 'C', 'O', 'N', '20260101', 'token_com_001'),
(3, 'f823c1e8-46db-43c6-a8a7-f86b506c3fbc', 'Badr MANYANI', '0661889900', 'badr@manyani.ma', 'C', 'O', 'N', '20260101', 'token_societe1'),
(4, 'client_societe2_auth', 'Taha MANYANI', '0661112233', 'amine@manyani.ma', 'C', 'O', 'N', '20260101', 'token_societe2'),
(5, '6054d0c2-0f70-4b79-8635-13b8f69e4aa8', 'Amine QAMCH', '0661445566', 'amine.qamch@test.ma', 'C', 'N', 'O', '20260101', 'token_adherent1'),
(6, '', 'Nadia Slaoui', '0661778899', 'adherent2@test.ma', 'C', 'N', 'O', '20260101', 'token_adherent2');
SET IDENTITY_INSERT dbo.sysUser OFF;

DECLARE @AdminId INT = 1;
DECLARE @CommercialId INT = 2;
DECLARE @UserClient1 INT = 3;
DECLARE @UserClient2 INT = 4;
DECLARE @UserAdherent1 INT = 5;
DECLARE @UserAdherent2 INT = 6;

-- Rles
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES 
(@AdminId, 'ADMIN'), 
(@AdminId, 'GESTIONNAIRE'),
(@CommercialId, 'COMMERCIAL'),
(@UserClient1, 'CLIENT'),
(@UserClient2, 'CLIENT'),
(@UserAdherent1, 'CLIENT'), 
(@UserAdherent1, 'ADHERENT'),
(@UserAdherent2, 'ADHERENT');

-- Postes autoriss
INSERT INTO dbo.Postes_Autorises (FK_User_Id, Libelle, Identifiant, Actif, CreatedAt) VALUES
(@AdminId, 'Siège Social Rabat - Agdal', 'IDENT_RABAT_001', 'O', '20260101'),
(@AdminId, 'Direction Rgionale Casablanca', 'IDENT_CASA_002', 'O', '20260101'),
(@CommercialId, 'Agence Maarif Casablanca', 'IDENT_CASA_003', 'O', '20260101');

-- Connexions utilisateurs
INSERT INTO dbo.userConnection (FK_User_Id, FK_Poste_Id, DateConnection, DateSortie) VALUES
(@AdminId, 1, '20260102 08:00:00', '20260102 18:00:00'),
(@CommercialId, 3, '20260102 08:30:00', '20260102 17:30:00'),
(@AdminId, 2, '20260103 08:15:00', NULL);

-- =====================================================
-- 3. CLIENTS
-- =====================================================
INSERT INTO dbo.Clients (Id, RaisonSociale, Particulier, Email, Adresse, Telephone, recClt, recAdh, CreatedAt) VALUES
-- Clients Entreprises
(1001, 'Energies Renouvelables du Sud S.A.', 'N', 'achats@enersud.ma', 'Lotissement La Colline, Sidi Maarouf, Casablanca', '0522334455', 'O', 'O', '20260101'),
(1002, 'Digital Solutions Maroc S.A.', 'N', 'direction.achats@digitalsol.ma', 'Avenue Annakhil, Hay Ryad, Rabat', '0537719000', 'O', 'O', '20260101'),
(1003, 'Aero Services Logistiques', 'N', 'assurances@aeroserv.ma', 'Aroport Mohammed V, Nouaceur', '0522434343', 'O', 'N', '20260101'),
(1004, 'Grande Distribution Alimentation S.A.', 'N', 'direction@gda.ma', 'Bd Al Qods, Sidi Maarouf, Casablanca', '0520334456', 'N', 'O', '20260101'),
(1005, 'Banque du Commerce Moderne', 'N', 'assurances@banquecom.ma', '140 Avenue Hassan II, Casablanca', '0522494000', 'O', 'O', '20260101'),
-- Clients Particuliers
(2001, 'Omar Tazi', 'O', 'omar.tazi@email.ma', 'Rue Abou Al Alaa, Quartier Racine, Maarif, Casablanca', '0661223345', 'O', 'O', '20260101'),
(2002, 'Fatima El Fassi', 'O', 'fatima.elfassi@email.ma', 'Avenue Hassan II, Rsidence Al Amal, Guliz, Marrakech', '0667889900', 'O', 'O', '20260101'),
(2003, 'Rachid Belkadi', 'O', 'rachid.belkadi@email.ma', 'Hay El Wifaq, Avenue Hassan II, Tmara', '0665112233', 'O', 'O', '20260101'),
(2004, 'Souad Alaoui', 'O', 'souad.alaoui@email.ma', 'Rue Ibn Toumert, Quartier Palmiers, Casablanca', '0662445566', 'O', 'O', '20260101'),
(2005, 'Karim Naciri', 'O', 'karim.naciri@email.ma', 'Avenue Moulay Ismail, Agdal, Rabat', '0667338844', 'O', 'O', '20260101');

DECLARE @ClientId1 INT = 1001; -- Energies Renouvelables du Sud
DECLARE @ClientId2 INT = 1002; -- Digital Solutions Maroc
DECLARE @ClientId3 INT = 1003; -- Aero Services Logistiques
DECLARE @ClientId4 INT = 1004; -- Grande Distribution Alimentation
DECLARE @ClientId5 INT = 1005; -- Banque du Commerce Moderne
DECLARE @ClientId6 INT = 2001; -- Omar Tazi
DECLARE @ClientId7 INT = 2002; -- Fatima El Fassi
DECLARE @ClientId8 INT = 2003; -- Rachid Belkadi
DECLARE @ClientId9 INT = 2004; -- Souad Alaoui
DECLARE @ClientId10 INT = 2005; -- Karim Naciri

-- Liaison Users <-> Clients
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES
(@UserClient1, @ClientId2, 'O', '20260101'),  -- Hamza -> Digital Solutions
(@UserClient2, @ClientId1, 'O', '20260101'),  -- Sanae -> Energies Sud
(@UserAdherent1, @ClientId6, 'O', '20260101'), -- Anas -> Omar Tazi
(@UserAdherent2, @ClientId7, 'O', '20260101'); -- Nadia -> Fatima El Fassi

-- =====================================================
-- 4. POLICES D'ASSURANCE (Automobile & Maladie & IARD)
-- =====================================================
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) VALUES
-- === BRANCHE AUTOMOBILE ===
-- Digital Solutions Maroc
(101, @ClientId2, @Comp1Id, 'Automobile', '1010.0001.00000101', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
(102, @ClientId2, @Comp1Id, 'Automobile', '1010.0001.00000102', '20261231', 'E', 'DIRECTION', '20260101', '20260101'),
-- Energies Renouvelables du Sud
(103, @ClientId1, @Comp2Id, 'Automobile', '1020.0002.00000201', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
(104, @ClientId1, @Comp2Id, 'Automobile', '1020.0002.00000202', '20261231', 'E', 'LOGISTIQUE', '20260101', '20260101'),
-- Aero Services Logistiques
(105, @ClientId3, @Comp3Id, 'Automobile', '1030.0003.00000301', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
-- Grande Distribution Alimentation
(106, @ClientId4, @Comp4Id, 'Automobile', '1040.0004.00000401', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
-- Banque du Commerce Moderne
(107, @ClientId5, @Comp1Id, 'Automobile', '1010.0005.00000501', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
-- Particuliers
(108, @ClientId6, @Comp4Id, 'Automobile', '1040.0006.00000601', '20260630', 'E', 'INDIV', '20260101', '20260101'),
(109, @ClientId8, @Comp4Id, 'Automobile', '1040.0008.00000801', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(110, @ClientId9, @Comp5Id, 'Automobile', '1050.0009.00000901', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(111, @ClientId10, @Comp5Id, 'Automobile', '1050.0010.00001001', '20260930', 'E', 'INDIV', '20260101', '20260101'),

-- === BRANCHE SANT ===
-- Digital Solutions Maroc
(201, @ClientId2, @Comp1Id, 'Santé', '2010.0001.00000101', '20261231', 'E', 'GROUPE', '20260101', '20260101'),
-- Energies Renouvelables du Sud
(202, @ClientId1, @Comp2Id, 'Santé', '2020.0002.00000201', '20261231', 'E', 'GROUPE', '20260101', '20260101'),
-- Aero Services Logistiques
(203, @ClientId3, @Comp3Id, 'Santé', '2030.0003.00000301', '20261231', 'E', 'GROUPE', '20260601', '20260101'),
-- Banque du Commerce Moderne
(204, @ClientId5, @Comp1Id, 'Santé', '2010.0005.00000502', '20261231', 'E', 'GROUPE', '20260101', '20260101'),
-- Particuliers
(205, @ClientId6, @Comp4Id, 'Santé', '2040.0006.00000602', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(206, @ClientId7, @Comp5Id, 'Santé', '2050.0007.00000701', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(207, @ClientId9, @Comp4Id, 'Santé', '2040.0009.00000902', '20261231', 'E', 'INDIV', '20260101', '20260101'),

-- === BRANCHE ACCIDENT DE TRAVAIL ===
-- Digital Solutions Maroc
(301, @ClientId2, @Comp1Id, 'AT', '3010.0001.00000101', '20261231', 'E', 'GROUPE', '20260101', '20260101'),
-- Energies Renouvelables du Sud
(302, @ClientId1, @Comp2Id, 'AT', '3020.0002.00000201', '20261231', 'E', 'GROUPE', '20260101', '20260101'),

-- === BRANCHE IARD - MULTI RISQUES INDUSTRIELLE ===
-- Site Industriel Energies Renouvelables du Sud
(401, @ClientId1, @Comp2Id, 'IARD', '4010.0002.00000201', '20261231', 'E', 'MR_INDUSTRIELLE', '20260101', '20260101'),
-- SIte Industriel Digital Solutions Maroc
(402, @ClientId2, @Comp1Id, 'IARD', '4020.0001.00000101', '20261231', 'E', 'MR_INDUSTRIELLE', '20260101', '20260101'),
-- Usine Grande Distribution Alimentation
(403, @ClientId4, @Comp4Id, 'IARD', '4030.0004.00000402', '20261231', 'E', 'MR_INDUSTRIELLE', '20260101', '20260101');

-- Variables polices Auto
DECLARE @PolAutoDSM1 INT = 101, @PolAutoDSM2 INT = 102;
DECLARE @PolAutoERS1 INT = 103, @PolAutoERS2 INT = 104;
DECLARE @PolAutoASL INT = 105, @PolAutoGDA INT = 106, @PolAutoBCM INT = 107;
DECLARE @PolAutoOmar INT = 108, @PolAutoRachid INT = 109;
DECLARE @PolAutoSouad INT = 110, @PolAutoKarim INT = 111;

-- Variables polices Maladie
DECLARE @PolMaladieeDSM INT = 201, @PolMaladieeERS INT = 202, @PolMaladieeASL INT = 203;
DECLARE @PolMaladieeBCM INT = 204, @PolMaladieeOmar INT = 205;
DECLARE @PolMaladieeFatima INT = 206, @PolMaladieeSouad INT = 207;

-- Variables polices AT
DECLARE @PolATDSM INT = 301, @PolATERS INT = 302;

-- Variables polices IARD
DECLARE @PolIARD_ERS INT = 401;
DECLARE @PolIARD_DSM INT = 402;
DECLARE @PolIARD_GDA INT = 403;

-- =====================================================
-- 5. ADHERENTS (Maladie)
-- =====================================================
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, DateAdhesion, Actif, Telephone, CreatedAt) VALUES
-- Digital Solutions Maroc - Police Maladie 201
(5001, @PolMaladieeDSM, NULL, 'Jawad El Hariri', 'jawad.hariri@digitalsol.ma', 10001, 2020001, '19750412', '20260101', 'O', '0661234567', '20260101'),
(5002, @PolMaladieeDSM, NULL, 'Houda Bennis', 'houda.bennis@digitalsol.ma', 10002, 2020002, '19800823', '20260101', 'O', '0661234568', '20260101'),
(5003, @PolMaladieeDSM, NULL, 'Tarik Fassi', 'tarik.fassi@digitalsol.ma', 10003, 2020003, '19851107', '20260101', 'O', '0661234569', '20260101'),
(5004, @PolMaladieeDSM, NULL, 'Latifa Amrani', 'latifa.amrani@digitalsol.ma', 10004, 2020004, '19900314', '20260101', 'O', '0661234570', '20260101'),
(5005, @PolMaladieeDSM, @UserAdherent1, 'Amine QAMCH', 'amine.qamch@test.ma', 10005, 2020005, '19920707', '20260101', 'O', '0661445566', '20260101'),
(5006, @PolMaladieeDSM, NULL, 'Mohamed Sefrioui', 'mohamed.sefrioui@digitalsol.ma', 10006, 2020006, '19880419', '20260101', 'O', '0661234573', '20260101'),

-- Energies Renouvelables du Sud - Police Maladie 202
(5007, @PolMaladieeERS, NULL, 'Abdelghani Benali', 'abdelghani.benali@enersud.ma', 10011, 2020011, '19801215', '20260101', 'O', '0661234571', '20260101'),
(5008, @PolMaladieeERS, NULL, 'Nouha Sekkat', 'nouha.sekkat@enersud.ma', 10012, 2020012, '19850328', '20260101', 'O', '0661234572', '20260101'),
(5009, @PolMaladieeERS, NULL, 'Samir Benjelloun', 'samir.benjelloun@enersud.ma', 10013, 2020013, '19870803', '20260101', 'O', '0661234574', '20260101'),

-- Aero Services Logistiques - Police Maladie 203
(5010, @PolMaladieeASL, @UserAdherent2, 'Nadia Slaoui', 'adherent2@test.ma', 10020, 2020020, '19801010', '20260601', 'O', '0661778899', '20260101'),
(5011, @PolMaladieeASL, NULL, 'Khalil Bennouna', 'khalil.bennouna@aeroserv.ma', 10021, 2020021, '19780615', '20260601', 'O', '0661234575', '20260101'),
(5012, @PolMaladieeASL, NULL, 'Saida Lahlou', 'saida.lahlou@aeroserv.ma', 10022, 2020022, '19850922', '20260601', 'O', '0661234576', '20260101'),

-- Banque du Commerce Moderne - Police Maladie 204
(5013, @PolMaladieeBCM, NULL, 'Redouane Taibi', 'redouane.taibi@banquecom.ma', 10030, 2020030, '19820318', '20260101', 'O', '0661234577', '20260101'),
(5014, @PolMaladieeBCM, NULL, 'Ghita El Omary', 'ghita.omary@banquecom.ma', 10031, 2020031, '19860705', '20260101', 'O', '0661234578', '20260101'),

-- Particuliers - Police Maladie 205 (Omar)
(5015, @PolMaladieeOmar, NULL, 'Omar Tazi', 'omar.tazi@email.ma', 10040, 9999001, '19850403', '20260101', 'O', '0661223345', '20260101'),
-- Particuliers - Police Maladie 206 (Fatima)
(5016, @PolMaladieeFatima, NULL, 'Fatima El Fassi', 'fatima.elfassi@email.ma', 10041, 9999002, '19900812', '20260101', 'O', '0667889900', '20260101'),
-- Particuliers - Police Maladie 207 (Souad)
(5017, @PolMaladieeSouad, NULL, 'Souad Alaoui', 'souad.alaoui@email.ma', 10042, 9999003, '19761125', '20260101', 'O', '0662445566', '20260101');

-- Personnes à charge
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) VALUES
-- Famille Amine QAMCH (5005)
(6001, 5005, 'Yassine QAMCH', 'Enfant', '20150515', '20260101', '20260101'),
(6002, 5005, 'Salma QAMCH', 'Conjoint', '19940820', '20260101', '20260101'),
-- Famille Jawad El Hariri (5001)
(6003, 5001, 'Rania El Hariri', 'Enfant', '20100312', '20260101', '20260101'),
(6004, 5001, 'Adam El Hariri', 'Enfant', '20140625', '20260101', '20260101'),
-- Famille Houda Bennis (5002)
(6005, 5002, 'Mehdi Ouardi', 'Conjoint', '19781130', '20260101', '20260101'),
-- Famille Abdelghani Benali (5007)
(6006, 5007, 'Aya Benali', 'Enfant', '20180110', '20260101', '20260101'),
(6007, 5007, 'Ines Benali', 'Enfant', '20200915', '20260101', '20260101'),
-- Famille Nadia Slaoui (5010)
(6008, 5010, 'Omar Idrissi', 'Enfant', '20120805', '20260601', '20260101'),
(6009, 5010, 'Sara Idrissi', 'Enfant', '20150320', '20260601', '20260101'),
-- Famille Tarik Fassi (5003)
(6010, 5003, 'Hanane Fassi', 'Conjoint', '19881015', '20260101', '20260101'),
-- Famille Omar Tazi (5015)
(6011, 5015, 'Meriem Tazi', 'Conjoint', '19870920', '20260101', '20260101'),
(6012, 5015, 'Ali Tazi', 'Enfant', '20170610', '20260101', '20260101');

-- =====================================================
-- 6. RISQUES (Vhicules Automobile + Biens IARD)
-- =====================================================
INSERT INTO dbo.Risques (FK_Police_Id, Libelle, Identifiant, Description, Assure, DateDu, DateEcheance, NumeroIBS, Statut, CreatedAt) VALUES
-- Flotte Digital Solutions 1 (101)
(@PolAutoDSM1, 'Dacia Duster Essence', '12345-A-1', 'Vhicule Service Direction - Rabat', 'Amine Bouhaddou', '20260101', '20261231', 9001, 'O', '20260101'),
(@PolAutoDSM1, 'Renault Clio 5 Diesel', '67890-A-7', 'Vhicule Service Commercial - Casablanca', 'Ibtissam Mrini', '20260101', '20261231', 9002, 'O', '20260101'),
(@PolAutoDSM1, 'Peugeot 3008 Allure', '11223-A-33', 'Vhicule Direction Rgionale - Marrakech', 'Zakaria Doukkali', '20260101', '20261231', 9003, 'O', '20260101'),
(@PolAutoDSM1, 'Citron Berlingo Utilitaire', '12346-A-2', 'Vhicule Technique - Maintenance', 'Nabil Riffi', '20260101', '20261231', 9004, 'O', '20260101'),

-- Digital Solutions Direction (102)
(@PolAutoDSM2, 'BMW Srie 3 320d', '99887-D-1', 'Vhicule de Fonction PDG', 'Kamal Temsamani', '20260101', '20261231', 9005, 'O', '20260101'),
(@PolAutoDSM2, 'Audi A4 Avant', '99888-D-2', 'Vhicule de Fonction DGA', 'Siham Belhaj', '20260101', '20261231', 9006, 'O', '20260101'),

-- Flotte Energies Sud 1 (103)
(@PolAutoERS1, 'Toyota Land Cruiser Prado', '44556-C-1', 'Vhicule Site Solaire Benguerir', 'Younes Ait Taleb', '20260101', '20261231', 9007, 'O', '20260101'),
(@PolAutoERS1, 'Nissan Navara', '44557-C-2', 'Vhicule Site Solaire Khouribga', 'Mohcine El Khalil', '20260101', '20261231', 9008, 'O', '20260101'),
(@PolAutoERS1, 'Mitsubishi L200', '44558-C-3', 'Vhicule Site Solaire Laayoune', 'Fouad Ouhadi', '20260101', '20261231', 9009, 'O', '20260101'),

-- Flotte Energies Sud Logistique (104)
(@PolAutoERS2, 'Mercedes Actros 1845', '55667-L-1', 'Camion Transport Panneaux', 'Hicham Laghrissi', '20260101', '20261231', 9010, 'O', '20260101'),
(@PolAutoERS2, 'Volvo FH 460', '55668-L-2', 'Camion Transport Batteries', 'Soufiane Chafik', '20260101', '20261231', 9011, 'O', '20260101'),

-- Flotte Aero Services (105)
(@PolAutoASL, 'Toyota Hilux Double Cabine', '33445-B-1', 'Transport Aroport - Navette Personnel', 'Driss Berrada', '20260101', '20261231', 9012, 'O', '20260101'),
(@PolAutoASL, 'Mercedes Sprinter 315', '33446-B-2', 'Transport Personnel Aroport Casa', 'Salwa Cherif', '20260101', '20261231', 9013, 'O', '20260101'),
(@PolAutoASL, 'Renault Master', '33447-B-3', 'Transport Bagages Aroport', 'Hassan Fadel', '20260101', '20261231', 9014, 'O', '20260101'),

-- Flotte Grande Distribution (106)
(@PolAutoGDA, 'Ford Transit Custom', '77889-E-1', 'Vhicule Livraison - Enseigne Alimentation', 'Khalil Benjelloun', '20260101', '20261231', 9015, 'O', '20260101'),
(@PolAutoGDA, 'Renault Kangoo Express', '77890-E-2', 'Vhicule Livraison - Enseigne Discount', 'Hasna El Amrani', '20260101', '20261231', 9016, 'O', '20260101'),

-- Flotte Banque Moderne (107)
(@PolAutoBCM, 'Volkswagen Passat', '99001-F-1', 'Vhicule Service Direction', 'Omar Khattabi', '20260101', '20261231', 9017, 'O', '20260101'),
(@PolAutoBCM, 'Skoda Octavia', '99002-F-2', 'Vhicule Service Agences', 'Said Ouahbi', '20260101', '20261231', 9018, 'O', '20260101'),

-- Particuliers
(@PolAutoOmar, 'Hyundai Tucson 2024', '11223-G-1', 'SUV Blanc - Vhicule Personnel', 'Omar Tazi', '20260101', '20260630', 9019, 'O', '20260101'),
(@PolAutoRachid, 'Dacia Sandero Stepway', '11224-G-2', 'Citadine Grise - Vhicule Personnel', 'Rachid Belkadi', '20260101', '20261231', 9020, 'O', '20260101'),
(@PolAutoSouad, 'Renault Captur', '11225-G-3', 'SUV Compact Bleu - Vhicule Personnel', 'Souad Alaoui', '20260101', '20261231', 9021, 'O', '20260101'),
(@PolAutoKarim, 'Peugeot 208', '11226-G-4', 'Citadine Rouge - Vhicule Personnel', 'Karim Naciri', '20260101', '20260930', 9022, 'O', '20260101'),

-- AT Digital Solutions
(@PolATDSM, 'Ahmed El Mansouri', '3030001', 'Assuré Accident de Travail', 'Ahmed El Mansouri', '20260101', '20261231', 9501, 'O', '20260101'),
-- AT Energies Sud
(@PolATERS, 'Said Naciri', '3030002', 'Assuré Accident de Travail', 'Said Naciri', '20260101', '20261231', 9502, 'O', '20260101'),

-- === RISQUES IARD - SITE INDUSTRIEL ENERGIES SUD ===
(@PolIARD_ERS, 'Btiment Administratif', 'BAT-ADM-001', 'Btiment R+2 direction - Site Benguerir', 'Energies Sud', '20260101', '20261231', 10001, 'O', '20260101'),
(@PolIARD_ERS, 'Atelier de Production', 'ATELIER-001', 'Atelier fabrication panneaux solaires - 5000m', 'Energies Sud', '20260101', '20261231', 10002, 'O', '20260101'),
(@PolIARD_ERS, 'Entrept Stockage', 'ENTREPOT-001', 'Entrepot stockage matires premires - 8000m', 'Energies Sud', '20260101', '20261231', 10003, 'O', '20260101'),
(@PolIARD_ERS, 'Station de Transformation', 'STATION-001', 'Station transformation lectrique - Site principal', 'Energies Sud', '20260101', '20261231', 10004, 'O', '20260101'),

-- === RISQUES IARD - SITE INDUSTRIEL DIGITAL SOLUTIONS ===
(@PolIARD_DSM, 'Data Center Principal', 'DC-CASA-001', 'Data Center Tier III - Casablanca', 'Digital Solutions', '20260101', '20261231', 10005, 'O', '20260101'),
(@PolIARD_DSM, 'Data Center Secours', 'DC-RABAT-002', 'Data Center Secours - Rabat', 'Digital Solutions', '20260101', '20261231', 10006, 'O', '20260101'),
(@PolIARD_DSM, 'Services Centraux', 'SVC-ADM-001', 'Btiment Services Administratifs - 3000m', 'Digital Solutions', '20260101', '20261231', 10007, 'O', '20260101'),
(@PolIARD_DSM, 'Centre de Formation', 'CEN-FORM-001', 'Centre de formation technique - 2000m', 'Digital Solutions', '20260101', '20261231', 10008, 'O', '20260101'),

-- === RISQUES IARD - USINE GDA ===
(@PolIARD_GDA, 'Entrepot Principal', 'ENT-001-GDA', 'Entrepot stockage alimentaire - 15000m', 'Grande Distribution', '20260101', '20261231', 10009, 'O', '20260101'),
(@PolIARD_GDA, 'Chane Logistique', 'LOG-001-GDA', 'Chane de logistique automatise - 10000m', 'Grande Distribution', '20260101', '20261231', 10010, 'O', '20260101'),
(@PolIARD_GDA, 'Chambres Frigorifiques', 'FROID-001-GDA', 'Chambres frigorifiques - secteur périssables', 'Grande Distribution', '20260101', '20261231', 10011, 'O', '20260101'),
(@PolIARD_GDA, 'Bureaux Administratifs', 'BUR-001-GDA', 'Btiment bureaux R+3 - 2500m', 'Grande Distribution', '20260101', '20261231', 10012, 'O', '20260101');

-- =====================================================
-- 7. GARANTIES (Auto + IARD)
-- =====================================================
INSERT INTO dbo.Garanties (FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES
-- Dacia Duster DSM
(1, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(1, 'Dfense et Recours', 500000.00, '0', '20260101'),
(1, 'Tierce Collision', 250000.00, '2500', '20260101'),
(1, 'Incendie', 200000.00, '2000', '20260101'),
(1, 'Vol', 250000.00, '3000', '20260101'),
(1, 'Bris de Glaces', 15000.00, '500', '20260101'),

-- Renault Clio DSM
(2, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(2, 'Tierce Collision', 180000.00, '2000', '20260101'),
(2, 'Vol', 180000.00, '2500', '20260101'),

-- Peugeot 3008 DSM
(3, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(3, 'Tierce Complète', 350000.00, '3500', '20260101'),
(3, 'Bris de Glaces', 20000.00, '500', '20260101'),

-- BMW Srie 3 DSM Direction
(5, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(5, 'Tierce Complète', 450000.00, '5000', '20260101'),
(5, 'Assistance Automobile 0 KM', 50000.00, '0', '20260101'),

-- Toyota Land Cruiser ERS
(7, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(7, 'Tierce Collision', 400000.00, '4000', '20260101'),
(7, 'Vol et Incendie', 400000.00, '5000', '20260101'),

-- Toyota Hilux ASL
(12, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(12, 'Tierce Collision', 350000.00, '4000', '20260101'),
(12, 'Vol et Incendie', 350000.00, '5000', '20260101'),

-- Ford Transit GDA
(15, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(15, 'Tierce Collision', 200000.00, '3000', '20260101'),
(15, 'Vol', 200000.00, '3500', '20260101'),

-- Hyundai Tucson Omar
(19, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(19, 'Dfense et Recours', 500000.00, '0', '20260101'),
(19, 'Tierce Collision', 220000.00, '2000', '20260101'),
(19, 'Vol', 220000.00, '2500', '20260101'),
(19, 'Incendie', 220000.00, '1500', '20260101'),

-- Dacia Sandero Rachid
(20, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(20, 'Tierce Collision', 150000.00, '1500', '20260101'),
(20, 'Incendie', 150000.00, '1000', '20260101'),

-- Renault Captur Souad
(21, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(21, 'Dfense et Recours', 500000.00, '0', '20260101'),
(21, 'Tierce Collision', 200000.00, '2000', '20260101'),
(21, 'Vol', 200000.00, '2500', '20260101'),
(21, 'Bris de Glaces', 12000.00, '400', '20260101'),

-- Peugeot 208 Karim
(22, 'Responsabilit Civile', 5000000.00, '0', '20260101'),
(22, 'Tierce Collision', 140000.00, '1500', '20260101'),

-- === GARANTIES IARD - Site Energies Sud ===
-- Btiment Administratif (25)
(25, 'Incendie', 5000000.00, '5000', '20260101'),
(25, 'Explosion', 5000000.00, '5000', '20260101'),
(25, 'Dgts Eaux', 1500000.00, '2500', '20260101'),
(25, 'Foudre', 5000000.00, '5000', '20260101'),
(25, 'Attentat', 5000000.00, '10000', '20260101'),
(25, 'Dommages Electriques', 1000000.00, '3000', '20260101'),

-- Atelier de Production (26)
(26, 'Incendie', 15000000.00, '10000', '20260101'),
(26, 'Explosion', 15000000.00, '10000', '20260101'),
(26, 'Dgts Eaux', 5000000.00, '5000', '20260101'),
(26, 'Pertes d''Exploitation', 10000000.00, '15000', '20260101'),
(26, 'Bris Machine', 8000000.00, '7500', '20260101'),
(26, 'Vol et Vandalisme', 3000000.00, '5000', '20260101'),

-- Entrepot Stockage (27)
(27, 'Incendie', 12000000.00, '8000', '20260101'),
(27, 'Dgts Eaux', 4000000.00, '4000', '20260101'),
(27, 'Vol et Vandalisme', 5000000.00, '6000', '20260101'),
(27, 'Rfrigration', 3000000.00, '5000', '20260101'),

-- Station Transformation (28)
(28, 'Incendie', 8000000.00, '7500', '20260101'),
(28, 'Dommages Electriques', 5000000.00, '5000', '20260101'),
(28, 'Perte d''Energie', 4000000.00, '5000', '20260101'),

-- === GARANTIES IARD - Site Digital Solutions ===
-- Data Center Principal (29)
(29, 'Incendie', 20000000.00, '15000', '20260101'),
(29, 'Dgts Eaux', 10000000.00, '10000', '20260101'),
(29, 'Dommages Electriques', 12000000.00, '10000', '20260101'),
(29, 'Perte d''Exploitation', 25000000.00, '20000', '20260101'),
(29, 'Attentat', 20000000.00, '25000', '20260101'),
(29, 'Dfaillance Logicielle', 5000000.00, '7500', '20260101'),

-- Data Center Secours (30)
(30, 'Incendie', 15000000.00, '10000', '20260101'),
(30, 'Dgts Eaux', 8000000.00, '8000', '20260101'),
(30, 'Dommages Electriques', 10000000.00, '8000', '20260101'),
(30, 'Perte d''Exploitation', 15000000.00, '15000', '20260101'),

-- Services Centraux (31)
(31, 'Incendie', 3000000.00, '3000', '20260101'),
(31, 'Dgts Eaux', 1000000.00, '2000', '20260101'),
(31, 'Vol', 500000.00, '1500', '20260101'),

-- Centre Formation (32)
(32, 'Incendie', 2000000.00, '2500', '20260101'),
(32, 'Dgts Eaux', 800000.00, '1500', '20260101'),
(32, 'Responsabilit Civile', 3000000.00, '2000', '20260101'),

-- === GARANTIES IARD - Usine GDA ===
-- Entrepot Principal (33)
(33, 'Incendie', 18000000.00, '12000', '20260101'),
(33, 'Dgts Eaux', 6000000.00, '5000', '20260101'),
(33, 'Vol et Vandalisme', 8000000.00, '7000', '20260101'),
(33, 'Rfrigration', 5000000.00, '6000', '20260101'),
(33, 'Perte d''Exploitation', 12000000.00, '15000', '20260101'),

-- Chane Logistique (34)
(34, 'Incendie', 12000000.00, '10000', '20260101'),
(34, 'Bris Machine', 8000000.00, '8000', '20260101'),
(34, 'Dgts Eaux', 4000000.00, '4000', '20260101'),
(34, 'Pannes Automatiques', 5000000.00, '5000', '20260101'),

-- Chambres Frigorifiques (35)
(35, 'Incendie', 10000000.00, '8000', '20260101'),
(35, 'Rfrigration', 8000000.00, '6000', '20260101'),
(35, 'Dgts Eaux', 5000000.00, '5000', '20260101'),
(35, 'Perte de Marchandises', 6000000.00, '5000', '20260101'),

-- Bureaux Administratifs (36)
(36, 'Incendie', 2000000.00, '2000', '20260101'),
(36, 'Dgts Eaux', 800000.00, '1500', '20260101'),
(36, 'Vol', 300000.00, '1000', '20260101');

-- =====================================================
-- 8. QUITTANCES
-- =====================================================
INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) VALUES
-- AUTO
(7001, @PolAutoDSM1, 1001, '20260101', '20260630', 45000.00, 0.00, '20260215', 'R', '20260101'),
(7002, @PolAutoDSM1, 1002, '20260701', '20261231', 45000.00, 45000.00, '20260715', 'E', '20260601'),
(7003, @PolAutoERS1, 2001, '20260101', '20261231', 85000.00, 0.00, '20260215', 'R', '20260101'),
(7004, @PolAutoASL, 3001, '20260101', '20261231', 120000.00, 0.00, '20260215', 'R', '20260101'),
(7005, @PolAutoOmar, 4001, '20260101', '20260630', 4200.00, 0.00, '20260215', 'R', '20260101'),
(7006, @PolAutoOmar, 4002, '20260701', '20261231', 4200.00, 4200.00, '20260715', 'E', '20260601'),
(7007, @PolAutoRachid, 5001, '20260101', '20260630', 3500.00, 0.00, '20260215', 'R', '20260101'),
(7008, @PolAutoRachid, 5002, '20260701', '20261231', 3500.00, 3500.00, '20260715', 'E', '20260601'),

-- SANT
(7009, @PolMaladieeDSM, 6001, '20260101', '20260630', 250000.00, 0.00, '20260215', 'R', '20260101'),
(7010, @PolMaladieeDSM, 6002, '20260701', '20261231', 250000.00, 250000.00, '20260715', 'E', '20260601'),
(7011, @PolMaladieeERS, 7001, '20260101', '20260630', 450000.00, 0.00, '20260215', 'R', '20260101'),
(7012, @PolMaladieeERS, 7002, '20260701', '20261231', 450000.00, 450000.00, '20260715', 'E', '20260601'),
(7013, @PolMaladieeASL, 8001, '20260601', '20261231', 180000.00, 0.00, '20260715', 'R', '20260601'),
(7014, @PolMaladieeOmar, 9001, '20260101', '20261231', 3600.00, 0.00, '20260215', 'R', '20260101'),
(7015, @PolMaladieeFatima, 10001, '20260101', '20261231', 2800.00, 0.00, '20260215', 'R', '20260101'),

-- AT Digital Solutions - Police AT 301
(7016, @PolATDSM, 11001, '20260101', '20261231', 12000.00, 4000.00, '20260215', 'E', '20260101'),
-- AT Energies Sud - Police AT 302
(7017, @PolATERS, 11002, '20260101', '20261231', 15000.00, 0.00, '20260215', 'R', '20260101'),

-- === QUITTANCES IARD ===
-- Police IARD Energies Sud
(7018, @PolIARD_ERS, 20001, '20260101', '20261231', 450000.00, 0.00, '20260228', 'R', '20260101'),
(7019, @PolIARD_ERS, 20002, '20260701', '20261231', 225000.00, 225000.00, '20260731', 'E', '20260601'),

-- Police IARD Digital Solutions
(7020, @PolIARD_DSM, 30001, '20260101', '20261231', 750000.00, 0.00, '20260228', 'R', '20260101'),
(7021, @PolIARD_DSM, 30002, '20260701', '20261231', 375000.00, 375000.00, '20260731', 'E', '20260601'),

-- Police IARD Grande Distribution
(7022, @PolIARD_GDA, 40001, '20260101', '20261231', 580000.00, 0.00, '20260228', 'R', '20260101');

-- =====================================================
-- 9. SINISTRES (Auto + Maladie + AT + IARD)
-- =====================================================
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, MT_Franchise, MT_Indemnite, Observations, CreatedAt) VALUES
-- === SINISTRES AUTOMOBILE ===
(8001, 1, @PolAutoDSM1, NULL, 55001, '20260215', '20260216', 'C', '20260310', 15000.00, '2500', 12500.00, 'Accident avec tiers sur Bd Mohammed V, Casablanca - Constat amiable', '20260216'),
(8002, 2, @PolAutoDSM1, NULL, 55002, '20260420', '20260421', 'E', '20260421', 8500.00, '2000', 0.00, 'Choc arrire parking sige Rabat - En attente expertise', '20260421'),
(8003, 3, @PolAutoDSM1, NULL, 55003, '20260810', '20260811', 'E', '20260811', 22000.00, '3500', 0.00, 'Accident avec taxi route Marrakech-Agadir - Rapport police attendu', '20260811'),
(8004, 12, @PolAutoASL, NULL, 55004, '20260128', '20260129', 'C', '20260220', 28000.00, '4000', 24000.00, 'Collision avec glissire scurit A3 sortie Aroport Mohammed V', '20260129'),
(8005, 13, @PolAutoASL, NULL, 55005, '20260315', '20260316', 'C', '20260405', 12000.00, '3000', 9000.00, 'Accrochage avec bus CTM au terminal 2 - Aroport Casa', '20260316'),
(8006, 19, @PolAutoOmar, NULL, 55006, '20260305', '20260305', 'C', '20260325', 6500.00, '2000', 4500.00, 'Accrochage parking Marjane Californie Casablanca - Tiers identifi', '20260305'),
(8007, 15, @PolAutoGDA, NULL, 55007, '20260710', '20260711', 'C', '20260801', 18500.00, '3000', 15500.00, 'Collision arrrire livraison - Bd Moulay Ismail Casablanca', '20260711'),
(8008, 20, @PolAutoRachid, NULL, 55008, '20261020', '20261022', 'C', '20261115', 4800.00, '1500', 3300.00, 'Bris pare-brise et rtroviseur - Projection pierre autoroute', '20261022'),
(8009, 21, @PolAutoSouad, NULL, 55009, '20260905', '20260906', 'C', '20260930', 9500.00, '2000', 7500.00, 'Collision carrefour - Bd Ghandi Casablanca', '20260906'),

-- === SINISTRES SANT ===
(8010, NULL, @PolMaladieeDSM, 5001, 55010, '20260310', '20260312', 'C', '20260405', 3200.00, '640', 2560.00, 'Consultation spcialiste + IRM cervicale - Clinique Nations Unies Rabat', '20260312'),
(8011, NULL, @PolMaladieeDSM, 5005, 55011, '20260510', '20260512', 'E', '20260512', 2450.00, '490', 0.00, 'Analyses biologiques + Radio pulmonaire - Labo Berrechid Casa', '20260512'),
(8012, NULL, @PolMaladieeDSM, 5005, 55012, '20260620', '20260622', 'C', '20260715', 1800.00, '360', 1440.00, 'Consultation ORL + Audiogramme pour Salma Benchekroun - Polyclinique Maarif', '20260622'),
(8013, NULL, @PolMaladieeERS, 5007, 55013, '20260415', '20260417', 'C', '20260510', 4500.00, '900', 3600.00, 'Hospitalisation 3j clinique Ain Sebaa - Appendicite aigue', '20260417'),
(8014, NULL, @PolMaladieeERS, 5008, 55014, '20260901', '20260903', 'E', '20260903', 6500.00, '1300', 0.00, 'Accouchement csarienne - Clinique Badr Casablanca', '20260903'),
(8015, NULL, @PolMaladieeASL, 5011, 55015, '20260905', '20260907', 'C', '20260930', 2800.00, '560', 2240.00, 'Extraction dentaire + Couronne cramique - Centre Dentaire Nations Unies', '20260907'),
(8016, NULL, @PolMaladieeASL, 5010, 55016, '20261110', '20261112', 'E', '20261112', 1800.00, '360', 0.00, 'Consultation gyncologique + chographie - Clinique Aviation Marrakech', '20261112'),
(8017, NULL, @PolMaladieeOmar, 5015, 55017, '20260720', '20260722', 'C', '20260815', 1200.00, '240', 960.00, 'Consultation cardiologue + ECG - Polyclinique Racine Casablanca', '20260722'),
(8018, NULL, @PolMaladieeFatima, 5016, 55018, '20260915', '20260917', 'C', '20261010', 3500.00, '700', 2800.00, 'Kinésithérapie 10 séances - Centre Rducation Guliz Marrakech', '20260917'),

-- === SINISTRES ACCIDENT DE TRAVAIL ===
(8019, 23, @PolATDSM, NULL, 55019, '20260210', '20260212', 'E', '20260212', 4500.00, '500', 0.00, 'Accident de trajet domicile-travail - Fracture du bras droit', '20260212'),
(8020, 24, @PolATERS, NULL, 55020, '20260305', '20260307', 'C', '20260325', 8500.00, '0', 8500.00, 'Chute de hauteur lors de l''installation sur le site Benguerir', '20260325'),

-- === SINISTRES IARD ===
-- Sinistre Incendie - Atelier Production Energies Sud (8021)
(8021, 26, @PolIARD_ERS, NULL, 55021, '20260315', '20260316', 'C', '20260415', 1250000.00, '10000', 1240000.00, 'Incendie d''un transformateur lectrique - Atelier production - Dgt matriels', '20260316'),

-- Sinistre Dgts des Eaux - Entrepot Stockage (8022)
(8022, 27, @PolIARD_ERS, NULL, 55022, '20260520', '20260521', 'C', '20260620', 850000.00, '4000', 846000.00, 'Fuite canalisation principale - Entrepot matires premires', '20260521'),

-- Sinistre Perte d''Exploitation - Data Center Principal Digital Solutions (8023)
(8023, 29, @PolIARD_DSM, NULL, 55023, '20260710', '20260711', 'E', '20260711', 3500000.00, '20000', 0.00, 'Panne lectrique gnralise - DC Casa - Service interrompu 48h', '20260711'),

-- Sinistre Bris Machine - Chane Logistique GDA (8024)
(8024, 34, @PolIARD_GDA, NULL, 55024, '20260805', '20260806', 'C', '20260830', 650000.00, '8000', 642000.00, 'Bras robotis dysfonctionnement - Casse chane emballage', '20260806'),

-- Sinistre Vol avec Effraction - Entrepot Principal GDA (8025)
(8025, 33, @PolIARD_GDA, NULL, 55025, '20260920', '20260921', 'C', '20261015', 450000.00, '7000', 443000.00, 'Vol matriel informatique et colis pdagogiques - Entrepot', '20260921'),

-- Sinistre Incendie - Btiment Administratif GDA (8026)
(8026, 36, @PolIARD_GDA, NULL, 55026, '20261105', '20261106', 'E', '20261106', 350000.00, '2000', 0.00, 'Dpart de feu local informatique - Dtection rapide', '20261106'),

-- Sinistre Dommages Electriques - Station Transformation Energies Sud (8027)
(8027, 28, @PolIARD_ERS, NULL, 55027, '20261015', '20261016', 'C', '20261110', 450000.00, '5000', 445000.00, 'Surtension sur ligne HT - Dgt transformateur principal', '20261016'),

-- Sinistre Dfaillance Logicielle - Data Center Secours Digital Solutions (8028)
(8028, 30, @PolIARD_DSM, NULL, 55028, '20260901', '20260902', 'C', '20260925', 1200000.00, '8000', 1192000.00, 'Attaque ransomware - Serveurs crypts - Perte donnes 72h', '20260902');

-- =====================================================
-- 10. DOCUMENTS
-- =====================================================
INSERT INTO dbo.PolDocument (fk_police_id, fk_document_id, libelle) VALUES
-- Documents Auto
(@PolAutoDSM1, 101, 'Carte Grise Dacia Duster 12345-A-1'),
(@PolAutoDSM1, 102, 'Carte Grise Renault Clio 67890-A-7'),
(@PolAutoDSM1, 103, 'Carte Grise Peugeot 3008 11223-A-33'),
(@PolAutoDSM1, 104, 'Contrat Flotte Automobile DSM 2026'),
(@PolAutoDSM1, 105, 'Attestation Assurance Flotte 2026'),
(@PolAutoERS1, 201, 'Contrat Flotte Automobile ERS 2026'),
(@PolAutoASL, 301, 'Contrat Flotte ASL 2026'),
(@PolAutoASL, 302, 'Carte Grise Toyota Hilux 33445-B-1'),
(@PolAutoOmar, 401, 'Carte Grise Hyundai Tucson'),
(@PolAutoOmar, 402, 'Permis de Conduire Omar Tazi'),
(@PolAutoRachid, 501, 'Carte Grise Dacia Sandero'),

-- Documents Maladie
(@PolMaladieeDSM, 601, 'Liste Adhrents Maladie DSM 2026'),
(@PolMaladieeDSM, 602, 'Contrat Assurance Groupe Maladie DSM'),
(@PolMaladieeERS, 701, 'Convention Tiers Payant ERS 2026'),
(@PolMaladieeASL, 801, 'Convention Tiers Payant ASL 2026'),

-- Documents IARD
(@PolIARD_ERS, 901, 'Rapport Inspection Site ERS 2026'),
(@PolIARD_ERS, 902, 'Plan de Prvention Incendie - Site Benguerir'),
(@PolIARD_DSM, 1001, 'Certification DC Tier III - DS Maroc'),
(@PolIARD_DSM, 1002, 'Politique de Scurit Data Center'),
(@PolIARD_GDA, 1101, 'Schma Logistique Entrepot'),
(@PolIARD_GDA, 1102, 'Maintenance Chanes Automatiques 2026');

-- =====================================================
-- 11. RCLAMATIONS
-- =====================================================
INSERT INTO dbo.ReclamationsIdt (FK_User_Client, DateReclamation, Sujet, Statut, DateStatut, Nature, CreatedAt) VALUES
-- Hamza (Digital Solutions)
(@UserClient1, '20260210 09:15:00', 'Demande de cartes vertes Flotte 2026', 'C', '20260212 14:20:00', 'I', '20260210 09:15:00'),
(@UserClient1, '20260320 08:45:00', 'Contestation franchise sinistre 55001', 'C', '20260322 09:30:00', 'I', '20260320 08:45:00'),
(@UserClient1, '20260415 11:00:00', 'Demande ajout adhrent sant DSM', 'E', NULL, 'I', '20260415 11:00:00'),

-- Sanae (Energies Sud)
(@UserClient2, '20260515 11:20:00', 'Demande ajout vhicule utilitaire flotte ERS', 'E', NULL, 'I', '20260515 11:20:00'),

-- Amine QAMCH (Adherent DSM)
(@UserAdherent1, '20260520 14:30:00', 'Suivi remboursement dossier 55011', 'C', '20260521 10:15:00', 'S', '20260520 14:30:00'),
(@UserAdherent1, '20260325 10:00:00', 'Erreur calcul remboursement consultation', 'C', '20260326 09:45:00', 'S', '20260325 10:00:00'),

-- Nadia Slaoui (Adhrente ASL)
(@UserAdherent2, '20260701 08:30:00', 'Demande carte tiers payant ASL 2026', 'C', '20260701 16:00:00', 'S', '20260701 08:30:00'),
(@UserAdherent2, '20261115 11:00:00', 'Dlai remboursement chographie dpass', 'E', NULL, 'S', '20261115 11:00:00');

-- Rp anyway IDs rclamations
DECLARE @R1 INT, @R2 INT, @R3 INT, @R4 INT, @R5 INT, @R6 INT, @R7 INT, @R8 INT;

SELECT @R1 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient1 AND Sujet LIKE '%cartes vertes%';
SELECT @R2 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient1 AND Sujet LIKE '%franchise%';
SELECT @R3 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient1 AND Sujet LIKE '%adhrent%';
SELECT @R4 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient2;
SELECT @R5 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserAdherent1 AND Sujet LIKE '%Suivi remboursement%';
SELECT @R6 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserAdherent1 AND Sujet LIKE '%Erreur calcul%';
SELECT @R7 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserAdherent2 AND Sujet LIKE '%carte tiers payant%';
SELECT @R8 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserAdherent2 AND Sujet LIKE '%chographie%';

-- Messages des rclamations
INSERT INTO dbo.ReclamationsDet (FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) VALUES
-- R1 - Cartes vertes
(@R1, @UserClient1, '20260210 09:15:00', 'C', 'Salam, veuillez nous transmettre les cartes vertes 2026 pour notre flotte automobile (4 vhicules). Urgent.'),
(@R1, @AdminId, '20260210 10:30:00', 'A', 'Salam, nous avons bien reu votre demande. Les cartes vertes sont en cours d''mission. Dlai 48h.'),
(@R1, @AdminId, '20260212 14:20:00', 'A', 'Les cartes vertes sont disponibles dans votre espace documents. Bonne rception.'),

-- R2 - Contestation franchise
(@R2, @UserClient1, '20260320 08:45:00', 'C', 'Nous contestons la franchise de 2500 DH sur sinistre 55001. Selon contrat, franchise RC est 0 DH.'),
(@R2, @AdminId, '20260321 16:00:00', 'A', 'M. MANYANI, le sinistre concerne la garantie Tierce Collision (franchise 2500 DH) et non la RC.'),
(@R2, @UserClient1, '20260322 09:30:00', 'C', 'Effectivement, veuillez nous excuser. Nous confirmons notre accord pour la prise en charge.'),

-- R3 - Ajout adhrent sant
(@R3, @UserClient1, '20260415 11:00:00', 'C', 'Demande d''ajout d''un nouvel adhrent notre contrat sant groupe DSM. Formulaire en PJ.'),
(@R3, @CommercialId, '20260416 09:30:00', 'A', 'Votre demande a t transmise au service adhsion. Traitement sous 72h.'),

-- R4 - Ajout vhicule ERS
(@R4, @UserClient2, '20260515 11:20:00', 'C', 'Demande d''ajout d''un Toyota Hilux notre flotte ERS. Devis concessionnaire en pice jointe.'),
(@R4, @CommercialId, '20260516 09:45:00', 'A', 'M. Manyani, votre demande est enregistre. Dlai de traitement 5 jours ouvrs pour avenant.'),

-- R5 - Suivi remboursement Amine
(@R5, @UserAdherent1, '20260520 14:30:00', 'C', 'Salam, mon dossier 55011 du 12 mai est toujours en attente de paiement. Dlai dpass.'),
(@R5, @AdminId, '20260521 10:15:00', 'A', 'Salam M. QAMCH, virement de 2450 DH effectu ce jour. Dlai rception 48-72h. Excuses pour le retard.'),
(@R5, @UserAdherent1, '20260521 11:00:00', 'C', 'Merci pour votre ractivit. Bonne continuation.'),

-- R6 - Erreur calcul remboursement
(@R6, @UserAdherent1, '20260325 10:00:00', 'C', 'Erreur sur remboursement consultation : pay 400 DH, rembours 280 DH au lieu de 320 DH (80%).'),
(@R6, @AdminId, '20260325 15:30:00', 'A', 'Nous vrions votre dossier. Le service comptable analyse l''cart de 40 DH.'),
(@R6, @AdminId, '20260326 09:45:00', 'A', 'Erreur confirme. Complment de 40 DH vir sous 48h. Toutes nos excuses.'),

-- R7 - Carte tiers payant ASL
(@R7, @UserAdherent2, '20260701 08:30:00', 'C', 'Bonjour, je n''ai pas reu ma carte tiers payant ASL 2026. Dlai de 15 jours dpass.'),
(@R7, @AdminId, '20260701 16:00:00', 'A', 'Bonjour Mme Slaoui, votre carte est disponible en agence ASL aroport. Possibilit envoi postal.'),
(@R7, @UserAdherent2, '20260702 09:00:00', 'C', 'Merci, je passerai la rcuprer en agence cette semaine.'),

-- R8 - Dlai chographie
(@R8, @UserAdherent2, '20261115 11:00:00', 'C', 'Mon dossier chographie du 12 novembre n''est toujours pas trait. Dlai anormal.'),
(@R8, @AdminId, '20261117 14:00:00', 'A', 'Mme Slaoui, le dossier ncessite une validation mdicale complmentaire. Dlai supplmentaire 48h.');
GO

-- =====================================================
-- 12. LIAISONS DE SIMULATION DE TEST (UserSimulationClients)
-- =====================================================
INSERT INTO dbo.UserSimulationClients (fk_user_id, fk_client_id) VALUES
(1, 1001),
(1, 1003),
(1, 2002),
(2, 1002),
(2, 2001);
GO

-- =====================================================
-- 13. DONNÉES COMPLÉMENTAIRES DES SINISTRES (sinComplement)
-- =====================================================
INSERT INTO dbo.sinComplement (fk_sinistre_id, Ref_Sinistre, Date_Sinistre, Victime, Lieu, Type_Sinistre, Circonstances, Lesion, Etape, ITT, IPP_Estime, IPP_Traitant, IPP_Conseil, IPP_Retenu, Frais_Medicaux, Frais_Transport, Indem_Jrn, Nature_indem, Montant_indem) VALUES
(8019, 55019, '20260210', 'Ahmed El Mansouri', 'Atelier 2 - Digital Solutions', 'Accident de trajet', 'Glissade sur plaque de verglas en se rendant au travail', 'Fracture fermée du radius droit', 'Arrêt', '30 jours', 0.00, 0.00, 0.00, 0.00, 2500.00, 150.00, 1500.00, 'Rente', 1500.00),
(8020, 55020, '20260305', 'Said Naciri', 'Site Solaire Benguerir', 'Accident du travail', 'Chute d''une échelle lors de la pose de panneaux solaires', 'Fracture de la clavicule et traumatismes multiples', 'Guérison', '45 jours', 12.50, 15.00, 12.00, 12.50, 4800.00, 320.00, 3200.00, 'Rachat', 8500.00);
GO

PRINT '=== DONNES DE TEST IMPORTES AVEC SUCCES ===';
GO