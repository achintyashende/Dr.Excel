-- ============================================================
-- V2: Seed Data Matching Official Excel Workbook
-- ============================================================

-- Insert SENIOR user (password: Admin@123)
-- Hash generated with BCrypt: Admin@123
INSERT INTO users (username, password_hash, role, active) VALUES
('kh.bhatkar', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SENIOR', TRUE);

-- Insert DOCTOR user (password: Doctor@123)
-- Hash generated with BCrypt: Doctor@123
INSERT INTO users (username, password_hash, role, active) VALUES
('kiran.chavan', '$2a$10$dXJ3SW6G7P50lGEWvaKVaOHGZ9dGfvpXVFDcghGQ4bOxB1TlOaxHm', 'DOCTOR', TRUE);

-- Insert all 25 doctors matching the exact order and names in the Excel file
-- user_id references: kh.bhatkar = 1, kiran.chavan = 2
INSERT INTO doctors (user_id, name, working_station, block, facility_type, is_vacant, deputed_to, display_order) VALUES
(2,    'KIRAN CHAVAN',                  'R.H DHAMNGAON RAILWAY',        'DHAMGAON RLY',   'R.H',  FALSE, NULL, 1),
(NULL, 'KAMINI KHADSE',                'R.H CHANDUR RAILWAY',          'CHANDUR RLY',    'R.H',  FALSE, NULL, 2),
(NULL, 'MILIND SURYAWANSHI',           'R.H NANDGAON KHANDESHWAR',     'NANDGAON KH',    'RH',   FALSE, NULL, 3),
(NULL, 'VANITA GOURKHEDE',             'SDH DARYAPUR',                 'DARYAPUR',       'SDH',  FALSE, NULL, 4),
(NULL, 'VACANT BUT KAMINI KHADSE DEPUTED','R.H.TIOSA',                 'TIOSA',          'R.H',  TRUE,  'KAMINI KHADSE', 5),
(NULL, 'ARTI CAHVHAN',                 'R.H.ANJANGAON SURJI',          'ANJANGAON SURJI','R.H',  FALSE, NULL, 6),
(NULL, 'VACANT',                       'PHC LONI WARUD',               'WARUD',          'PHC',  TRUE,  NULL, 7),
(NULL, 'W.A.GANORKAR',                 'R.H.CHANDUR BAZAR',            'CHANDUR BZ.',    'R.H',  FALSE, NULL, 8),
(NULL, 'VACANT',                       'R.H.WARUD',                    'WARUD',          'R.H',  TRUE,  NULL, 9),
(1,    'K.H.BHATKAR',                  'PHC KURHA',                    'TIOSA',          'PHC',  FALSE, NULL, 10),
(NULL, 'P.M.YAWLE',                    'R.H.BHATKULI',                 'BHATKULI',       'R.H',  FALSE, NULL, 11),
(NULL, 'SUMIT MANOHARE',               'PHC WALGAON',                  'AMRAVATI',       'PHC',  FALSE, NULL, 12),
(NULL, 'RAMBHAU TAYDE',                'PHC YEODA',                    'DARYAPUR',       'PHC',  FALSE, NULL, 13),
(NULL, 'VACANT',                       'DWH AMRAVATI',                 'AMRAVATI',       'DWH',  TRUE,  NULL, 14),
(NULL, 'AMIT SHINDE (Contractual)',    'DH AMRAVATI',                  'AMRAVATI',       'DH',   FALSE, NULL, 15),
(NULL, 'NITIN KALAMKAR',               'DH AMRAVATI',                  'AMRAVATI',       'DH',   FALSE, NULL, 16),
(NULL, 'ZOHEF RAJA',                   'PHC DHAMANGAON GADHI',         'ACHALPUR',       'PHC',  FALSE, NULL, 17),
(NULL, 'VIVEK SONTAKKE',               'SDH DHARNI',                   'DHARNI',         'SDH',  FALSE, NULL, 18),
(NULL, 'PRIYANKA CHALAK',              'PHC BIJUDHAWADI',              'DHARNI',         'PHC',  FALSE, NULL, 19),
(NULL, 'RUSHIKESH OZA',                'RH CHIKHALDARA',               'CHIKHALDARA',    'RH',   FALSE, NULL, 20),
(NULL, 'EJAZ SHAHA',                   'RH CHURNI',                    'CHIKHALDARA',    'RH',   FALSE, NULL, 21),
(NULL, 'SHARAYU GONDANE',              'PHC SEMADOH',                  'CHIKHALDARA',    'PHC',  FALSE, NULL, 22),
(NULL, 'SUVARNA LANDGE (Contractual)', 'SDH ACHALPUR',                 'ACHALPUR',       'SDH',  FALSE, NULL, 23),
(NULL, 'VACANT',                       'SDH MORSHI',                   'MORSHI',         'SDH',  TRUE,  NULL, 24),
(NULL, 'VEDANT GONDIK',                'PHC KARAJGAON',                'CHANDUR BZ.',    'PHC',  FALSE, NULL, 25);

-- Create reporting period for April 2026
INSERT INTO reporting_periods (month, year, status, open_date) VALUES
(4, 2026, 'OPEN', '2026-04-01');

-- Seed initial Cataract Targets (from Sheet 7)
INSERT INTO cataract_targets (doctor_id, year_start, target_count) VALUES
(1, 2026, 181),
(2, 2026, 163),
(3, 2026, 335),
(4, 2026, 238),
(5, 2026, 25),
(6, 2026, 393),
(7, 2026, 0),
(8, 2026, 211),
(9, 2026, 0),
(10, 2026, 187),
(11, 2026, 249),
(12, 2026, 305),
(13, 2026, 147),
(17, 2026, 215),
(18, 2026, 152),
(19, 2026, 339),
(20, 2026, 109);
