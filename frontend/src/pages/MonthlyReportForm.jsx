import { useState, useEffect } from 'react'
import {
  getMyReport,
  savePatient40Plus,
  saveOpd,
  saveSchool,
  saveExtension,
  addStudentRecord,
  updateStudentRecord,
  deleteStudentRecord,
  submitReport,
} from '../services/api'
import NumberInput from '../components/NumberInput'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import {
  Save,
  Send,
  Plus,
  Trash2,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const TABS = [
  '1) 40+ Patients',
  '2) OPD Report',
  '3) School Report',
  '4) C-Extension',
  '5) Students Refraction',
  '6) Review & Final Submit',
]

export default function MonthlyReportForm() {
  const [month, setMonth] = useState(4)
  const [year, setYear] = useState(2026)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [validationErrorModalOpen, setValidationErrorModalOpen] = useState(false)

  // Report State
  const [reportData, setReportData] = useState(null)
  const [patient40, setPatient40] = useState({
    examinedMale: 0,
    examinedFemale: 0,
    presbyopiaMale: 0,
    presbyopiaFemale: 0,
    freeSpectaclesMale: 0,
    freeSpectaclesFemale: 0,
  })

  const [opd, setOpd] = useState({
    opdPatientsExamined: 0,
    refractiveError: 0,
    cataractFound: 0,
    cataractSurgery: 0,
    cataractWaiting: 0,
    studentsExamined: 0,
    studentsWithRe: 0,
    freeSpectaclesProvided: 0,
    diabeticRetinopathy: 0,
    glaucoma: 0,
    squint: 0,
    rop: 0,
  })

  const [school, setSchool] = useState({
    schoolsExaminedMonth: 0,
    studentsMaleMonth: 0,
    studentsFemaleMonth: 0,
    refractionMaleMonth: 0,
    refractionFemaleMonth: 0,
  })

  const [extension, setExtension] = useState({
    preVaLt636: 0,
    preVa624To636: 0,
    preVa612To624: 0,
    preVa66To612: 0,
    postVaLt636: 0,
    postVa624To636: 0,
    postVa612To624: 0,
    postVa66To612: 0,
    convVaLt636: 0,
    convVa624To636: 0,
    convVa612To624: 0,
    convVa66To612: 0,
  })

  const [students, setStudents] = useState([])
  const [newStudent, setNewStudent] = useState({
    studentName: '',
    studentClass: '',
    age: '',
    gender: 'M',
    schoolName: '',
    guardianContact: '',
    rightSph: '0.0',
    rightCyl: '0.0',
    rightAxis: '0',
    rightVa: '6/6',
    leftSph: '0.0',
    leftCyl: '0.0',
    leftAxis: '0',
    leftVa: '6/6',
  })

  const isLocked = reportData?.status === 'SUBMITTED'

  useEffect(() => {
    loadReport()
  }, [month, year])

  const loadReport = async () => {
    try {
      setLoading(true)
      const res = await getMyReport(month, year)
      const rep = res.data
      setReportData(rep)
      if (rep.patient40Plus) setPatient40(rep.patient40Plus)
      if (rep.opd) setOpd(rep.opd)
      if (rep.school) setSchool(rep.school)
      if (rep.extension) setExtension(rep.extension)
      if (rep.studentRecords) setStudents(rep.studentRecords)
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to load report for selected period' })
    } finally {
      setLoading(false)
    }
  }

  // Calculations & Totals
  const patient40ExaminedTotal = (Number(patient40.examinedMale) || 0) + (Number(patient40.examinedFemale) || 0)
  const patient40PresbyopiaTotal = (Number(patient40.presbyopiaMale) || 0) + (Number(patient40.presbyopiaFemale) || 0)
  const patient40SpectaclesTotal = (Number(patient40.freeSpectaclesMale) || 0) + (Number(patient40.freeSpectaclesFemale) || 0)

  // Cross-Sheet Metrics for OPD (Sheet 2), School Report (Sheet 3), and Students Refraction (Sheet 5)
  const opdStudentsExamined = Number(opd.studentsExamined) || 0
  const opdStudentsWithRe = Number(opd.studentsWithRe) || 0

  const schoolStudentsMale = Number(school.studentsMaleMonth) || 0
  const schoolStudentsFemale = Number(school.studentsFemaleMonth) || 0
  const schoolStudentsTotal = schoolStudentsMale + schoolStudentsFemale

  const schoolRefractionMale = Number(school.refractionMaleMonth) || 0
  const schoolRefractionFemale = Number(school.refractionFemaleMonth) || 0
  const schoolRefractionTotal = schoolRefractionMale + schoolRefractionFemale

  const studentRecordsCount = students.length

  // Validation Rules:
  // 1. OPD Students Examined must equal School Report Total Students Examined (Male + Female)
  const isStudentsExaminedMatch = opdStudentsExamined === schoolStudentsTotal

  // 2. OPD Students with RE must equal School Report Total Refraction (Male + Female)
  const isStudentsWithReMatch = opdStudentsWithRe === schoolRefractionTotal

  // 3. Tab 5 Students Refraction total records must equal Students Examined
  const isTab5RecordsMatch = studentRecordsCount === opdStudentsExamined

  const hasValidationErrors = !isStudentsExaminedMatch || !isStudentsWithReMatch || !isTab5RecordsMatch

  const saveCurrentTab = async () => {
    if (isLocked) return
    const periodId = reportData?.reportId || 1
    if (activeTab === 0) {
      await savePatient40Plus(periodId, patient40)
    } else if (activeTab === 1) {
      await saveOpd(periodId, opd)
    } else if (activeTab === 2) {
      await saveSchool(periodId, school)
    } else if (activeTab === 3) {
      await saveExtension(periodId, extension)
    }
  }

  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      await saveCurrentTab()
      setToast({ type: 'success', message: 'Draft saved successfully!' })
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save draft' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAndNext = async () => {
    // Validation check on Tab 3 (School Report):
    // Counts must match Tab 2 (OPD Report) to proceed to Tab 4
    if (activeTab === 2) {
      if (!isStudentsExaminedMatch) {
        setToast({
          type: 'error',
          message: `Students Examined count does not match! Tab 2 (OPD) is ${opdStudentsExamined}, but Tab 3 total is ${schoolStudentsTotal} (${schoolStudentsMale} Male + ${schoolStudentsFemale} Female). You cannot proceed until counts match.`,
        })
        try {
          setSaving(true)
          await saveCurrentTab()
        } catch (e) {} finally {
          setSaving(false)
        }
        return
      }

      if (!isStudentsWithReMatch) {
        setToast({
          type: 'error',
          message: `Students with RE count does not match! Tab 2 (OPD) is ${opdStudentsWithRe}, but Tab 3 refraction total is ${schoolRefractionTotal} (${schoolRefractionMale} Male + ${schoolRefractionFemale} Female). You cannot proceed until counts match.`,
        })
        try {
          setSaving(true)
          await saveCurrentTab()
        } catch (e) {} finally {
          setSaving(false)
        }
        return
      }
    }

    // Validation check on Tab 5 (Students Refraction):
    // Total student records must match Students Examined to proceed to final review
    if (activeTab === 4) {
      if (!isTab5RecordsMatch) {
        setToast({
          type: 'error',
          message: `Total student records added (${studentRecordsCount}) does not match Students Examined count (${opdStudentsExamined}). You cannot proceed until records match.`,
        })
        return
      }
    }

    try {
      setSaving(true)
      await saveCurrentTab()
      setToast({ type: 'success', message: 'Saved! Proceeding to next sheet...' })
      setActiveTab((prev) => Math.min(prev + 1, TABS.length - 1))
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save changes' })
    } finally {
      setSaving(false)
    }
  }

  const handleTabClick = (targetIdx) => {
    // Navigating back to earlier tabs is always allowed
    if (targetIdx <= activeTab) {
      setActiveTab(targetIdx)
      return
    }

    // If leaving Tab 3 or attempting to skip past Tab 3:
    if (activeTab === 2 || (activeTab < 2 && targetIdx > 2)) {
      if (!isStudentsExaminedMatch) {
        setToast({
          type: 'error',
          message: `Cannot proceed: Students Examined in Tab 3 (${schoolStudentsTotal}) does not match Tab 2 (${opdStudentsExamined}).`,
        })
        setActiveTab(2)
        return
      }
      if (!isStudentsWithReMatch) {
        setToast({
          type: 'error',
          message: `Cannot proceed: Refraction total in Tab 3 (${schoolRefractionTotal}) does not match Tab 2 (${opdStudentsWithRe}).`,
        })
        setActiveTab(2)
        return
      }
    }

    // If attempting to go to Tab 6 (Review & Final Submit):
    if (targetIdx === 5) {
      if (!isStudentsExaminedMatch || !isStudentsWithReMatch) {
        setToast({
          type: 'error',
          message: 'Cannot proceed: Counts between Tab 2 (OPD) and Tab 3 (School Report) must match.',
        })
        setActiveTab(2)
        return
      }
      if (!isTab5RecordsMatch) {
        setToast({
          type: 'error',
          message: `Cannot proceed: Sheet 5 has ${studentRecordsCount} record(s), but must have ${opdStudentsExamined} to match Students Examined.`,
        })
        setActiveTab(4)
        return
      }
    }

    setActiveTab(targetIdx)
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    if (!newStudent.studentName) return
    const periodId = reportData?.reportId || 1
    try {
      const res = await addStudentRecord(periodId, {
        ...newStudent,
        academicYear: `${year}-${String(year + 1).slice(-2)}`,
        recordMonth: `${year}-${String(month).padStart(2, '0')}-01`,
        headquarters: reportData?.workingStation || 'HQ',
        block: reportData?.workingStation || 'HQ',
        age: Number(newStudent.age) || null,
      })
      setStudents([...students, res.data])
      setNewStudent({
        studentName: '',
        studentClass: '',
        age: '',
        gender: 'M',
        schoolName: '',
        guardianContact: '',
        rightSph: '0.0',
        rightCyl: '0.0',
        rightAxis: '0',
        rightVa: '6/6',
        leftSph: '0.0',
        leftCyl: '0.0',
        leftAxis: '0',
        leftVa: '6/6',
      })
      setToast({ type: 'success', message: 'Student prescription record added!' })
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to add student record' })
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (isLocked) return
    const periodId = reportData?.reportId || 1
    try {
      await deleteStudentRecord(periodId, studentId)
      setStudents(students.filter((s) => s.id !== studentId))
      setToast({ type: 'success', message: 'Student record removed' })
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete student record' })
    }
  }

  // Check validation rules only when user attempts to submit
  const handleAttemptSubmit = () => {
    const errors = []

    if (opdStudentsExamined !== schoolStudentsTotal) {
      errors.push({
        title: 'Students Examined Mismatch',
        msg: `OPD Report (Sheet 2) has ${opdStudentsExamined}, but School Report (Sheet 3) has ${schoolStudentsTotal} (${schoolStudentsMale} Male + ${schoolStudentsFemale} Female). Both totals must be equal.`,
        tab: 1,
      })
    }

    if (opdStudentsWithRe !== schoolRefractionTotal) {
      errors.push({
        title: 'Students with RE Mismatch',
        msg: `OPD Report (Sheet 2) has ${opdStudentsWithRe}, but School Report (Sheet 3) has ${schoolRefractionTotal} (${schoolRefractionMale} Male + ${schoolRefractionFemale} Female). Both totals must be equal.`,
        tab: 1,
      })
    }

    if (studentRecordsCount !== opdStudentsExamined) {
      errors.push({
        title: 'Sheet 5 Student Records Mismatch',
        msg: `Sheet 5 (Students Refraction) currently has ${studentRecordsCount} student record(s), but Students Examined is ${opdStudentsExamined}. Total records in Sheet 5 must match Students Examined.`,
        tab: 4,
      })
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      setValidationErrorModalOpen(true)
      return
    }

    setConfirmSubmitOpen(true)
  }

  // Final Submit of entire month across all 5 sheets
  const handleSubmit = async () => {
    const periodId = reportData?.reportId || 1
    try {
      setSaving(true)
      // Save all active tabs first
      await Promise.all([
        savePatient40Plus(periodId, patient40),
        saveOpd(periodId, opd),
        saveSchool(periodId, school),
        saveExtension(periodId, extension),
      ])
      // Submit and lock
      await submitReport(periodId)
      setConfirmSubmitOpen(false)
      setToast({ type: 'success', message: 'Entire monthly report submitted and locked successfully!' })
      loadReport()
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit report'
      setToast({ type: 'error', message: errMsg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Monthly Doctor Report</h1>
          <p className="text-sm text-slate-500">
            {reportData?.doctorName} • {reportData?.workingStation}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none"
          >
            {MONTHS.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>

          <StatusBadge status={reportData?.status || 'DRAFT'} />
        </div>
      </div>

      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-900 text-sm shadow-xs">
          <Lock size={20} className="text-amber-600 shrink-0" />
          <span>
            This entire monthly report was submitted on{' '}
            <strong>
              {reportData.submittedAt ? new Date(reportData.submittedAt).toLocaleDateString() : 'earlier'}
            </strong>{' '}
            and is permanently locked. All 5 reporting categories are frozen. Contact Senior Doctor K.H. Bhatkar if any correction is needed.
          </span>
        </div>
      )}

      {/* Step Indicator Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        {TABS.map((tab, idx) => {
          const isReview = idx === 5
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`py-3 px-3.5 font-semibold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === idx
                  ? isReview
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                    : 'border-blue-600 text-blue-700 bg-blue-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {isReview && <Lock size={14} className="text-emerald-600" />}
              <span>{tab}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Body */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading form data...</div>
        ) : (
          <>
            {/* TAB 1: 40+ PATIENTS */}
            {activeTab === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    Sheet 1: 40+ Year Patients Presbyopic Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step 1 of 5 • Enter counts for 40+ examination, presbyopia cases, and spectacle distribution
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Examined */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">No. of Persons Examined (40+)</h4>
                    <NumberInput
                      label="Male"
                      value={patient40.examinedMale}
                      onChange={(v) => setPatient40({ ...patient40, examinedMale: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Female"
                      value={patient40.examinedFemale}
                      onChange={(v) => setPatient40({ ...patient40, examinedFemale: v })}
                      disabled={isLocked}
                    />
                    <div className="pt-2 border-t flex justify-between text-sm font-bold text-blue-600">
                      <span>Total Examined:</span>
                      <span>{patient40ExaminedTotal}</span>
                    </div>
                  </div>

                  {/* Presbyopia */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Persons with Presbyopia (40+)</h4>
                    <NumberInput
                      label="Male"
                      value={patient40.presbyopiaMale}
                      onChange={(v) => setPatient40({ ...patient40, presbyopiaMale: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Female"
                      value={patient40.presbyopiaFemale}
                      onChange={(v) => setPatient40({ ...patient40, presbyopiaFemale: v })}
                      disabled={isLocked}
                    />
                    <div className="pt-2 border-t flex justify-between text-sm font-bold text-blue-600">
                      <span>Total Presbyopia:</span>
                      <span>{patient40PresbyopiaTotal}</span>
                    </div>
                  </div>

                  {/* Free Spectacles */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Distribution of Free Spectacles</h4>
                    <NumberInput
                      label="Male"
                      value={patient40.freeSpectaclesMale}
                      onChange={(v) => setPatient40({ ...patient40, freeSpectaclesMale: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Female"
                      value={patient40.freeSpectaclesFemale}
                      onChange={(v) => setPatient40({ ...patient40, freeSpectaclesFemale: v })}
                      disabled={isLocked}
                    />
                    <div className="pt-2 border-t flex justify-between text-sm font-bold text-blue-600">
                      <span>Total Free Spectacles:</span>
                      <span>{patient40SpectaclesTotal}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OPD REPORT */}
            {activeTab === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    Sheet 2: Monitoring of Activities of Ophthalmic Officers (OPD)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step 2 of 5 • OPD examination, cataract surgeries, school screening, and other eye diseases
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* General OPD */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">OPD & Refractive Error</h4>
                    <NumberInput
                      label="OPD Patients Examined"
                      value={opd.opdPatientsExamined}
                      onChange={(v) => setOpd({ ...opd, opdPatientsExamined: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Refractive Error"
                      value={opd.refractiveError}
                      onChange={(v) => setOpd({ ...opd, refractiveError: v })}
                      disabled={isLocked}
                    />
                  </div>

                  {/* Cataract */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Cataract Metrics</h4>
                    <NumberInput
                      label="Found with Cataract"
                      value={opd.cataractFound}
                      onChange={(v) => setOpd({ ...opd, cataractFound: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Underwent Cataract Surgery"
                      value={opd.cataractSurgery}
                      onChange={(v) => setOpd({ ...opd, cataractSurgery: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Still on Waiting List"
                      value={opd.cataractWaiting}
                      onChange={(v) => setOpd({ ...opd, cataractWaiting: v })}
                      disabled={isLocked}
                    />
                  </div>

                  {/* School Screening */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">School Eye Screening</h4>
                    <NumberInput
                      label="Students Examined"
                      value={opd.studentsExamined}
                      onChange={(v) => setOpd({ ...opd, studentsExamined: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Students with RE"
                      value={opd.studentsWithRe}
                      onChange={(v) => setOpd({ ...opd, studentsWithRe: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Free Spectacles Provided"
                      value={opd.freeSpectaclesProvided}
                      onChange={(v) => setOpd({ ...opd, freeSpectaclesProvided: v })}
                      disabled={isLocked}
                    />
                  </div>
                </div>

                {/* Other Eye Diseases */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h4 className="font-semibold text-slate-700 text-sm mb-3">Other Eye Diseases</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <NumberInput
                      label="Diabetic Retinopathy"
                      value={opd.diabeticRetinopathy}
                      onChange={(v) => setOpd({ ...opd, diabeticRetinopathy: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Glaucoma"
                      value={opd.glaucoma}
                      onChange={(v) => setOpd({ ...opd, glaucoma: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Squint"
                      value={opd.squint}
                      onChange={(v) => setOpd({ ...opd, squint: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="ROP"
                      value={opd.rop}
                      onChange={(v) => setOpd({ ...opd, rop: v })}
                      disabled={isLocked}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SCHOOL REPORT */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    Sheet 3: School Eye Screening Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step 3 of 5 • Schools examined, students examined, and refractions during the month
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Schools Examined</h4>
                    <NumberInput
                      label="Schools Examined in Month"
                      value={school.schoolsExaminedMonth}
                      onChange={(v) => setSchool({ ...school, schoolsExaminedMonth: v })}
                      disabled={isLocked}
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Students Examined</h4>
                    <NumberInput
                      label="Male Students"
                      value={school.studentsMaleMonth}
                      onChange={(v) => setSchool({ ...school, studentsMaleMonth: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Female Students"
                      value={school.studentsFemaleMonth}
                      onChange={(v) => setSchool({ ...school, studentsFemaleMonth: v })}
                      disabled={isLocked}
                    />
                    <div className="pt-2 border-t flex justify-between text-sm font-bold text-blue-600">
                      <span>Total Students:</span>
                      <span>{schoolStudentsTotal}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Total Refraction</h4>
                    <NumberInput
                      label="Male Refraction"
                      value={school.refractionMaleMonth}
                      onChange={(v) => setSchool({ ...school, refractionMaleMonth: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="Female Refraction"
                      value={school.refractionFemaleMonth}
                      onChange={(v) => setSchool({ ...school, refractionFemaleMonth: v })}
                      disabled={isLocked}
                    />
                    <div className="pt-2 border-t flex justify-between text-sm font-bold text-blue-600">
                      <span>Total Refraction:</span>
                      <span>{schoolRefractionTotal}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: C-EXTENSION */}
            {activeTab === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    Sheet 4: C-Extension Visual Acuity Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step 4 of 5 • Pre-correction, post-correction, and conventional visual acuity outcomes
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pre-Correction */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Pre-Correction V/A IOL</h4>
                    <NumberInput
                      label="< 6/36"
                      value={extension.preVaLt636}
                      onChange={(v) => setExtension({ ...extension, preVaLt636: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="6/24 - 6/36"
                      value={extension.preVa624To636}
                      onChange={(v) => setExtension({ ...extension, preVa624To636: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="6/12 - 6/24"
                      value={extension.preVa612To624}
                      onChange={(v) => setExtension({ ...extension, preVa612To624: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="6/6 - 6/12"
                      value={extension.preVa66To612}
                      onChange={(v) => setExtension({ ...extension, preVa66To612: v })}
                      disabled={isLocked}
                    />
                  </div>

                  {/* Post-Correction */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Post-Correction V/A IOL</h4>
                    <NumberInput
                      label="< 6/36"
                      value={extension.postVaLt636}
                      onChange={(v) => setExtension({ ...extension, postVaLt636: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="6/24 - 6/36"
                      value={extension.postVa624To636}
                      onChange={(v) => setExtension({ ...extension, postVa624To636: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="6/12 - 6/24"
                      value={extension.postVa612To624}
                      onChange={(v) => setExtension({ ...extension, postVa612To624: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="6/6 - 6/12"
                      value={extension.postVa66To612}
                      onChange={(v) => setExtension({ ...extension, postVa66To612: v })}
                      disabled={isLocked}
                    />
                  </div>

                  {/* Conventional */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Conventional Post-Correction V/A</h4>
                    <NumberInput
                      label="< 6/36"
                      value={extension.convVaLt636}
                      onChange={(v) => setExtension({ ...extension, convVaLt636: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="6/24 - 6/36"
                      value={extension.convVa624To636}
                      onChange={(v) => setExtension({ ...extension, convVa624To636: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="6/12 - 6/24"
                      value={extension.convVa612To624}
                      onChange={(v) => setExtension({ ...extension, convVa612To624: v })}
                      disabled={isLocked}
                    />
                    <NumberInput
                      label="6/6 - 6/12"
                      value={extension.convVa66To612}
                      onChange={(e) => setExtension({ ...extension, convVa66To612: e })}
                      disabled={isLocked}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: STUDENTS REFRACTION */}
            {activeTab === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    Sheet 5: Students Refraction Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step 5 of 5 • Individual student spectacle prescriptions and examination records ({students.length} students registered)
                  </p>
                </div>

                {!isLocked && (
                  <form onSubmit={handleAddStudent} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
                    <h4 className="font-semibold text-slate-700 text-sm">Add New Student Prescription</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Student Full Name</label>
                        <input
                          type="text"
                          required
                          value={newStudent.studentName}
                          onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })}
                          placeholder="e.g. Bhagyashree Dahikar"
                          className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Class / Std</label>
                        <input
                          type="text"
                          value={newStudent.studentClass}
                          onChange={(e) => setNewStudent({ ...newStudent, studentClass: e.target.value })}
                          placeholder="e.g. 5th"
                          className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Age</label>
                        <input
                          type="number"
                          value={newStudent.age}
                          onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                          placeholder="e.g. 11"
                          className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                        <select
                          value={newStudent.gender}
                          onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        >
                          <option value="M">Male (M)</option>
                          <option value="F">Female (F)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">School / Anganwadi Name</label>
                        <input
                          type="text"
                          value={newStudent.schoolName}
                          onChange={(e) => setNewStudent({ ...newStudent, schoolName: e.target.value })}
                          placeholder="e.g. Z.P. School"
                          className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Guardian Contact</label>
                        <input
                          type="text"
                          value={newStudent.guardianContact}
                          onChange={(e) => setNewStudent({ ...newStudent, guardianContact: e.target.value })}
                          placeholder="Mobile number or village"
                          className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-white border rounded-lg space-y-2">
                        <span className="text-xs font-bold text-slate-700">Right Eye</span>
                        <div className="grid grid-cols-4 gap-2">
                          <input type="text" placeholder="SPH" value={newStudent.rightSph} onChange={(e) => setNewStudent({ ...newStudent, rightSph: e.target.value })} className="px-2 py-1 border rounded text-xs text-center" />
                          <input type="text" placeholder="CYL" value={newStudent.rightCyl} onChange={(e) => setNewStudent({ ...newStudent, rightCyl: e.target.value })} className="px-2 py-1 border rounded text-xs text-center" />
                          <input type="text" placeholder="AXIS" value={newStudent.rightAxis} onChange={(e) => setNewStudent({ ...newStudent, rightAxis: e.target.value })} className="px-2 py-1 border rounded text-xs text-center" />
                          <input type="text" placeholder="V/A" value={newStudent.rightVa} onChange={(e) => setNewStudent({ ...newStudent, rightVa: e.target.value })} className="px-2 py-1 border rounded text-xs text-center" />
                        </div>
                      </div>

                      <div className="p-3 bg-white border rounded-lg space-y-2">
                        <span className="text-xs font-bold text-slate-700">Left Eye</span>
                        <div className="grid grid-cols-4 gap-2">
                          <input type="text" placeholder="SPH" value={newStudent.leftSph} onChange={(e) => setNewStudent({ ...newStudent, leftSph: e.target.value })} className="px-2 py-1 border rounded text-xs text-center" />
                          <input type="text" placeholder="CYL" value={newStudent.leftCyl} onChange={(e) => setNewStudent({ ...newStudent, leftCyl: e.target.value })} className="px-2 py-1 border rounded text-xs text-center" />
                          <input type="text" placeholder="AXIS" value={newStudent.leftAxis} onChange={(e) => setNewStudent({ ...newStudent, leftAxis: e.target.value })} className="px-2 py-1 border rounded text-xs text-center" />
                          <input type="text" placeholder="V/A" value={newStudent.leftVa} onChange={(e) => setNewStudent({ ...newStudent, leftVa: e.target.value })} className="px-2 py-1 border rounded text-xs text-center" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-slate-900"
                      >
                        <Plus size={14} /> Add Record
                      </button>
                    </div>
                  </form>
                )}

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Student Name</th>
                        <th className="px-3 py-2">Class</th>
                        <th className="px-3 py-2">Age/Gen</th>
                        <th className="px-3 py-2">School</th>
                        <th className="px-3 py-2">Contact</th>
                        <th className="px-3 py-2">Right Eye (SPH/CYL/AXIS/VA)</th>
                        <th className="px-3 py-2">Left Eye (SPH/CYL/AXIS/VA)</th>
                        {!isLocked && <th className="px-3 py-2 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s, idx) => (
                        <tr key={s.id || idx} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-semibold text-slate-800">{s.studentName}</td>
                          <td className="px-3 py-2.5">{s.studentClass}</td>
                          <td className="px-3 py-2.5">{s.age} / {s.gender}</td>
                          <td className="px-3 py-2.5">{s.schoolName}</td>
                          <td className="px-3 py-2.5">{s.guardianContact}</td>
                          <td className="px-3 py-2.5 font-mono">{s.rightSph}/{s.rightCyl}/{s.rightAxis}/{s.rightVa}</td>
                          <td className="px-3 py-2.5 font-mono">{s.leftSph}/{s.leftCyl}/{s.leftAxis}/{s.leftVa}</td>
                          {!isLocked && (
                            <td className="px-3 py-2.5 text-right">
                              <button
                                onClick={() => handleDeleteStudent(s.id)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: REVIEW & FINAL SUBMISSION */}
            {activeTab === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    Step 6: Review All 5 Sheets Before Final Submission
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify all figures for {MONTHS[month - 1]} {year}. Once submitted, this entire month will be permanently locked.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sheet 1 Card */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">1) 40+ Patients Report</span>
                      <button
                        onClick={() => setActiveTab(0)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Edit Sheet 1
                      </button>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between"><span>Examined Total:</span><span className="font-semibold">{patient40ExaminedTotal}</span></div>
                      <div className="flex justify-between"><span>Presbyopia Total:</span><span className="font-semibold">{patient40PresbyopiaTotal}</span></div>
                      <div className="flex justify-between"><span>Free Spectacles:</span><span className="font-semibold">{patient40SpectaclesTotal}</span></div>
                    </div>
                  </div>

                  {/* Sheet 2 Card */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">2) OPD & Surgeries</span>
                      <button
                        onClick={() => setActiveTab(1)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Edit Sheet 2
                      </button>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between"><span>OPD Patients:</span><span className="font-semibold">{opd.opdPatientsExamined}</span></div>
                      <div className="flex justify-between"><span>Cataract Surgeries:</span><span className="font-semibold text-blue-600">{opd.cataractSurgery}</span></div>
                      <div className="flex justify-between"><span>Waiting List:</span><span className="font-semibold">{opd.cataractWaiting}</span></div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1">
                        <span>Students Examined:</span>
                        <span className="font-semibold">{opdStudentsExamined}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Students with RE:</span>
                        <span className="font-semibold">{opdStudentsWithRe}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sheet 3 Card */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">3) School Screening</span>
                      <button
                        onClick={() => setActiveTab(2)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Edit Sheet 3
                      </button>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between"><span>Schools Examined:</span><span className="font-semibold">{school.schoolsExaminedMonth}</span></div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1">
                        <span>Students Examined (M+F):</span>
                        <span className="font-semibold">{schoolStudentsTotal} ({schoolStudentsMale} M + {schoolStudentsFemale} F)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Refraction (M+F):</span>
                        <span className="font-semibold">{schoolRefractionTotal} ({schoolRefractionMale} M + {schoolRefractionFemale} F)</span>
                      </div>
                    </div>
                  </div>

                  {/* Sheet 4 Card */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">4) C-Extension (Visual Acuity)</span>
                      <button
                        onClick={() => setActiveTab(3)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Edit Sheet 4
                      </button>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between"><span>Pre-VA (6/6 - 6/12):</span><span className="font-semibold">{extension.preVa66To612}</span></div>
                      <div className="flex justify-between"><span>Post-VA (6/6 - 6/12):</span><span className="font-semibold">{extension.postVa66To612}</span></div>
                      <div className="flex justify-between"><span>Conventional (6/6 - 6/12):</span><span className="font-semibold">{extension.convVa66To612}</span></div>
                    </div>
                  </div>
                </div>

                {/* Sheet 5 Full-width */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">5) Students Refraction Records</span>
                    <button
                      onClick={() => setActiveTab(4)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Edit Sheet 5
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Total <strong>{students.length}</strong> individual student prescription records added for this month.
                  </p>
                </div>

                {/* Submission Callout */}
                {!isLocked && (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs sm:text-sm space-y-2">
                    <div className="flex items-center gap-2 font-bold text-blue-950">
                      <AlertCircle size={17} className="text-blue-600 shrink-0" />
                      <span>Ready to lock and submit your monthly return?</span>
                    </div>
                    <p>
                      Submitting will lock <strong>all 5 sheets</strong> simultaneously for {MONTHS[month - 1]} {year}. Please ensure you have reviewed all figures above before confirming.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 border-t border-slate-200 gap-3">
              <div>
                {activeTab > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
                    className="px-3.5 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft size={16} /> Previous Sheet
                  </button>
                )}
              </div>

              {!isLocked ? (
                <div className="flex items-center gap-3">
                  {/* On data entry tabs (0 to 4), provide Save Draft and Save & Next */}
                  {activeTab < 5 ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Save size={16} /> Save Draft
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveAndNext}
                        disabled={saving}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                      >
                        <span>Save & Next</span>
                        <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    /* Only on the final Review Tab (activeTab === 5), show the actual Final Submit button */
                    <button
                      type="button"
                      onClick={handleAttemptSubmit}
                      disabled={saving}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-md transition-all"
                    >
                      <Lock size={16} /> Submit & Lock Entire Month
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-medium italic">
                  This report is locked. No further modifications allowed.
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Validation Error Modal shown only after user clicks Submit */}
      {validationErrorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity backdrop-blur-xs"
            onClick={() => setValidationErrorModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-6 z-10 space-y-4 border border-slate-100">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle size={26} className="shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Cannot Submit Monthly Report
                </h3>
                <p className="text-xs text-slate-500">
                  Please fix the following numbers so your report sheets match:
                </p>
              </div>
            </div>

            <div className="space-y-2.5 py-1">
              {validationErrors.map((err, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{err.title}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setValidationErrorModalOpen(false)
                        setActiveTab(err.tab)
                      }}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Fix in Sheet {err.tab + 1} →
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {err.msg}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setValidationErrorModalOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Close & Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={confirmSubmitOpen}
        title={`Final Submit & Lock for ${MONTHS[month - 1]} ${year}?`}
        message={`Are you sure you want to submit your entire monthly return for all 5 clinical categories? Once confirmed, this month will be permanently locked for ${reportData?.workingStation || 'your station'}, and you will not be able to edit any sheet without Senior Doctor approval.`}
        confirmText="Yes, Submit & Lock Month"
        confirmVariant="success"
        onConfirm={handleSubmit}
        onCancel={() => setConfirmSubmitOpen(false)}
      />
    </div>
  )
}
