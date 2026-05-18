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
DELETE FROM dbo.UsersXClients;
DELETE FROM dbo.Clients;
DELETE FROM dbo.userConnection;
DELETE FROM dbo.Postes_Autorises;
DELETE FROM dbo.Roles;
DELETE FROM dbo.sysUser;
DELETE FROM dbo.Compagnies;
GO

-- Réinitialisation des IDENTITY à 0
DBCC CHECKIDENT ('dbo.sysUser', RESEED, 0);
DBCC CHECKIDENT ('dbo.Postes_Autorises', RESEED, 0);
DBCC CHECKIDENT ('dbo.userConnection', RESEED, 0);
DBCC CHECKIDENT ('dbo.Roles', RESEED, 0);
DBCC CHECKIDENT ('dbo.Compagnies', RESEED, 0);
DBCC CHECKIDENT ('dbo.Risques', RESEED, 0);
DBCC CHECKIDENT ('dbo.Garanties', RESEED, 0);
DBCC CHECKIDENT ('dbo.PolDocument', RESEED, 0);
DBCC CHECKIDENT ('dbo.ReclamationsIdt', RESEED, 0);
DBCC CHECKIDENT ('dbo.ReclamationsDet', RESEED, 0);
GO

-- =====================================================
-- 1. COMPAGNIES D'ASSURANCE
-- =====================================================
INSERT INTO dbo.Compagnies (RaisonSociale, CreatedAt) VALUES
('Wafa Assurance', '20260101'),
('RMA Assurance', '20260101'),
('Saham Assurance', '20260101'),
('AtlantaSanad Assurance', '20260101'),
('MAMDA/MCMA', '20260101');

DECLARE @Comp1Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'Wafa Assurance');
DECLARE @Comp2Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'RMA Assurance');
DECLARE @Comp3Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'Saham Assurance');
DECLARE @Comp4Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'AtlantaSanad Assurance');
DECLARE @Comp5Id INT = (SELECT Id FROM dbo.Compagnies WHERE RaisonSociale = 'MAMDA/MCMA');

-- =====================================================
-- 2. UTILISATEURS
-- =====================================================
SET IDENTITY_INSERT dbo.sysUser ON;
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt, token) VALUES
(1, 'b192749b-683c-408c-bfbc-876c045c5b4c', 'Reda El Mansouri', '0661223344', 'admin1@test.ma', 'A', 'O', 'N', '20260101', 'token_admin_001'),
(2, 'commercial_keycloak_002', 'Samira Alami', '0661556677', 'com1@test.ma', 'C', 'O', 'N', '20260101', 'token_com_001'),
(3, 'f823c1e8-46db-43c6-a8a7-f86b506c3fbc', 'Badr MANYANI', '0661889900', 'client1@test.ma', 'C', 'O', 'N', '20260101', 'token_societe1'),
(4, 'client_societe2_auth', 'Laila Bennani (OCP)', '0661112233', 'client2@test.ma', 'C', 'O', 'N', '20260101', 'token_societe2'),
(5, '6054d0c2-0f70-4b79-8635-13b8f69e4aa8', 'Mehdi Ziani', '0661445566', 'adherent1@test.ma', 'C', 'N', 'O', '20260101', 'token_adherent1'),
(6, '', 'Fatima Zahra Mansouri', '0661778899', 'adherent2@test.ma', 'C', 'N', 'O', '20260101', 'token_adherent2');
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
(1001, 'Groupe OCP S.A.', 'N', 'achats@ocpgroup.ma', 'Lotissement La Colline, Sidi Maârouf, Casablanca', '0522334455', 'O', 'O', '20260101'),
(1002, 'Maroc Telecom S.A.', 'N', 'direction.achats@mac.ma', 'Avenue Annakhil, Hay Ryad, Rabat', '0537719000', 'O', 'O', '20260101'),
(1003, 'Royal Air Maroc', 'N', 'assurances@ram.ma', 'Aéroport Mohammed V, Nouaceur', '0522434343', 'O', 'N', '20260101'), -- recAdh = 'N' for RAM
(1004, 'Groupe LabelVie', 'N', 'direction@labelvie.ma', 'Bd Al Qods, Sidi Maarouf, Casablanca', '0520334456', 'N', 'O', '20260101'), -- recClt = 'N' for LabelVie
(1005, 'BMCE Bank of Africa', 'N', 'assurances@bmcebank.ma', '140 Avenue Hassan II, Casablanca', '0522494000', 'O', 'O', '20260101'),
-- Clients Particuliers
(2001, 'Omar El Fassi', 'O', 'omar.elfassi@email.ma', 'Rue Abou Al Alaa, Quartier Racine, Maarif, Casablanca', '0661223345', 'O', 'O', '20260101'),
(2002, 'Khadija Bennouna', 'O', 'khadija.bennouna@email.ma', 'Avenue Hassan II, Résidence Al Amal, Guéliz, Marrakech', '0667889900', 'O', 'O', '20260101'),
(2003, 'Youssef Amrani', 'O', 'youssef.amrani@email.ma', 'Hay El Wifaq, Avenue Hassan II, Témara', '0665112233', 'O', 'O', '20260101'),
(2004, 'Naima Berrada', 'O', 'naima.berrada@email.ma', 'Rue Ibn Toumert, Quartier Palmiers, Casablanca', '0662445566', 'O', 'O', '20260101'),
(2005, 'Hassan El Idrissi', 'O', 'hassan.idrissi@email.ma', 'Avenue Moulay Ismail, Agdal, Rabat', '0667338844', 'O', 'O', '20260101');

DECLARE @ClientId1 INT = 1001; -- OCP
DECLARE @ClientId2 INT = 1002; -- Maroc Telecom
DECLARE @ClientId3 INT = 1003; -- RAM
DECLARE @ClientId4 INT = 1004; -- LabelVie
DECLARE @ClientId5 INT = 1005; -- BMCE
DECLARE @ClientId6 INT = 2001; -- Omar El Fassi
DECLARE @ClientId7 INT = 2002; -- Khadija Bennouna
DECLARE @ClientId8 INT = 2003; -- Youssef Amrani
DECLARE @ClientId9 INT = 2004; -- Naima Berrada
DECLARE @ClientId10 INT = 2005; -- Hassan El Idrissi

-- Liaison Users <-> Clients
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES
(@UserClient1, @ClientId2, 'O', '20260101'),  -- Badr -> Maroc Telecom
(@UserClient2, @ClientId1, 'O', '20260101'),  -- Laila -> OCP
(@UserAdherent1, @ClientId6, 'O', '20260101'), -- Mehdi -> Omar El Fassi
(@UserAdherent2, @ClientId7, 'O', '20260101'); -- Fatima Zahra -> Khadija Bennouna

-- =====================================================
-- 4. POLICES D'ASSURANCE (Automobile & Santé)
-- =====================================================
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) VALUES
-- === BRANCHE AUTOMOBILE ===
-- Maroc Telecom
(101, @ClientId2, @Comp1Id, 'Automobile', 'AUTO-MAC-2026-001', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
(102, @ClientId2, @Comp1Id, 'Automobile', 'AUTO-MAC-2026-002', '20261231', 'E', 'DIRECTION', '20260101', '20260101'),
-- OCP
(103, @ClientId1, @Comp2Id, 'Automobile', 'AUTO-OCP-2026-001', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
(104, @ClientId1, @Comp2Id, 'Automobile', 'AUTO-OCP-2026-002', '20261231', 'E', 'LOGISTIQUE', '20260101', '20260101'),
-- RAM
(105, @ClientId3, @Comp3Id, 'Automobile', 'AUTO-RAM-2026-001', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
-- LabelVie
(106, @ClientId4, @Comp4Id, 'Automobile', 'AUTO-LBV-2026-001', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
-- BMCE
(107, @ClientId5, @Comp1Id, 'Automobile', 'AUTO-BMCE-2026-001', '20261231', 'E', 'FLOTTE', '20260101', '20260101'),
-- Particuliers
(108, @ClientId6, @Comp4Id, 'Automobile', 'AUTO-PAR-2026-001', '20260630', 'E', 'INDIV', '20260101', '20260101'),
(109, @ClientId8, @Comp4Id, 'Automobile', 'AUTO-PAR-2026-002', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(110, @ClientId9, @Comp5Id, 'Automobile', 'AUTO-PAR-2026-003', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(111, @ClientId10, @Comp5Id, 'Automobile', 'AUTO-PAR-2026-004', '20260930', 'E', 'INDIV', '20260101', '20260101'),

-- === BRANCHE SANTÉ ===
-- Maroc Telecom
(201, @ClientId2, @Comp1Id, 'Santé', 'SANTE-MAC-2026-001', '20261231', 'E', 'GROUPE', '20260101', '20260101'),
-- OCP
(202, @ClientId1, @Comp2Id, 'Santé', 'SANTE-OCP-2026-001', '20261231', 'E', 'GROUPE', '20260101', '20260101'),
-- RAM
(203, @ClientId3, @Comp3Id, 'Santé', 'SANTE-RAM-2026-001', '20261231', 'E', 'GROUPE', '20260601', '20260101'),
-- BMCE
(204, @ClientId5, @Comp1Id, 'Santé', 'SANTE-BMCE-2026-001', '20261231', 'E', 'GROUPE', '20260101', '20260101'),
-- Particuliers
(205, @ClientId6, @Comp4Id, 'Santé', 'SANTE-PAR-2026-001', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(206, @ClientId7, @Comp5Id, 'Santé', 'SANTE-PAR-2026-002', '20261231', 'E', 'INDIV', '20260101', '20260101'),
(207, @ClientId9, @Comp4Id, 'Santé', 'SANTE-PAR-2026-003', '20261231', 'E', 'INDIV', '20260101', '20260101');

-- Variables polices Auto
DECLARE @PolAutoMAC1 INT = 101, @PolAutoMAC2 INT = 102;
DECLARE @PolAutoOCP1 INT = 103, @PolAutoOCP2 INT = 104;
DECLARE @PolAutoRAM INT = 105, @PolAutoLBV INT = 106, @PolAutoBMCE INT = 107;
DECLARE @PolAutoOmar INT = 108, @PolAutoYoussef INT = 109;
DECLARE @PolAutoNaima INT = 110, @PolAutoHassan INT = 111;

-- Variables polices Santé
DECLARE @PolSanteMAC INT = 201, @PolSanteOCP INT = 202, @PolSanteRAM INT = 203;
DECLARE @PolSanteBMCE INT = 204, @PolSanteOmar INT = 205;
DECLARE @PolSanteKhadija INT = 206, @PolSanteNaima INT = 207;

-- =====================================================
-- 5. ADHERENTS (Santé)
-- =====================================================
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, DateAdhesion, Actif, Telephone, CreatedAt) VALUES
-- Maroc Telecom - Police Santé 201
(5001, @PolSanteMAC, NULL, 'Karim Bensaid', 'karim.bensaid@mac.ma', 10001, 2020001, '19750412', '20260101', 'O', '0661234567', '20260101'),
(5002, @PolSanteMAC, NULL, 'Nadia Ouazzani', 'nadia.ouazzani@mac.ma', 10002, 2020002, '19800823', '20260101', 'O', '0661234568', '20260101'),
(5003, @PolSanteMAC, NULL, 'Hicham Tazi', 'hicham.tazi@mac.ma', 10003, 2020003, '19851107', '20260101', 'O', '0661234569', '20260101'),
(5004, @PolSanteMAC, NULL, 'Salma Belkadi', 'salma.belkadi@mac.ma', 10004, 2020004, '19900314', '20260101', 'O', '0661234570', '20260101'),
(5005, @PolSanteMAC, @UserAdherent1, 'Mehdi Ziani', 'adherent1@test.ma', 10005, 2020005, '19920707', '20260101', 'O', '0661445566', '20260101'),
(5006, @PolSanteMAC, NULL, 'Rachid Bennani', 'rachid.bennani@mac.ma', 10006, 2020006, '19880419', '20260101', 'O', '0661234573', '20260101'),

-- OCP - Police Santé 202
(5007, @PolSanteOCP, NULL, 'Mohamed El Alami', 'mohamed.alami@ocp.ma', 10011, 2020011, '19801215', '20260101', 'O', '0661234571', '20260101'),
(5008, @PolSanteOCP, NULL, 'Fadila Cherkaoui', 'fadila.cherkaoui@ocp.ma', 10012, 2020012, '19850328', '20260101', 'O', '0661234572', '20260101'),
(5009, @PolSanteOCP, NULL, 'Amina Lahlou', 'amina.lahlou@ocp.ma', 10013, 2020013, '19870803', '20260101', 'O', '0661234574', '20260101'),

-- RAM - Police Santé 203
(5010, @PolSanteRAM, @UserAdherent2, 'Fatima Zahra Mansouri', 'adherent2@test.ma', 10020, 2020020, '19801010', '20260601', 'O', '0661778899', '20260101'),
(5011, @PolSanteRAM, NULL, 'Hassan Idrissi', 'hassan.idrissi@ram.ma', 10021, 2020021, '19780615', '20260601', 'O', '0661234575', '20260101'),
(5012, @PolSanteRAM, NULL, 'Meriem Fassi', 'meriem.fassi@ram.ma', 10022, 2020022, '19850922', '20260601', 'O', '0661234576', '20260101'),

-- BMCE - Police Santé 204
(5013, @PolSanteBMCE, NULL, 'Tarik Berrada', 'tarik.berrada@bmce.ma', 10030, 2020030, '19820318', '20260101', 'O', '0661234577', '20260101'),
(5014, @PolSanteBMCE, NULL, 'Souad Alaoui', 'souad.alaoui@bmce.ma', 10031, 2020031, '19860705', '20260101', 'O', '0661234578', '20260101'),

-- Particuliers - Police Santé 205 (Omar)
(5015, @PolSanteOmar, NULL, 'Omar El Fassi', 'omar.elfassi@email.ma', 10040, 9999001, '19850403', '20260101', 'O', '0661223345', '20260101'),
-- Particuliers - Police Santé 206 (Khadija)
(5016, @PolSanteKhadija, NULL, 'Khadija Bennouna', 'khadija.bennouna@email.ma', 10041, 9999002, '19900812', '20260101', 'O', '0667889900', '20260101'),
-- Particuliers - Police Santé 207 (Naima)
(5017, @PolSanteNaima, NULL, 'Naima Berrada', 'naima.berrada@email.ma', 10042, 9999003, '19761125', '20260101', 'O', '0662445566', '20260101');

-- Personnes à charge
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) VALUES
-- Famille Mehdi Ziani (5005)
(6001, 5005, 'Yassine Ziani', 'Enfant', '20150515', '20260101', '20260101'),
(6002, 5005, 'Sara Ziani', 'Conjoint', '19940820', '20260101', '20260101'),
-- Famille Karim Bensaid (5001)
(6003, 5001, 'Ines Bensaid', 'Enfant', '20100312', '20260101', '20260101'),
(6004, 5001, 'Yahya Bensaid', 'Enfant', '20140625', '20260101', '20260101'),
-- Famille Nadia Ouazzani (5002)
(6005, 5002, 'Ahmed Ouazzani', 'Conjoint', '19781130', '20260101', '20260101'),
-- Famille Mohamed El Alami (5007)
(6006, 5007, 'Samir El Alami', 'Enfant', '20180110', '20260101', '20260101'),
(6007, 5007, 'Nour El Alami', 'Enfant', '20200915', '20260101', '20260101'),
-- Famille Fatima Zahra Mansouri (5010)
(6008, 5010, 'Omar Mansouri', 'Enfant', '20120805', '20260601', '20260101'),
(6009, 5010, 'Lina Mansouri', 'Enfant', '20150320', '20260601', '20260101'),
-- Famille Hicham Tazi (5003)
(6010, 5003, 'Leila Tazi', 'Conjoint', '19881015', '20260101', '20260101'),
-- Famille Omar El Fassi (5015)
(6011, 5015, 'Meriem El Fassi', 'Conjoint', '19870920', '20260101', '20260101'),
(6012, 5015, 'Adam El Fassi', 'Enfant', '20170610', '20260101', '20260101');

-- =====================================================
-- 6. RISQUES (Véhicules Automobile)
-- =====================================================
INSERT INTO dbo.Risques (FK_Police_Id, Libelle, Identifiant, Description, Assure, DateDu, DateEcheance, NumeroIBS, Statut, CreatedAt) VALUES
-- Flotte Maroc Telecom 1 (101)
(@PolAutoMAC1, 'Dacia Duster Essence', '12345-A-1', 'Véhicule Service Direction - Rabat', 'Ahmed Alami', '20260101', '20261231', 9001, 'O', '20260101'),
(@PolAutoMAC1, 'Renault Clio 5 Diesel', '67890-A-7', 'Véhicule Service Commercial - Casablanca', 'Khadija Mansouri', '20260101', '20261231', 9002, 'O', '20260101'),
(@PolAutoMAC1, 'Peugeot 3008 Allure', '11223-A-33', 'Véhicule Direction Régionale - Marrakech', 'Youssef Benjelloun', '20260101', '20261231', 9003, 'O', '20260101'),
(@PolAutoMAC1, 'Citroën Berlingo Utilitaire', '12346-A-2', 'Véhicule Technique - Maintenance', 'Tarik El Fassi', '20260101', '20261231', 9004, 'O', '20260101'),

-- Maroc Telecom Direction (102)
(@PolAutoMAC2, 'BMW Série 3 320d', '99887-D-1', 'Véhicule de Fonction PDG', 'Rachid Benbrahim', '20260101', '20261231', 9005, 'O', '20260101'),
(@PolAutoMAC2, 'Audi A4 Avant', '99888-D-2', 'Véhicule de Fonction DGA', 'Laila Cherkaoui', '20260101', '20261231', 9006, 'O', '20260101'),

-- Flotte OCP 1 (103)
(@PolAutoOCP1, 'Toyota Land Cruiser Prado', '44556-C-1', 'Véhicule Site Minier Benguerir', 'Soufiane Belkhayat', '20260101', '20261231', 9007, 'O', '20260101'),
(@PolAutoOCP1, 'Nissan Navara', '44557-C-2', 'Véhicule Site Minier Khouribga', 'Mustapha Naciri', '20260101', '20261231', 9008, 'O', '20260101'),
(@PolAutoOCP1, 'Mitsubishi L200', '44558-C-3', 'Véhicule Site Laâyoune', 'Nabil Slaoui', '20260101', '20261231', 9009, 'O', '20260101'),

-- Flotte OCP Logistique (104)
(@PolAutoOCP2, 'Mercedes Actros 1845', '55667-L-1', 'Camion Transport Phosphate', 'Jaouad Berrada', '20260101', '20261231', 9010, 'O', '20260101'),
(@PolAutoOCP2, 'Volvo FH 460', '55668-L-2', 'Camion Transport Acide', 'Abdelilah Tahiri', '20260101', '20261231', 9011, 'O', '20260101'),

-- Flotte RAM (105)
(@PolAutoRAM, 'Toyota Hilux Double Cabine', '33445-B-1', 'Transport Aéroport - Navette Équipage', 'Anass El Hariri', '20260101', '20261231', 9012, 'O', '20260101'),
(@PolAutoRAM, 'Mercedes Sprinter 315', '33446-B-2', 'Transport Personnel Aéroport Casa', 'Meriem Bensouda', '20260101', '20261231', 9013, 'O', '20260101'),
(@PolAutoRAM, 'Renault Master', '33447-B-3', 'Transport Bagages Aéroport', 'Sami Bennouna', '20260101', '20261231', 9014, 'O', '20260101'),

-- Flotte LabelVie (106)
(@PolAutoLBV, 'Ford Transit Custom', '77889-E-1', 'Véhicule Livraison - Carrefour Market', 'Khalid Sekkat', '20260101', '20261231', 9015, 'O', '20260101'),
(@PolAutoLBV, 'Renault Kangoo Express', '77890-E-2', 'Véhicule Livraison - Atacadão', 'Rania Bouazza', '20260101', '20261231', 9016, 'O', '20260101'),

-- Flotte BMCE (107)
(@PolAutoBMCE, 'Volkswagen Passat', '99001-F-1', 'Véhicule Service Direction', 'Othman Benjelloun', '20260101', '20261231', 9017, 'O', '20260101'),
(@PolAutoBMCE, 'Skoda Octavia', '99002-F-2', 'Véhicule Service Agences', 'Noureddine Omary', '20260101', '20261231', 9018, 'O', '20260101'),

-- Particuliers
(@PolAutoOmar, 'Hyundai Tucson 2024', '11223-G-1', 'SUV Blanc - Véhicule Personnel', 'Omar El Fassi', '20260101', '20260630', 9019, 'O', '20260101'),
(@PolAutoYoussef, 'Dacia Sandero Stepway', '11224-G-2', 'Citadine Grise - Véhicule Personnel', 'Youssef Amrani', '20260101', '20261231', 9020, 'O', '20260101'),
(@PolAutoNaima, 'Renault Captur', '11225-G-3', 'SUV Compact Bleu - Véhicule Personnel', 'Naima Berrada', '20260101', '20261231', 9021, 'O', '20260101'),
(@PolAutoHassan, 'Peugeot 208', '11226-G-4', 'Citadine Rouge - Véhicule Personnel', 'Hassan El Idrissi', '20260101', '20260930', 9022, 'O', '20260101');

-- =====================================================
-- 7. GARANTIES
-- =====================================================
INSERT INTO dbo.Garanties (FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES
-- Dacia Duster MAC
(1, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(1, 'Défense et Recours', 500000.00, '0', '20260101'),
(1, 'Dommages Collision', 250000.00, '2500', '20260101'),
(1, 'Incendie', 200000.00, '2000', '20260101'),
(1, 'Vol', 250000.00, '3000', '20260101'),
(1, 'Bris de Glaces', 15000.00, '500', '20260101'),

-- Renault Clio MAC
(2, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(2, 'Dommages Collision', 180000.00, '2000', '20260101'),
(2, 'Vol', 180000.00, '2500', '20260101'),

-- Peugeot 3008 MAC
(3, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(3, 'Tous Risques Sauf Guerre', 350000.00, '3500', '20260101'),
(3, 'Bris de Glaces', 20000.00, '500', '20260101'),

-- BMW Série 3 MAC Direction
(5, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(5, 'Tous Risques Sauf Guerre', 450000.00, '5000', '20260101'),
(5, 'Assistance Panne 0KM', 50000.00, '0', '20260101'),

-- Toyota Land Cruiser OCP
(7, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(7, 'Dommages Collision', 400000.00, '4000', '20260101'),
(7, 'Vol et Incendie', 400000.00, '5000', '20260101'),

-- Toyota Hilux RAM
(12, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(12, 'Dommages Collision', 350000.00, '4000', '20260101'),
(12, 'Vol et Incendie', 350000.00, '5000', '20260101'),

-- Ford Transit LabelVie
(15, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(15, 'Dommages Collision', 200000.00, '3000', '20260101'),
(15, 'Vol', 200000.00, '3500', '20260101'),

-- Hyundai Tucson Omar
(19, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(19, 'Défense et Recours', 500000.00, '0', '20260101'),
(19, 'Dommages Collision', 220000.00, '2000', '20260101'),
(19, 'Vol', 220000.00, '2500', '20260101'),
(19, 'Incendie', 220000.00, '1500', '20260101'),

-- Dacia Sandero Youssef
(20, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(20, 'Dommages Collision', 150000.00, '1500', '20260101'),
(20, 'Incendie', 150000.00, '1000', '20260101'),

-- Renault Captur Naima
(21, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(21, 'Défense et Recours', 500000.00, '0', '20260101'),
(21, 'Dommages Collision', 200000.00, '2000', '20260101'),
(21, 'Vol', 200000.00, '2500', '20260101'),
(21, 'Bris de Glaces', 12000.00, '400', '20260101'),

-- Peugeot 208 Hassan
(22, 'Responsabilité Civile', 5000000.00, '0', '20260101'),
(22, 'Dommages Collision', 140000.00, '1500', '20260101');

-- =====================================================
-- 8. QUITTANCES
-- =====================================================
INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) VALUES
-- AUTO
(7001, @PolAutoMAC1, 1001, '20260101', '20260630', 45000.00, 0.00, '20260215', 'R', '20260101'),
(7002, @PolAutoMAC1, 1002, '20260701', '20261231', 45000.00, 45000.00, '20260715', 'E', '20260601'),
(7003, @PolAutoOCP1, 2001, '20260101', '20261231', 85000.00, 0.00, '20260215', 'R', '20260101'),
(7004, @PolAutoRAM, 3001, '20260101', '20261231', 120000.00, 0.00, '20260215', 'R', '20260101'),
(7005, @PolAutoOmar, 4001, '20260101', '20260630', 4200.00, 0.00, '20260215', 'R', '20260101'),
(7006, @PolAutoOmar, 4002, '20260701', '20261231', 4200.00, 4200.00, '20260715', 'E', '20260601'),
(7007, @PolAutoYoussef, 5001, '20260101', '20260630', 3500.00, 0.00, '20260215', 'R', '20260101'),
(7008, @PolAutoYoussef, 5002, '20260701', '20261231', 3500.00, 3500.00, '20260715', 'E', '20260601'),

-- SANTÉ
(7009, @PolSanteMAC, 6001, '20260101', '20260630', 250000.00, 0.00, '20260215', 'R', '20260101'),
(7010, @PolSanteMAC, 6002, '20260701', '20261231', 250000.00, 250000.00, '20260715', 'E', '20260601'),
(7011, @PolSanteOCP, 7001, '20260101', '20260630', 450000.00, 0.00, '20260215', 'R', '20260101'),
(7012, @PolSanteOCP, 7002, '20260701', '20261231', 450000.00, 450000.00, '20260715', 'E', '20260601'),
(7013, @PolSanteRAM, 8001, '20260601', '20261231', 180000.00, 0.00, '20260715', 'R', '20260601'),
(7014, @PolSanteOmar, 9001, '20260101', '20261231', 3600.00, 0.00, '20260215', 'R', '20260101'),
(7015, @PolSanteKhadija, 10001, '20260101', '20261231', 2800.00, 0.00, '20260215', 'R', '20260101');

-- =====================================================
-- 9. SINISTRES
-- =====================================================
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, MT_Franchise, MT_Indemnite, Observations, CreatedAt) VALUES
-- === SINISTRES AUTOMOBILE ===
(8001, 1, @PolAutoMAC1, NULL, 55001, '20260215', '20260216', 'C', '20260310', 15000.00, '2500', 12500.00, 'Accident avec tiers sur Bd Mohammed V, Casablanca - Constat amiable', '20260216'),
(8002, 2, @PolAutoMAC1, NULL, 55002, '20260420', '20260421', 'E', '20260421', 8500.00, '2000', 0.00, 'Choc arrière parking siège Rabat - En attente expertise', '20260421'),
(8003, 3, @PolAutoMAC1, NULL, 55003, '20260810', '20260811', 'E', '20260811', 22000.00, '3500', 0.00, 'Accident avec taxi route Marrakech-Agadir - Rapport police attendu', '20260811'),
(8004, 12, @PolAutoRAM, NULL, 55004, '20260128', '20260129', 'C', '20260220', 28000.00, '4000', 24000.00, 'Collision avec glissière sécurité A3 sortie Aéroport Mohammed V', '20260129'),
(8005, 13, @PolAutoRAM, NULL, 55005, '20260315', '20260316', 'C', '20260405', 12000.00, '3000', 9000.00, 'Accrochage avec bus CTM au terminal 2 - Aéroport Casa', '20260316'),
(8006, 19, @PolAutoOmar, NULL, 55006, '20260305', '20260305', 'C', '20260325', 6500.00, '2000', 4500.00, 'Accrochage parking Marjane Californie Casablanca - Tiers identifié', '20260305'),
(8007, 15, @PolAutoLBV, NULL, 55007, '20260710', '20260711', 'C', '20260801', 18500.00, '3000', 15500.00, 'Collision arrière livraison - Bd Moulay Ismail Casablanca', '20260711'),
(8008, 20, @PolAutoYoussef, NULL, 55008, '20261020', '20261022', 'C', '20261115', 4800.00, '1500', 3300.00, 'Bris pare-brise et rétroviseur - Projection pierre autoroute', '20261022'),
(8009, 21, @PolAutoNaima, NULL, 55009, '20260905', '20260906', 'C', '20260930', 9500.00, '2000', 7500.00, 'Collision carrefour - Bd Ghandi Casablanca', '20260906'),

-- === SINISTRES SANTÉ ===
(8010, NULL, @PolSanteMAC, 5001, 55010, '20260310', '20260312', 'C', '20260405', 3200.00, '640', 2560.00, 'Consultation spécialiste + IRM cervicale - Clinique Nations Unies Rabat', '20260312'),
(8011, NULL, @PolSanteMAC, 5005, 55011, '20260510', '20260512', 'E', '20260512', 2450.00, '490', 0.00, 'Analyses biologiques + Radio pulmonaire - Labo Berrechid Casa', '20260512'),
(8012, NULL, @PolSanteMAC, 5005, 55012, '20260620', '20260622', 'C', '20260715', 1800.00, '360', 1440.00, 'Consultation ORL + Audiogramme pour Sara Ziani - Polyclinique Maarif', '20260622'),
(8013, NULL, @PolSanteOCP, 5007, 55013, '20260415', '20260417', 'C', '20260510', 4500.00, '900', 3600.00, 'Hospitalisation 3j clinique Ain Sebaa - Appendicite aiguë', '20260417'),
(8014, NULL, @PolSanteOCP, 5008, 55014, '20260901', '20260903', 'E', '20260903', 6500.00, '1300', 0.00, 'Accouchement césarienne - Clinique Badr Casablanca', '20260903'),
(8015, NULL, @PolSanteRAM, 5011, 55015, '20260905', '20260907', 'C', '20260930', 2800.00, '560', 2240.00, 'Extraction dentaire + Couronne céramique - Centre Dentaire Nations Unies', '20260907'),
(8016, NULL, @PolSanteRAM, 5010, 55016, '20261110', '20261112', 'E', '20261112', 1800.00, '360', 0.00, 'Consultation gynécologique + Échographie - Clinique Aviation Marrakech', '20261112'),
(8017, NULL, @PolSanteOmar, 5015, 55017, '20260720', '20260722', 'C', '20260815', 1200.00, '240', 960.00, 'Consultation cardiologue + ECG - Polyclinique Racine Casablanca', '20260722'),
(8018, NULL, @PolSanteKhadija, 5016, 55018, '20260915', '20260917', 'C', '20261010', 3500.00, '700', 2800.00, 'Kinésithérapie 10 séances - Centre Rééducation Guéliz Marrakech', '20260917');

-- =====================================================
-- 10. DOCUMENTS
-- =====================================================
INSERT INTO dbo.PolDocument (fk_police_id, fk_document_id, libelle) VALUES
-- Documents Auto
(@PolAutoMAC1, 101, 'Carte Grise Dacia Duster 12345-A-1'),
(@PolAutoMAC1, 102, 'Carte Grise Renault Clio 67890-A-7'),
(@PolAutoMAC1, 103, 'Carte Grise Peugeot 3008 11223-A-33'),
(@PolAutoMAC1, 104, 'Contrat Flotte Automobile MAC 2026'),
(@PolAutoMAC1, 105, 'Attestation Assurance Flotte 2026'),
(@PolAutoOCP1, 201, 'Contrat Flotte Automobile OCP 2026'),
(@PolAutoRAM, 301, 'Contrat Flotte RAM 2026'),
(@PolAutoRAM, 302, 'Carte Grise Toyota Hilux 33445-B-1'),
(@PolAutoOmar, 401, 'Carte Grise Hyundai Tucson'),
(@PolAutoOmar, 402, 'Permis de Conduire Omar El Fassi'),
(@PolAutoYoussef, 501, 'Carte Grise Dacia Sandero'),

-- Documents Santé
(@PolSanteMAC, 601, 'Liste Adhérents Santé MAC 2026'),
(@PolSanteMAC, 602, 'Contrat Assurance Groupe Santé MAC'),
(@PolSanteOCP, 701, 'Convention Tiers Payant OCP 2026'),
(@PolSanteRAM, 801, 'Convention Tiers Payant RAM 2026');

-- =====================================================
-- 11. RÉCLAMATIONS
-- =====================================================
INSERT INTO dbo.ReclamationsIdt (FK_User_Client, DateReclamation, Sujet, Statut, DateStatut, Nature, CreatedAt) VALUES
-- Badr (Maroc Telecom)
(@UserClient1, '20260210 09:15:00', 'Demande de cartes vertes Flotte 2026', 'C', '20260212 14:20:00', 'I', '20260210 09:15:00'),
(@UserClient1, '20260320 08:45:00', 'Contestation franchise sinistre 55001', 'C', '20260322 09:30:00', 'I', '20260320 08:45:00'),
(@UserClient1, '20260415 11:00:00', 'Demande ajout adhérent santé MAC', 'E', NULL, 'I', '20260415 11:00:00'),

-- Laila (OCP)
(@UserClient2, '20260515 11:20:00', 'Demande ajout véhicule utilitaire flotte OCP', 'E', NULL, 'I', '20260515 11:20:00'),

-- Mehdi Ziani (Adhérent MAC)
(@UserAdherent1, '20260520 14:30:00', 'Suivi remboursement dossier 55011', 'C', '20260521 10:15:00', 'S', '20260520 14:30:00'),
(@UserAdherent1, '20260325 10:00:00', 'Erreur calcul remboursement consultation', 'C', '20260326 09:45:00', 'S', '20260325 10:00:00'),

-- Fatima Zahra (Adhérente RAM)
(@UserAdherent2, '20260701 08:30:00', 'Demande carte tiers payant RAM 2026', 'C', '20260701 16:00:00', 'S', '20260701 08:30:00'),
(@UserAdherent2, '20261115 11:00:00', 'Délai remboursement échographie dépassé', 'E', NULL, 'S', '20261115 11:00:00');

-- Récupération IDs réclamations
DECLARE @R1 INT, @R2 INT, @R3 INT, @R4 INT, @R5 INT, @R6 INT, @R7 INT, @R8 INT;

SELECT @R1 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient1 AND Sujet LIKE '%cartes vertes%';
SELECT @R2 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient1 AND Sujet LIKE '%franchise%';
SELECT @R3 = Id FROM dbo.ReclamationsIdt WHERE FK_User_Client = @UserClient1 AND Sujet LIKE '%adhérent santé%';
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
(@R2, @AdminId, '20260321 16:00:00', 'A', 'M. Manyani, le sinistre concerne la garantie Dommages Collision (franchise 2500 DH) et non la RC.'),
(@R2, @UserClient1, '20260322 09:30:00', 'C', 'Effectivement, veuillez nous excuser. Nous confirmons notre accord pour la prise en charge.'),

-- R3 - Ajout adhérent santé
(@R3, @UserClient1, '20260415 11:00:00', 'C', 'Demande d''ajout d''un nouvel adhérent à notre contrat santé groupe MAC. Formulaire en PJ.'),
(@R3, @CommercialId, '20260416 09:30:00', 'A', 'Votre demande a été transmise au service adhésion. Traitement sous 72h.'),

-- R4 - Ajout véhicule OCP
(@R4, @UserClient2, '20260515 11:20:00', 'C', 'Demande d''ajout d''un Toyota Hilux à notre flotte OCP. Devis concessionnaire en pièce jointe.'),
(@R4, @CommercialId, '20260516 09:45:00', 'A', 'Mme Bennani, votre demande est enregistrée. Délai de traitement 5 jours ouvrés pour avenant.'),

-- R5 - Suivi remboursement Mehdi
(@R5, @UserAdherent1, '20260520 14:30:00', 'C', 'Salam, mon dossier 55011 du 12 mai est toujours en attente de paiement. Délai dépassé.'),
(@R5, @AdminId, '20260521 10:15:00', 'A', 'Salam M. Ziani, virement de 2450 DH effectué ce jour. Délai réception 48-72h. Excuses pour le retard.'),
(@R5, @UserAdherent1, '20260521 11:00:00', 'C', 'Merci pour votre réactivité. Bonne continuation.'),

-- R6 - Erreur calcul remboursement
(@R6, @UserAdherent1, '20260325 10:00:00', 'C', 'Erreur sur remboursement consultation : payé 400 DH, remboursé 280 DH au lieu de 320 DH (80%).'),
(@R6, @AdminId, '20260325 15:30:00', 'A', 'Nous vérifions votre dossier. Le service comptable analyse l''écart de 40 DH.'),
(@R6, @AdminId, '20260326 09:45:00', 'A', 'Erreur confirmée. Complément de 40 DH viré sous 48h. Toutes nos excuses.'),

-- R7 - Carte tiers payant RAM
(@R7, @UserAdherent2, '20260701 08:30:00', 'C', 'Bonjour, je n''ai pas reçu ma carte tiers payant RAM 2026. Délai de 15 jours dépassé.'),
(@R7, @AdminId, '20260701 16:00:00', 'A', 'Bonjour Mme Mansouri, votre carte est disponible en agence RAM aéroport. Possibilité envoi postal.'),
(@R7, @UserAdherent2, '20260702 09:00:00', 'C', 'Merci, je passerai la récupérer en agence cette semaine.'),

-- R8 - Délai échographie
(@R8, @UserAdherent2, '20261115 11:00:00', 'C', 'Mon dossier échographie du 12 novembre n''est toujours pas traité. Délai anormal.'),
(@R8, @AdminId, '20261117 14:00:00', 'A', 'Mme Mansouri, le dossier nécessite une validation médicale complémentaire. Délai supplémentaire 48h.');
GO