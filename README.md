# Dr.Excel — Monthly Doctor Reporting & Management System

Dr.Excel is a production-grade web application that replaces shared Excel workbooks with a secure, role-restricted clinical reporting system. It preserves the exact 7-worksheet reporting format and official Excel calculations while ensuring:

1. **Role-based isolation**: Doctors can only view and edit their own row and their own patients.
2. **Monthly locking lifecycle**: Doctors submit their monthly report, which permanently locks their entries.
3. **Senior Doctor Supervision**: Senior Doctor K.H. Bhatkar has full supervisory access, dashboard KPI metrics, and reopening controls with mandatory audit trails.
4. **Original Template Excel Export**: One-click download of the complete 7-sheet master workbook populated directly from database records.

---

## 🏥 Clinical Reporting Modules (The 7 Excel Sheets)

| # | Sheet Name | Scope | Description |
|---|---|---|---|
| 1 | **40+ Patients** | Doctor entry | Examination counts, presbyopia cases, and spectacle distributions (Male/Female/Total) |
| 2 | **OPD Report** | Doctor entry | Out-patient department counts, cataract surgeries, waiting list, school screening, diabetic retinopathy, glaucoma, squint, ROP |
| 3 | **School Report** | Doctor entry | Schools examined, students screened, refractions (Monthly and Progressive) |
| 4 | **C-Extension** | Doctor entry | Visual acuity outcomes (Pre-correction, Post-correction, Conventional) |
| 5 | **Students Refraction** | Restricted | Student registry with Right Eye & Left Eye spectacle prescriptions (SPH, CYL, AXIS, VA) |
| 6 | **Camp Programme** | Senior-managed | 31-day eye camp schedule (Weekday, Hospital, Admission Date, Surgery Date, Location) |
| 7 | **Achievement** | Auto-calculated | Annual cataract surgery targets vs actual performance (`ACHIEVEMENT * 100 / TARGET`) |

---

## 🛠️ Technology Stack

- **Backend**: Java 21, Spring Boot 3.4.1, Spring Security, Spring Data JPA, JWT (io.jsonwebtoken 0.12.6), Apache POI 5.3.0, Flyway / H2 / PostgreSQL
- **Frontend**: React 18, Vite 6, Tailwind CSS 4, React Router 6, Axios, Lucide React
- **Architecture**: REST API + JWT Stateless Authentication + Database Audit Logging

---

## 🚀 Quick Start Guide

### 1. Start the Backend (Spring Boot)

Run with the `local` profile (in-memory H2 database pre-seeded with all 25 doctors and sample accounts):

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The backend server runs on `http://localhost:8080`.
H2 Web Console is accessible at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:drexcel`).

To run against your local PostgreSQL:
```bash
mvn spring-boot:run
```

---

### 2. Start the Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

The frontend application runs on `http://localhost:5173`.

---

## 🔑 Pre-seeded Login Credentials

| Role | Username | Password | Identity | Access Level |
|---|---|---|---|---|
| **Senior Doctor** | `kh.bhatkar` | `Admin@123` | Dr. K.H. Bhatkar (PHC Kurha) | Full supervisory dashboard, inspect all 25 doctors, manage camps, set cataract targets, reopen reports, download master Excel export, manage users |
| **Doctor** | `kiran.chavan` | `Doctor@123` | Dr. Kiran Chavan (R.H. Dhamangaon Rly) | Fill own monthly 5-sheet report, save draft, submit & lock, view personal submission history |

*(New doctor accounts can be provisioned by the Senior Doctor directly from the User Management screen.)*

---

## 📊 Security & Access Control Matrix

- **Doctor isolation**: Backend filters every query and enforces ownership (`report.doctor.id == authenticatedDoctor.id`).
- **Immutable locking**: Once submitted (`status = 'SUBMITTED'`), backend rejects any PUT/POST/DELETE attempts with HTTP 400 (`IllegalStateException: This monthly report is locked`).
- **Master Excel Download**: Protected by `@PreAuthorize("hasRole('SENIOR')")` — only Senior Doctor K.H. Bhatkar can trigger workbook export.
