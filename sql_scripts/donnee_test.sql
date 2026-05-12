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

-- 1. UTILISATEURS
-- Nature: 'A' = Admin, 'C' = Client/Adherent
SET IDENTITY_INSERT dbo.sysUser ON;
INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (1, '8bbe0f44-ec3a-450a-b07a-1b93f345f2ed', 'Badr Admin', '0600000001', 'admin@ibs.ma', 'A', 'O', 'O', GETDATE());

INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (2, '', 'Responsable ABC SARL', '0522000001', 'contact@abc.ma', 'C', 'O', 'N', GETDATE());

INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (3, '', 'Mohamed Alaoui', '0611223344', 'm.alaoui@gmail.com', 'C', 'O', 'O', GETDATE());

INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (4, 'f2c406a0-ad06-4388-b215-34ac3e5ec35a', 'Fatima Zahra', '0677889955', 'fatima.zahra@example.com', 'C', 'N', 'O', GETDATE());

INSERT INTO dbo.sysUser (Id, Id_Auth, Nom, Telephone, Email, Nature, Extranet, Mobile, CreatedAt) 
VALUES (5, '', 'Yassine Combiné', '0655443322', 'yassine@test.com', 'C', 'O', 'O', GETDATE());
SET IDENTITY_INSERT dbo.sysUser OFF;

-- 2. RÔLES (Optionnel mais utile pour le front)
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (1, 'admin');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (2, 'client');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (3, 'client');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (4, 'adherent');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (5, 'client');
INSERT INTO dbo.Roles (FK_User_Id, Role) VALUES (5, 'adherent');

-- 3. COMPAGNIES
SET IDENTITY_INSERT dbo.Compagnies ON;
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (1, 'Wafa Assurance', GETDATE());
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (2, 'Atlanta Assurance', GETDATE());
INSERT INTO dbo.Compagnies (Id, RaisonSociale, CreatedAt) VALUES (3, 'AXA Assurance Maroc', GETDATE());
SET IDENTITY_INSERT dbo.Compagnies OFF;

-- 4. CLIENTS (Entités IBS)
INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (100, NULL, 'ABC SARL', 'N', 'contact@abc.ma', 'Casablanca, Sidi Maarouf', '0522123456', GETDATE());

INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (102, NULL, 'Mohamed Alaoui', 'O', 'm.alaoui@gmail.com', 'Marrakech, Gueliz', '0611223344', GETDATE());

INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (103, NULL, 'Fatima Zahra', 'O', 'fatima.zahra@example.com', 'Fès, Ville Nouvelle', '0677889955', GETDATE());

INSERT INTO dbo.Clients (Id, Fk_Client_Id, RaisonSociale, Particulier, Email, Adresse, Telephone, CreatedAt) 
VALUES (105, NULL, 'Yassine Combiné', 'O', 'yassine@test.com', 'Rabat, Agdal', '0655443322', GETDATE());

-- Liaison Utilisateurs <-> Clients (Droit de voir le client et ses polices)
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (2, 100, 'O', GETDATE());
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (3, 102, 'O', GETDATE());
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (4, 103, 'O', GETDATE());
INSERT INTO dbo.UsersXClients (FK_User_Id, FK_Client_Id, Actif, CreatedAt) VALUES (5, 105, 'O', GETDATE());

-- 5. POLICES (CONTRATS)
-- Statuts : E=En cours, S=Suspendu, R=Résilié, M=Mise en demeure
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1000, 100, 1, 'Automobile', 'POL-AUTO-ABC-001', '20270101', 'E', 'Véhicules', '20260101', GETDATE());

INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1001, 100, 2, 'Incendie', 'POL-INC-ABC-002', '20260601', 'S', 'Professionnel', '20250601', GETDATE());

INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1002, 102, 3, 'Santé', 'POL-SANTE-ALAOUI', '20270101', 'E', 'Santé', '20260101', GETDATE());

INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1003, 103, 1, 'Automobile', 'POL-AUTO-FATIMA', '20261231', 'M', 'Véhicules', '20260101', GETDATE());

-- Police Individuelle pour Yassine (Client Particulier)
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1005, 105, 2, 'Automobile', 'POL-AUTO-YASSINE', '20270501', 'E', 'Véhicules', '20260501', GETDATE());

-- Police Santé Entreprise (où Yassine est adhérent)
INSERT INTO dbo.Polices (Id, Fk_Client_Id, FK_Compagnie_Id, Branche, Police, DateEcheance, Statut, Module, DateEffet, CreatedAt) 
VALUES (1006, 100, 3, 'Santé', 'POL-SANTE-GROUPE-ABC', '20271231', 'E', 'Santé', '20260101', GETDATE());

-- 6. ADHÉRENTS
-- Mohamed Alaoui est adhérent de sa propre police santé
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, Actif, CreatedAt) 
VALUES (500, 1002, 3, 'Mohamed Alaoui', 'm.alaoui@gmail.com', 'ADH-ALAOUI-01', 'MAT-123', '19800510', 'O', GETDATE());

-- Fatima Zahra est adhérente via une police
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, Actif, CreatedAt) 
VALUES (501, 1003, 4, 'Fatima Zahra', 'fatima.zahra@example.com', 'ADH-FATIMA-02', 'MAT-456', '19850320', 'O', GETDATE());

-- Yassine est adhérent de la police santé de son entreprise (ABC SARL)
INSERT INTO dbo.Adherents (Id, FK_Police_Id, FK_User_Id, NomComplet, Email, NumAdhesion, Matricule, DateNaissance, Actif, CreatedAt) 
VALUES (505, 1006, 5, 'Yassine Combiné', 'yassine@test.com', 'ADH-YASSINE-05', 'MAT-YAS99', '19920815', 'O', GETDATE());

-- Personnes à charge
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (800, 500, 'Salma Alaoui', 'Epouse', '19820412', '20260101', GETDATE());
INSERT INTO dbo.PersACharge (Id, FK_Adherent_Id, Nom, Lien, DateNaissance, DateAdhesion, CreatedAt) 
VALUES (801, 500, 'Youssef Alaoui', 'Fils', '20100815', '20260101', GETDATE());

-- 7. RISQUES (Objets assurés)
SET IDENTITY_INSERT dbo.Risques ON;
INSERT INTO dbo.Risques (Id, FK_Police_Id, Libelle, Identifiant, Description, DateDu, DateEcheance, Statut, NumeroIBS, CreatedAt) 
VALUES (200, 1000, 'Renault Clio V', '1234-A-10', 'Véhicule de fonction direction', '20260101', '20270101', 'E', 'IBS-V-001', GETDATE());

INSERT INTO dbo.Risques (Id, FK_Police_Id, Libelle, Identifiant, Description, DateDu, DateEcheance, Statut, NumeroIBS, CreatedAt) 
VALUES (201, 1003, 'Hyundai i10', '5678-B-15', 'Véhicule personnel Fatima', '20260101', '20261231', 'E', 'IBS-V-002', GETDATE());

INSERT INTO dbo.Risques (Id, FK_Police_Id, Libelle, Identifiant, Description, DateDu, DateEcheance, Statut, NumeroIBS, CreatedAt) 
VALUES (205, 1005, 'BMW Série 1', '9999-X-20', 'Véhicule personnel Yassine', '20260501', '20270501', 'E', 'IBS-V-005', GETDATE());
SET IDENTITY_INSERT dbo.Risques OFF;

-- 8. GARANTIES
SET IDENTITY_INSERT dbo.Garanties ON;
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (300, 200, 'Responsabilité Civile', 1000000.0, 0, GETDATE());
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (301, 200, 'Dommages Collision', 50000.0, 2500.0, GETDATE());
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (302, 201, 'Responsabilité Civile', 500000.0, 0, GETDATE());
INSERT INTO dbo.Garanties (Id, FK_Risque_Id, Libelle, Capital, Franchise, CreatedAt) VALUES (305, 205, 'Tous Risques', 300000.0, 5000.0, GETDATE());
SET IDENTITY_INSERT dbo.Garanties OFF;

-- 9. SINISTRES
-- Statuts : E=En cours, C=Clôturé, R=Réouvert
INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (400, 200, 1000, NULL, 'SIN-2026-001', '20260215', '20260216', 'E', '20260216', 15000.0, 'Choc avant sur parking', GETDATE());

INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Indemnite, Observations, CreatedAt) 
VALUES (401, 201, 1003, 501, 'SIN-2026-002', '20260110', '20260111', 'C', '20260125', 4500.0, 'Bris de glace Fatima', GETDATE());

INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (402, NULL, 1002, 500, 'SIN-SANTE-ALAOUI', '20260301', '20260305', 'R', '20260310', 1200.0, 'Soins dentaires Mohamed', GETDATE());

INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Dommages, Observations, CreatedAt) 
VALUES (405, 205, 1005, NULL, 'SIN-AUTO-YASSINE', '20260601', '20260602', 'E', '20260602', 8000.0, 'Accrochage Yassine', GETDATE());

INSERT INTO dbo.Sinistres (Id, FK_Risque_Id, FK_Police_Id, FK_Adherent_Id, NumeroSin, DateSin, DateDeclaration, Statut, DateStatut, MT_Indemnite, Observations, CreatedAt) 
VALUES (406, NULL, 1006, 505, 'SIN-SANTE-YASSINE', '20260415', '20260420', 'C', '20260501', 350.0, 'Consultation Yassine (Adherent)', GETDATE());


-- 10. QUITTANCES
-- Statuts : E=En cours (Impayée), S=Suspendue, R=Réglée, M=Mise en demeure, A=Annulée
INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (600, 1000, 'QUIT-AUTO-ABC-01', '20260101', '20261231', 4500.0, 0.0, '20260115', 'R', GETDATE());

INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (601, 1003, 'QUIT-FATIMA-01', '20260101', '20261231', 3200.0, 3200.0, '20260215', 'E', GETDATE());

INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (602, 1001, 'QUIT-SUSP-ABC', '20250601', '20260531', 1500.0, 1500.0, '20250701', 'S', GETDATE());

INSERT INTO dbo.Quittances (Id, FK_Police_Id, NumQuittance, DateDu, DateAu, Montant, Solde, DateEcheance, Statut, CreatedAt) 
VALUES (605, 1005, 'QUIT-YASSINE-01', '20260501', '20270430', 5000.0, 0.0, '20260515', 'R', GETDATE());

-- 11. RÉCLAMATIONS
SET IDENTITY_INSERT dbo.ReclamationsIdt ON;
INSERT INTO dbo.ReclamationsIdt (Id, FK_User_Client, DateReclamation, Sujet, Statut, Nature, CreatedAt) 
VALUES (700, 2, '20260301 10:00:00', 'Contrat ABC non visible', 'C', 'D', GETDATE());

INSERT INTO dbo.ReclamationsIdt (Id, FK_User_Client, DateReclamation, Sujet, Statut, Nature, CreatedAt) 
VALUES (701, 3, '20260310 14:00:00', 'Remboursement Soins Mohamed', 'E', 'R', GETDATE());

INSERT INTO dbo.ReclamationsIdt (Id, FK_User_Client, DateReclamation, Sujet, Statut, Nature, CreatedAt) 
VALUES (705, 5, '20260515 11:00:00', 'Question sur ma police Auto', 'E', 'D', GETDATE());
SET IDENTITY_INSERT dbo.ReclamationsIdt OFF;

SET IDENTITY_INSERT dbo.ReclamationsDet ON;
INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (800, 700, 2, '20260301 10:00:00', 'C', 'Je ne vois pas mon nouveau contrat.');

INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (801, 700, 1, '20260302 09:00:00', 'A', 'Bonjour, il sera visible après validation demain.');

INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (802, 701, 3, '20260310 14:00:00', 'C', 'Le dossier SIN-SANTE-ALAOUI est toujours en attente.');

INSERT INTO dbo.ReclamationsDet (Id, FK_Reclamation_Id, FK_User_Id, DateMessage, Nature, Message) 
VALUES (805, 705, 5, '20260515 11:00:00', 'C', 'Bonjour, est-ce que ma BMW est bien assurée tous risques ?');
SET IDENTITY_INSERT dbo.ReclamationsDet OFF;
GO

GO