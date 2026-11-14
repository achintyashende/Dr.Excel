-- ============================================================
-- V1: Initial Schema for Dr.Excel - Doctor Monthly Reporting
-- ============================================================

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('DOCTOR', 'SENIOR')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    working_station VARCHAR(150) NOT NULL,
    block VARCHAR(100),
    facility_type VARCHAR(20),
    is_vacant BOOLEAN DEFAULT FALSE,
    deputed_to VARCHAR(100),
    display_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reporting periods
CREATE TABLE reporting_periods (
    id BIGSERIAL PRIMARY KEY,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    open_date DATE,
    close_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month, year)
);

-- Monthly reports (one per doctor per period)
CREATE TABLE monthly_reports (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id),
    period_id BIGINT NOT NULL REFERENCES reporting_periods(id),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED')),
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, period_id)
);

-- Sheet 1: 40+ Patients
CREATE TABLE patient_40plus_data (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL UNIQUE REFERENCES monthly_reports(id),
    examined_male INT DEFAULT 0,
    examined_female INT DEFAULT 0,
    presbyopia_male INT DEFAULT 0,
    presbyopia_female INT DEFAULT 0,
    free_spectacles_male INT DEFAULT 0,
    free_spectacles_female INT DEFAULT 0
);

-- Sheet 2: OPD Report
CREATE TABLE opd_data (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL UNIQUE REFERENCES monthly_reports(id),
    opd_patients_examined INT DEFAULT 0,
    refractive_error INT DEFAULT 0,
    cataract_found INT DEFAULT 0,
    cataract_surgery INT DEFAULT 0,
    cataract_waiting INT DEFAULT 0,
    students_examined INT DEFAULT 0,
    students_with_re INT DEFAULT 0,
    free_spectacles_provided INT DEFAULT 0,
    diabetic_retinopathy INT DEFAULT 0,
    glaucoma INT DEFAULT 0,
    squint INT DEFAULT 0,
    rop INT DEFAULT 0
);

-- Sheet 3: School Report
CREATE TABLE school_data (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL UNIQUE REFERENCES monthly_reports(id),
    schools_examined_month INT DEFAULT 0,
    students_male_month INT DEFAULT 0,
    students_female_month INT DEFAULT 0,
    refraction_male_month INT DEFAULT 0,
    refraction_female_month INT DEFAULT 0
);

-- Sheet 4: C-Extension
CREATE TABLE extension_data (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL UNIQUE REFERENCES monthly_reports(id),
    pre_va_lt_6_36 INT DEFAULT 0,
    pre_va_6_24_to_6_36 INT DEFAULT 0,
    pre_va_6_12_to_6_24 INT DEFAULT 0,
    pre_va_6_6_to_6_12 INT DEFAULT 0,
    post_va_lt_6_36 INT DEFAULT 0,
    post_va_6_24_to_6_36 INT DEFAULT 0,
    post_va_6_12_to_6_24 INT DEFAULT 0,
    post_va_6_6_to_6_12 INT DEFAULT 0,
    conv_va_lt_6_36 INT DEFAULT 0,
    conv_va_6_24_to_6_36 INT DEFAULT 0,
    conv_va_6_12_to_6_24 INT DEFAULT 0,
    conv_va_6_6_to_6_12 INT DEFAULT 0
);

-- Sheet 5: Students Refraction (individual records)
CREATE TABLE student_refraction_records (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES monthly_reports(id),
    academic_year VARCHAR(20),
    record_month DATE,
    headquarters VARCHAR(100),
    block VARCHAR(100),
    student_name VARCHAR(150) NOT NULL,
    student_class VARCHAR(20),
    age INT,
    gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
    school_name VARCHAR(200),
    guardian_contact VARCHAR(50),
    right_sph VARCHAR(20),
    right_cyl VARCHAR(20),
    right_axis VARCHAR(20),
    right_va VARCHAR(20),
    left_sph VARCHAR(20),
    left_cyl VARCHAR(20),
    left_axis VARCHAR(20),
    left_va VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sheet 6: Camp Programme
CREATE TABLE camp_entries (
    id BIGSERIAL PRIMARY KEY,
    period_id BIGINT NOT NULL REFERENCES reporting_periods(id),
    day_number INT NOT NULL,
    weekday VARCHAR(15),
    hospital_name VARCHAR(200),
    admission_date DATE,
    surgery_date DATE,
    surgery_location VARCHAR(200),
    UNIQUE(period_id, day_number)
);

-- Sheet 7: Cataract Targets (annual)
CREATE TABLE cataract_targets (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id),
    year_start INT NOT NULL,
    target_count INT DEFAULT 0,
    UNIQUE(doctor_id, year_start)
);

-- Audit logs
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_monthly_reports_doctor ON monthly_reports(doctor_id);
CREATE INDEX idx_monthly_reports_period ON monthly_reports(period_id);
CREATE INDEX idx_student_refraction_report ON student_refraction_records(report_id);
CREATE INDEX idx_camp_entries_period ON camp_entries(period_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
