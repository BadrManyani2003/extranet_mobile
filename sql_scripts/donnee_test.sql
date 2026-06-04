USE [IBS_Extranet_Mobile];
GO

-- =====================================================
-- NETTOYAGE COMPLET
-- =====================================================
DELETE FROM dbo.ReclamationsDet;
DELETE FROM dbo.ReclamationsIdt;
DELETE FROM dbo.PolDocument;
DELETE FROM dbo.Garanties;
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
('Atlas Assurance', '20260101'),
('Cèdre Prévoyance', '20260101'),
('Salam Assurance', '20260101'),
('Al Maghrib Assurance', '20260101'),
('Union Mutualiste', '20260101');

DECLARE @Comp1Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'Atlas Assurance');
DECLARE @Comp2Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'Cèdre Prévoyance');
DECLARE @Comp3Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'Salam Assurance');
DECLARE @Comp4Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'Al Maghrib Assurance');
DECLARE @Comp5Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'Union Mutualiste');

-- =====================================================
-- 2. UTILISATEURS (id_auth conservés)
-- =====================================================
SET IDENTITY_INSERT dbo.sysUser ON;
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt, token) VALUES
(1, 'b192749b-683c-408c-bfbc-876c045c5b4c', 'Youssef Kabbaj', '0661223344', 'admin1@test.ma', 'A', 'O', 'N', '20260101', 'token_admin_001'),
(2, 'commercial_keycloak_002', 'Meryem Ouazzani', '0661556677', 'com1@test.ma', 'C', 'O', 'N', '20260101', 'token_com_001'),
(3, 'f823c1e8-46db-43c6-a8a7-f86b506c3fbc', 'Hamza Belkadi', '0661889900', 'client1@test.ma', 'C', 'O', 'N', '20260101', 'token_societe1'),
(4, 'client_societe2_auth', 'Sanae El Idrissi', '0661112233', 'client2@test.ma', 'C', 'O', 'N', '20260101', 'token_societe2'),
(5, '6054d0c2-0f70-4b79-8635-13b8f69e4aa8', 'Anas Benchekroun', '0661445566', 'adherent1@test.ma', 'C', 'N', 'O', '20260101', 'token_adherent1'),
(6, '', 'Nadia Slaoui', '0661778899', 'adherent2@test.ma', 'C', 'N', 'O', '20260101', 'token_adherent2');
SET IDENTITY_INSERT dbo.sysUser OFF;

DECLARE @AdminId INT = 1;
DECLARE @CommercialId INT = 2;
DECLARE @UserClient1 INT = 3;
DECLARE @UserClient2 INT = 4;
DECLARE @UserAdherent1 INT = 5;
DECLARE @UserAdherent2 INT = 6;

-- Rôles
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES 
(@AdminId, 'ADMIN'), 
(@AdminId, 'GESTIONNAIRE'),
(@CommercialId, 'COMMERCIAL'),
(@UserClient1, 'CLIENT'),
(@UserClient2, 'CLIENT'),
(@UserAdherent1, 'CLIENT'), 
(@UserAdherent1, 'ADHERENT'),
(@UserAdherent2, 'ADHERENT');

-- Postes autorisés
INSERT INTO dbo.Postes_Autorises (FK_User_Id, Libelle, Identifiant, Actif, CreatedAt) VALUES
(@AdminId, 'Siège Social Rabat - Agdal', 'IDENT_RABAT_001', 'O', '20260101'),
(@AdminId, 'Direction Régionale Casablanca', 'IDENT_CASA_002', 'O', '20260101'),
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
(1001, 'Énergies Renouvelables du Sud S.A.', 'N', 'achats@enersud.ma', 'Lotissement La Colline, Sidi Maârouf, Casablanca', '0522334455', 'O', 'O', '20260101'),
(1002, 'Digital Solutions Maroc S.A.', 'N', 'direction.achats@digitalsol.ma', 'Avenue Annakhil, Hay Ryad, Rabat', '0537719000', 'O', 'O', '20260101'),
(1003, 'Aéro Services Logistiques', 'N', 'assurances@aeroserv.ma', 'Aéroport Mohammed V, Nouaceur', '0522434343', 'O', 'N', '20260101'),
(1004, 'Grande Distribution Alimentation S.A.', 'N', 'direction@gda.ma', 'Bd Al Qods, Sidi Maarouf, Casablanca', '0520334456', 'N', 'O', '20260101'),
(1005, 'Banque du Commerce Moderne', 'N', 'assurances@banquecom.ma', '140 Avenue Hassan II, Casablanca', '0522494000', 'O', 'O', '20260101'),
-- Clients Particuliers
(2001, 'Omar Tazi', 'O', 'omar.tazi@email.ma', 'Rue Abou Al Alaa, Quartier Racine, Maarif, Casablanca', '0661223345', 'O', 'O', '20260101'),
(2002, 'Fatima El Fassi', 'O', 'fatima.elfassi@email.ma', 'Avenue Hassan II, Résidence Al Amal, Guéliz, Marrakech', '0667889900', 'O', 'O', '20260101'),
(2003, 'Rachid Belkadi', 'O', 'rachid.belkadi@email.ma', 'Hay El Wifaq, Avenue Hassan II, Témara', '0665112233', 'O', 'O', '20260101'),
(2004, 'Souad Alaoui', 'O', 'souad.alaoui@email.ma', 'Rue Ibn Toumert, Quartier Palmiers, Casablanca', '0662445566', 'O', 'O', '20260101'),
(2005, 'Karim Naciri', 'O', 'karim.naciri@email.ma', 'Avenue Moulay Ismail, Agdal, Rabat', '0667338844', 'O', 'O', '20260101');

DECLARE @ClientId1 INT = 1001; -- Énergies Renouvelables du Sud
DECLARE @ClientId2 INT = 1002; -- Digital Solutions Maroc
DECLARE @ClientId3 INT = 1003; -- Aéro Services Logistiques
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
(@UserClient2, @ClientId1, 'O', '20260101'),  -- Sanae -> Énergies Sud
(@UserAdherent1, @ClientId6, 'O', '20260101'), -- Anas -> Omar Tazi
(@UserAdherent2, @ClientId7, 'O', '20260101'); -- Nadia -> Fatima El Fassi

-- =====================================================
-- 4. POLICES D'ASSURANCE (Automobile & Santé)
-- =====================================================
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) VALUES
-- === BRANCHE AUTOMOBILE ===
-- Digital Solutions Maroc
(101, @ClientId2, @Comp1Id, 'Automobile', 'AUTO-DSM-2026-001', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
(102, @ClientId2, @Comp1Id, 'Automobile', 'AUTO-DSM-2026-002', '20261231', 'E', 'DIRECTION', '20260101', '20260101'),
-- Énergies Renouvelables du Sud
(103, @ClientId1, @Comp2Id, 'Automobile', 'AUTO-ERS-2026-001', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
(104, @ClientId1, @Comp2Id, 'Automobile', 'AUTO-ERS-2026-002', '20261231', 'E', 'LOGISTIQUE', '20260101', '20260101'),
-- Aéro Services Logistiques
(105, @ClientId3, @Comp3Id, 'Automobile', 'AUTO-ASL-2026-001', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
-- Grande Distribution Alimentation
(106, @ClientId4, @Comp4Id, 'Automobile', 'AUTO-GDA-2026-001', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
-- Banque du Commerce Moderne
(107, @ClientId5, @Comp1Id, 'Automobile', 'AUTO-BCM-2026-001', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
-- Particuliers
(108, @ClientId6, @Comp4Id, 'Automobile', 'AUTO-PAR-2026-001', '20260630', 'E', 'INDIV', '20260101', '20260101'),
(109, @ClientId8, @Comp4Id, 'Automobile', 'AUTO-PAR-2026-002', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(110, @ClientId9, @Comp5Id, 'Automobile', 'AUTO-PAR-2026-003', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(111, @ClientId10, @Comp5Id, 'Automobile', 'AUTO-PAR-2026-004', '20260930', 'E', 'INDIV', '20260101', '20260101'),

-- === BRANCHE SANTÉ ===
-- Digital Solutions Maroc
(201, @ClientId2, @Comp1Id, 'Santé', 'SANTE-DSM-2026-001', '20261231', 'E', 'GROUPE', '20260101', '20260101'),
-- Énergies Renouvelables du Sud
(202, @ClientId1, @Comp2Id, 'Santé', 'SANTE-ERS-2026-001', '20261231', 'E', 'GROUPE', '20260101', '20260101'),
-- Aéro Services Logistiques
(203, @ClientId3, @Comp3Id, 'Santé', 'SANTE-ASL-2026-001', '20261231', 'E', 'GROUPE', '20260601', '20260101'),
-- Banque du Commerce Moderne
(204, @ClientId5, @Comp1Id, 'Santé', 'SANTE-BCM-2026-001', '20261231', 'E', 'GROUPE', '20260101', '20260101'),
-- Particuliers
(205, @ClientId6, @Comp4Id, 'Santé', 'SANTE-PAR-2026-001', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(206, @ClientId7, @Comp5Id, 'Santé', 'SANTE-PAR-2026-002', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(207, @ClientId9, @Comp4Id, 'Santé', 'SANTE-PAR-2026-003', '20261231', 'E', 'INDIV', '20260101', '20260101');

-- Variables polices Auto
DECLARE @PolAutoDSM1 INT = 101, @PolAutoDSM2 INT = 102;
DECLARE @PolAutoERS1 INT = 103, @PolAutoERS2 INT = 104;
DECLARE @PolAutoASL INT = 105, @PolAutoGDA INT = 106, @PolAutoBCM INT = 107;
DECLARE @PolAutoOmar INT = 108, @PolAutoRachid INT = 109;
DECLARE @PolAutoSouad INT = 110, @PolAutoKarim INT = 111;

-- Variables polices Santé
DECLARE @PolSanteDSM INT = 201, @PolSanteERS INT = 202, @PolSanteASL INT = 203;
DECLARE @PolSanteBCM INT = 204, @PolSanteOmar INT = 205;
DECLARE @PolSanteFatima INT = 206, @PolSanteSouad INT = 207;

-- =====================================================
-- 5. ADHERENTS (Santé)
-- =====================================================
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, DateAdhesion, Actif, Telephone, CreatedAt) VALUES
-- Digital Solutions Maroc - Police Santé 201
(5001, @PolSanteDSM, NULL, 'Jawad El Hariri', 'jawad.hariri@digitalsol.ma', 10001, 2020001, '19750412', '20260101', 'O', '0661234567', '20260101'),
(5002, @PolSanteDSM, NULL, 'Houda Bennis', 'houda.bennis@digitalsol.ma', 10002, 2020002, '19800823', '20260101', 'O', '0661234568', '20260101'),
(5003, @PolSanteDSM, NULL, 'Tarik Fassi', 'tarik.fassi@digitalsol.ma', 10003, 2020003, '19851107', '20260101', 'O', '0661234569', '20260101'),
(5004, @PolSanteDSM, NULL, 'Latifa Amrani', 'latifa.amrani@digitalsol.ma', 10004, 2020004, '19900314', '20260101', 'O', '0661234570', '20260101'),
(5005, @PolSanteDSM, @UserAdherent1, 'Anas Benchekroun', 'adherent1@test.ma', 10005, 2020005, '19920707', '20260101', 'O', '0661445566', '20260101'),
(5006, @PolSanteDSM, NULL, 'Mohamed Sefrioui', 'mohamed.sefrioui@digitalsol.ma', 10006, 2020006, '19880419', '20260101', 'O', '0661234573', '20260101'),

-- Énergies Renouvelables du Sud - Police Santé 202
(5007, @PolSanteERS, NULL, 'Abdelghani Benali', 'abdelghani.benali@enersud.ma', 10011, 2020011, '19801215', '20260101', 'O', '0661234571', '20260101'),
(5008, @PolSanteERS, NULL, 'Nouha Sekkat', 'nouha.sekkat@enersud.ma', 10012, 2020012, '19850328', '20260101', 'O', '0661234572', '20260101'),
(5009, @PolSanteERS, NULL, 'Samir Benjelloun', 'samir.benjelloun@enersud.ma', 10013, 2020013, '19870803', '20260101', 'O', '0661234574', '20260101'),

-- Aéro Services Logistiques - Police Santé 203
(5010, @PolSanteASL, @UserAdherent2, 'Nadia Slaoui', 'adherent2@test.ma', 10020, 2020020, '19801010', '20260601', 'O', '0661778899', '20260101'),
(5011, @PolSanteASL, NULL, 'Khalil Bennouna', 'khalil.bennouna@aeroserv.ma', 10021, 2020021, '19780615', '20260601', 'O', '0661234575', '20260101'),
(5012, @PolSanteASL, NULL, 'Saida Lahlou', 'saida.lahlou@aeroserv.ma', 10022, 2020022, '19850922', '20260601', 'O', '0661234576', '20260101'),

-- Banque du Commerce Moderne - Police Santé 204
(5013, @PolSanteBCM, NULL, 'Redouane Taibi', 'redouane.taibi@banquecom.ma', 10030, 2020030, '19820318', '20260101', 'O', '0661234577', '20260101'),
(5014, @PolSanteBCM, NULL, 'Ghita El Omary', 'ghita.omary@banquecom.ma', 10031, 2020031, '19860705', '20260101', 'O', '0661234578', '20260101'),

-- Particuliers - Police Santé 205 (Omar)
(5015, @PolSanteOmar, NULL, 'Omar Tazi', 'omar.tazi@email.ma', 10040, 9999001, '19850403', '20260101', 'O', '0661223345', '20260101'),
-- Particuliers - Police Santé 206 (Fatima)
(5016, @PolSanteFatima, NULL, 'Fatima El Fassi', 'fatima.elfassi@email.ma', 10041, 9999002, '19900812', '20260101', 'O', '0667889900', '20260101'),
-- Particuliers - Police Santé 207 (Souad)
(5017, @PolSanteSouad, NULL, 'Souad Alaoui', 'souad.alaoui@email.ma', 10042, 9999003, '19761125', '20260101', 'O', '0662445566', '20260101');

-- Personnes à charge
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) VALUES
-- Famille Anas Benchekroun (5005)
(6001, 5005, 'Yassine Benchekroun', 'Enfant', '20150515', '20260101', '20260101'),
(6002, 5005, 'Salma Benchekroun', 'Conjoint', '19940820', '20260101', '20260101'),
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
-- 6. RISQUES (Véhicules Automobile)
-- =====================================================
INSERT INTO dbo.Risques (FK_Police_Id, Libelle, Identifiant, Description, Assure, DateDu, DateEcheance, NumeroIBS, Statut, CreatedAt) VALUES
-- Flotte Digital Solutions 1 (101)
(@PolAutoDSM1, 'Dacia Duster Essence', '12345-A-1', 'Véhicule Service Direction - Rabat', 'Amine Bouhaddou', '20260101', '20261231', 9001, 'O', '20260101'),
(@PolAutoDSM1, 'Renault Clio 5 Diesel', '67890-A-7', 'Véhicule Service Commercial - Casablanca', 'Ibtissam Mrini', '20260101', '20261231', 9002, 'O', '20260101'),
(@PolAutoDSM1, 'Peugeot 3008 Allure', '11223-A-33', 'Véhicule Direction Régionale - Marrakech', 'Zakaria Doukkali', '20260101', '20261231', 9003, 'O', '20260101'),
(@PolAutoDSM1, 'Citroën Berlingo Utilitaire', '12346-A-2', 'Véhicule Technique - Maintenance', 'Nabil Riffi', '20260101', '20261231', 9004, 'O', '20260101'),

-- Digital Solutions Direction (102)
(@PolAutoDSM2, 'BMW Série 3 320d', '99887-D-1', 'Véhicule de Fonction PDG', 'Kamal Temsamani', '20260101', '20261231', 9005, 'O', '20260101'),
(@PolAutoDSM2, 'Audi A4 Avant', '99888-D-2', 'Véhicule de Fonction DGA', 'Siham Belhaj', '20260101', '20261231', 9006, 'O', '20260101'),

-- Flotte Énergies Sud 1 (103)
(@PolAutoERS1, 'Toyota Land Cruiser Prado', '44556-C-1', 'Véhicule Site Solaire Benguerir', 'Younes Ait Taleb', '20260101', '20261231', 9007, 'O', '20260101'),
(@PolAutoERS1, 'Nissan Navara', '44557-C-2', 'Véhicule Site Solaire Khouribga', 'Mohcine El Khalil', '20260101', '20261231', 9008, 'O', '20260101'),
(@PolAutoERS1, 'Mitsubishi L200', '44558-C-3', 'Véhicule Site Solaire Laâyoune', 'Fouad Ouhadi', '20260101', '20261231', 9009, 'O', '20260101'),

-- Flotte Énergies Sud Logistique (104)
(@PolAutoERS2, 'Mercedes Actros 1845', '55667-L-1', 'Camion Transport Panneaux', 'Hicham Laghrissi', '20260101', '20261231', 9010, 'O', '20260101'),
(@PolAutoERS2, 'Volvo FH 460', '55668-L-2', 'Camion Transport Batteries', 'Soufiane Chafik', '20260101', '20261231', 9011, 'O', '20260101'),

-- Flotte Aéro Services (105)
(@PolAutoASL, 'Toyota Hilux Double Cabine', '33445-B-1', 'Transport Aéroport - Navette Personnel', 'Driss Berrada', '20260101', '20261231', 9012, 'O', '20260101'),
(@PolAutoASL, 'Mercedes Sprinter 315', '33446-B-2', 'Transport Personnel Aéroport Casa', 'Salwa Cherif', '20260101', '20261231', 9013, 'O', '20260101'),
(@PolAutoASL, 'Renault Master', '33447-B-3', 'Transport Bagages Aéroport', 'Hassan Fadel', '20260101', '20261231', 9014, 'O', '20260101'),

-- Flotte Grande Distribution (106)
(@PolAutoGDA, 'Ford Transit Custom', '77889-E-1', 'Véhicule Livraison - Enseigne Alimentation', 'Khalil Benjelloun', '20260101', '20261231', 9015, 'O', '20260101'),
(@PolAutoGDA, 'Renault Kangoo Express', '77890-E-2', 'Véhicule Livraison - Enseigne Discount', 'Hasna El Amrani', '20260101', '20261231', 9016, 'O', '20260101'),

-- Flotte Banque Moderne (107)
(@PolAutoBCM, 'Volkswagen Passat', '99001-F-1', 'Véhicule Service Direction', 'Omar Khattabi', '20260101', '20261231', 9017, 'O', '20260101'),
(@PolAutoBCM, 'Skoda Octavia', '99002-F-2', 'Véhicule Service Agences', 'Said Ouahbi', '20260101', '20261231', 9018, 'O', '20260101'),

-- Particuliers
(@PolAutoOmar, 'Hyundai Tucson 2024', '11223-G-1', 'SUV Blanc - Véhicule Personnel', 'Omar Tazi', '20260101', '20260630', 9019, 'O', '20260101'),
(@PolAutoRachid, 'Dacia Sandero Stepway', '11224-G-2', 'Citadine Grise - Véhicule Personnel', 'Rachid Belkadi', '20260101', '20261231', 9020, 'O', '20260101'),
(@PolAutoSouad, 'Renault Captur', '11225-G-3', 'SUV Compact Bleu - Véhicule Personnel', 'Souad Alaoui', '20260101', '20261231', 9021, 'O', '20260101'),
(@PolAutoKarim, 'Peugeot 208', '11226-G-4', 'Citadine Rouge - Véhicule Personnel', 'Karim Naciri', '20260101', '20260930', 9022, 'O', '20260101');

-- =====================================================
-- 7. GARANTIES
-- =====================================================
INSERT INTO dbo.Garanties (FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES
-- Dacia Duster DSM
(1, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(1, 'Défense et Recours', 500000.00, '0', '20260101'),
(1, 'Dommages Collision', 250000.00, '2500', '20260101'),
(1, 'Incendie', 200000.00, '2000', '20260101'),
(1, 'Vol', 250000.00, '3000', '20260101'),
(1, 'Bris de Glaces', 15000.00, '500', '20260101'),

-- Renault Clio DSM
(2, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(2, 'Dommages Collision', 180000.00, '2000', '20260101'),
(2, 'Vol', 180000.00, '2500', '20260101'),

-- Peugeot 3008 DSM
(3, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(3, 'Tous Risques Sauf Guerre', 350000.00, '3500', '20260101'),
(3, 'Bris de Glaces', 20000.00, '500', '20260101'),

-- BMW Série 3 DSM Direction
(5, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(5, 'Tous Risques Sauf Guerre', 450000.00, '5000', '20260101'),
(5, 'Assistance Panne 0KM', 50000.00, '0', '20260101'),

-- Toyota Land Cruiser ERS
(7, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(7, 'Dommages Collision', 400000.00, '4000', '20260101'),
(7, 'Vol et Incendie', 400000.00, '5000', '20260101'),

-- Toyota Hilux ASL
(12, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(12, 'Dommages Collision', 350000.00, '4000', '20260101'),
(12, 'Vol et Incendie', 350000.00, '5000', '20260101'),

-- Ford Transit GDA
(15, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(15, 'Dommages Collision', 200000.00, '3000', '20260101'),
(15, 'Vol', 200000.00, '3500', '20260101'),

-- Hyundai Tucson Omar
(19, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(19, 'Défense et Recours', 500000.00, '0', '20260101'),
(19, 'Dommages Collision', 220000.00, '2000', '20260101'),
(19, 'Vol', 220000.00, '2500', '20260101'),
(19, 'Incendie', 220000.00, '1500', '20260101'),

-- Dacia Sandero Rachid
(20, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(20, 'Dommages Collision', 150000.00, '1500', '20260101'),
(20, 'Incendie', 150000.00, '1000', '20260101'),

-- Renault Captur Souad
(21, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(21, 'Défense et Recours', 500000.00, '0', '20260101'),
(21, 'Dommages Collision', 200000.00, '2000', '20260101'),
(21, 'Vol', 200000.00, '2500', '20260101'),
(21, 'Bris de Glaces', 12000.00, '400', '20260101'),

-- Peugeot 208 Karim
(22, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(22, 'Dommages Collision', 140000.00, '1500', '20260101');

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

-- SANTÉ
(7009, @PolSanteDSM, 6001, '20260101', '20260630', 250000.00, 0.00, '20260215', 'R', '20260101'),
(7010, @PolSanteDSM, 6002, '20260701', '20261231', 250000.00, 250000.00, '20260715', 'E', '20260601'),
(7011, @PolSanteERS, 7001, '20260101', '20260630', 450000.00, 0.00, '20260215', 'R', '20260101'),
(7012, @PolSanteERS, 7002, '20260701', '20261231', 450000.00, 450000.00, '20260715', 'E', '20260601'),
(7013, @PolSanteASL, 8001, '20260601', '20261231', 180000.00, 0.00, '20260715', 'R', '20260601'),
(7014, @PolSanteOmar, 9001, '20260101', '20261231', 3600.00, 0.00, '20260215', 'R', '20260101'),
(7015, @PolSanteFatima, 10001, '20260101', '20261231', 2800.00, 0.00, '20260215', 'R', '20260101');

-- =====================================================
-- 9. SINISTRES
-- =====================================================
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, MT_Franchise, MT_Indemnite, Observations, CreatedAt) VALUES
-- === SINISTRES AUTOMOBILE ===
(8001, 1, @PolAutoDSM1, NULL, 55001, '20260215', '20260216', 'C', '20260310', 15000.00, '2500', 12500.00, 'Accident avec tiers sur Bd Mohammed V, Casablanca - Constat amiable', '20260216'),
(8002, 2, @PolAutoDSM1, NULL, 55002, '20260420', '20260421', 'E', '20260421', 8500.00, '2000', 0.00, 'Choc arrière parking siège Rabat - En attente expertise', '20260421'),
(8003, 3, @PolAutoDSM1, NULL, 55003, '20260810', '20260811', 'E', '20260811', 22000.00, '3500', 0.00, 'Accident avec taxi route Marrakech-Agadir - Rapport police attendu', '20260811'),
(8004, 12, @PolAutoASL, NULL, 55004, '20260128', '20260129', 'C', '20260220', 28000.00, '4000', 24000.00, 'Collision avec glissière sécurité A3 sortie Aéroport Mohammed V', '20260129'),
(8005, 13, @PolAutoASL, NULL, 55005, '20260315', '20260316', 'C', '20260405', 12000.00, '3000', 9000.00, 'Accrochage avec bus CTM au terminal 2 - Aéroport Casa', '20260316'),
(8006, 19, @PolAutoOmar, NULL, 55006, '20260305', '20260305', 'C', '20260325', 6500.00, '2000', 4500.00, 'Accrochage parking Marjane Californie Casablanca - Tiers identifié', '20260305'),
(8007, 15, @PolAutoGDA, NULL, 55007, '20260710', '20260711', 'C', '20260801', 18500.00, '3000', 15500.00, 'Collision arrière livraison - Bd Moulay Ismail Casablanca', '20260711'),
(8008, 20, @PolAutoRachid, NULL, 55008, '20261020', '20261022', 'C', '20261115', 4800.00, '1500', 3300.00, 'Bris pare-brise et rétroviseur - Projection pierre autoroute', '20261022'),
(8009, 21, @PolAutoSouad, NULL, 55009, '20260905', '20260906', 'C', '20260930', 9500.00, '2000', 7500.00, 'Collision carrefour - Bd Ghandi Casablanca', '20260906'),

-- === SINISTRES SANTÉ ===
(8010, NULL, @PolSanteDSM, 5001, 55010, '20260310', '20260312', 'C', '20260405', 3200.00, '640', 2560.00, 'Consultation spécialiste + IRM cervicale - Clinique Nations Unies Rabat', '20260312'),
(8011, NULL, @PolSanteDSM, 5005, 55011, '20260510', '20260512', 'E', '20260512', 2450.00, '490', 0.00, 'Analyses biologiques + Radio pulmonaire - Labo Berrechid Casa', '20260512'),
(8012, NULL, @PolSanteDSM, 5005, 55012, '20260620', '20260622', 'C', '20260715', 1800.00, '360', 1440.00, 'Consultation ORL + Audiogramme pour Salma Benchekroun - Polyclinique Maarif', '20260622'),
(8013, NULL, @PolSanteERS, 5007, 55013, '20260415', '20260417', 'C', '20260510', 4500.00, '900', 3600.00, 'Hospitalisation 3j clinique Ain Sebaa - Appendicite aiguë', '20260417'),
(8014, NULL, @PolSanteERS, 5008, 55014, '20260901', '20260903', 'E', '20260903', 6500.00, '1300', 0.00, 'Accouchement césarienne - Clinique Badr Casablanca', '20260903'),
(8015, NULL, @PolSanteASL, 5011, 55015, '20260905', '20260907', 'C', '20260930', 2800.00, '560', 2240.00, 'Extraction dentaire + Couronne céramique - Centre Dentaire Nations Unies', '20260907'),
(8016, NULL, @PolSanteASL, 5010, 55016, '20261110', '20261112', 'E', '20261112', 1800.00, '360', 0.00, 'Consultation gynécologique + Échographie - Clinique Aviation Marrakech', '20261112'),
(8017, NULL, @PolSanteOmar, 5015, 55017, '20260720', '20260722', 'C', '20260815', 1200.00, '240', 960.00, 'Consultation cardiologue + ECG - Polyclinique Racine Casablanca', '20260722'),
(8018, NULL, @PolSanteFatima, 5016, 55018, '20260915', '20260917', 'C', '20261010', 3500.00, '700', 2800.00, 'Kinésithérapie 10 séances - Centre Rééducation Guéliz Marrakech', '20260917');

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

-- Documents Santé
(@PolSanteDSM, 601, 'Liste Adhérents Santé DSM 2026'),
(@PolSanteDSM, 602, 'Contrat Assurance Groupe Santé DSM'),
(@PolSanteERS, 701, 'Convention Tiers Payant ERS 2026'),
(@PolSanteASL, 801, 'Convention Tiers Payant ASL 2026');

-- =====================================================
-- 11. RÉCLAMATIONS
-- =====================================================
INSERT INTO dbo.ReclamationsIdt (FK_User_Client, DateReclamation, Sujet, Statut, DateStatut, Nature, CreatedAt) VALUES
-- Hamza (Digital Solutions)
(@UserClient1, '20260210 09:15:00', 'Demande de cartes vertes Flotte 2026', 'C', '20260212 14:20:00', 'I', '20260210 09:15:00'),
(@UserClient1, '20260320 08:45:00', 'Contestation franchise sinistre 55001', 'C', '20260322 09:30:00', 'I', '20260320 08:45:00'),
(@UserClient1, '20260415 11:00:00', 'Demande ajout adhérent santé DSM', 'E', NULL, 'I', '20260415 11:00:00'),

-- Sanae (Énergies Sud)
(@UserClient2, '20260515 11:20:00', 'Demande ajout véhicule utilitaire flotte ERS', 'E', NULL, 'I', '20260515 11:20:00'),

-- Anas Benchekroun (Adhérent DSM)
(@UserAdherent1, '20260520 14:30:00', 'Suivi remboursement dossier 55011', 'C', '20260521 10:15:00', 'S', '20260520 14:30:00'),
(@UserAdherent1, '20260325 10:00:00', 'Erreur calcul remboursement consultation', 'C', '20260326 09:45:00', 'S', '20260325 10:00:00'),

-- Nadia Slaoui (Adhérente ASL)
(@UserAdherent2, '20260701 08:30:00', 'Demande carte tiers payant ASL 2026', 'C', '20260701 16:00:00', 'S', '20260701 08:30:00'),
(@UserAdherent2, '20261115 11:00:00', 'Délai remboursement échographie dépassé', 'E', NULL, 'S', '20261115 11:00:00');

-- Récupération IDs réclamations
DECLARE @R1 INT, @R2 INT, @R3 INT, @R4 INT, @R5 INT, @R6 INT, @R7 INT, @R8 INT;

SELECT @R1 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient1 AND Sujet LIKE '%cartes vertes%';
SELECT @R2 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient1 AND Sujet LIKE '%franchise%';
SELECT @R3 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient1 AND Sujet LIKE '%adhérent%';
SELECT @R4 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient2;
SELECT @R5 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserAdherent1 AND Sujet LIKE '%Suivi remboursement%';
SELECT @R6 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserAdherent1 AND Sujet LIKE '%Erreur calcul%';
SELECT @R7 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserAdherent2 AND Sujet LIKE '%carte tiers payant%';
SELECT @R8 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserAdherent2 AND Sujet LIKE '%échographie%';

-- Messages des réclamations
INSERT INTO dbo.ReclamationsDet (FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) VALUES
-- R1 - Cartes vertes
(@R1, @UserClient1, '20260210 09:15:00', 'C', 'Salam, veuillez nous transmettre les cartes vertes 2026 pour notre flotte automobile (4 véhicules). Urgent.'),
(@R1, @AdminId, '20260210 10:30:00', 'A', 'Salam, nous avons bien reçu votre demande. Les cartes vertes sont en cours d''émission. Délai 48h.'),
(@R1, @AdminId, '20260212 14:20:00', 'A', 'Les cartes vertes sont disponibles dans votre espace documents. Bonne réception.'),

-- R2 - Contestation franchise
(@R2, @UserClient1, '20260320 08:45:00', 'C', 'Nous contestons la franchise de 2500 DH sur sinistre 55001. Selon contrat, franchise RC est à 0 DH.'),
(@R2, @AdminId, '20260321 16:00:00', 'A', 'M. Belkadi, le sinistre concerne la garantie Dommages Collision (franchise 2500 DH) et non la RC.'),
(@R2, @UserClient1, '20260322 09:30:00', 'C', 'Effectivement, veuillez nous excuser. Nous confirmons notre accord pour la prise en charge.'),

-- R3 - Ajout adhérent santé
(@R3, @UserClient1, '20260415 11:00:00', 'C', 'Demande d''ajout d''un nouvel adhérent à notre contrat santé groupe DSM. Formulaire en PJ.'),
(@R3, @CommercialId, '20260416 09:30:00', 'A', 'Votre demande a été transmise au service adhésion. Traitement sous 72h.'),

-- R4 - Ajout véhicule ERS
(@R4, @UserClient2, '20260515 11:20:00', 'C', 'Demande d''ajout d''un Toyota Hilux à notre flotte ERS. Devis concessionnaire en pièce jointe.'),
(@R4, @CommercialId, '20260516 09:45:00', 'A', 'Mme El Idrissi, votre demande est enregistrée. Délai de traitement 5 jours ouvrés pour avenant.'),

-- R5 - Suivi remboursement Anas
(@R5, @UserAdherent1, '20260520 14:30:00', 'C', 'Salam, mon dossier 55011 du 12 mai est toujours en attente de paiement. Délai dépassé.'),
(@R5, @AdminId, '20260521 10:15:00', 'A', 'Salam M. Benchekroun, virement de 2450 DH effectué ce jour. Délai réception 48-72h. Excuses pour le retard.'),
(@R5, @UserAdherent1, '20260521 11:00:00', 'C', 'Merci pour votre réactivité. Bonne continuation.'),

-- R6 - Erreur calcul remboursement
(@R6, @UserAdherent1, '20260325 10:00:00', 'C', 'Erreur sur remboursement consultation : payé 400 DH, remboursé 280 DH au lieu de 320 DH (80%).'),
(@R6, @AdminId, '20260325 15:30:00', 'A', 'Nous vérifions votre dossier. Le service comptable analyse l''écart de 40 DH.'),
(@R6, @AdminId, '20260326 09:45:00', 'A', 'Erreur confirmée. Complément de 40 DH viré sous 48h. Toutes nos excuses.'),

-- R7 - Carte tiers payant ASL
(@R7, @UserAdherent2, '20260701 08:30:00', 'C', 'Bonjour, je n''ai pas reçu ma carte tiers payant ASL 2026. Délai de 15 jours dépassé.'),
(@R7, @AdminId, '20260701 16:00:00', 'A', 'Bonjour Mme Slaoui, votre carte est disponible en agence ASL aéroport. Possibilité envoi postal.'),
(@R7, @UserAdherent2, '20260702 09:00:00', 'C', 'Merci, je passerai la récupérer en agence cette semaine.'),

-- R8 - Délai échographie
(@R8, @UserAdherent2, '20261115 11:00:00', 'C', 'Mon dossier échographie du 12 novembre n''est toujours pas traité. Délai anormal.'),
(@R8, @AdminId, '20261117 14:00:00', 'A', 'Mme Slaoui, le dossier nécessite une validation médicale complémentaire. Délai supplémentaire 48h.');
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

PRINT '=== DONNÉES DE TEST IMPORTÉES AVEC SUCCÈS ===';
GO