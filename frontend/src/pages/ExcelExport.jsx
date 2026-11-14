import { useState, useEffect } from 'react'
import {
  exportExcel,
  getAllReports,
  getCampProgramme,
  getAchievement,
  getPeriods,
} from '../services/api'
import Toast from '../components/Toast'
import StatusBadge from '../components/StatusBadge'
import {
  Download,
  FileSpreadsheet,
  CheckCircle,
  Eye,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

const TABS = [
  '1) 40+ Patients',
  '2) OPD Report',
  '3) School Report',
  '4) C-Extension',
  '5) Students Refraction',
  '6) Camp Programme',
  '7) Achievement',
]

export default function ExcelExport() {
  const [month, setMonth] = useState(4)
  const [year, setYear] = useState(2026)
  const [activeTab, setActiveTab] = useState(0)

  // Data states
  const [reports, setReports] = useState([])
  const [campEntries, setCampEntries] = useState([])
  const [achievementList, setAchievementList] = useState([])
  const [periods, setPeriods] = useState([])

  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [toast, setToast] = useState(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  useEffect(() => {
    loadAllPreviewData()
  }, [month, year])

  const loadAllPreviewData = async () => {
    try {
      setLoading(true)
      const [repRes, periodRes, achRes] = await Promise.all([
        getAllReports(month, year),
        getPeriods(),
        getAchievement(year),
      ])

      const reps = repRes.data || []
      setReports(reps)
      setAchievementList(achRes.data || [])

      const periodList = periodRes.data || []
      setPeriods(periodList)

      const activePeriod = periodList.find((p) => p.month === month && p.year === year)
      if (activePeriod) {
        const campRes = await getCampProgramme(activePeriod.id)
        setCampEntries(campRes.data || [])
      } else {
        setCampEntries([])
      }
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to load preview tables' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      setDownloading(true)
      const res = await exportExcel(month, year)
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${monthNames[month - 1]}_${year}_Monthly_Reports.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setToast({ type: 'success', message: 'Official Excel workbook exported successfully!' })
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to generate Excel export' })
    } finally {
      setDownloading(false)
    }
  }

  // Aggregate All Students across all doctor reports
  const allStudentRecords = reports.flatMap((r) =>
    (r.studentRecords || []).map((s) => ({
      ...s,
      doctorName: r.doctorName,
      workingStation: r.workingStation,
    }))
  )

  // Sheet 1 Calculations
  const sheet1Totals = reports.reduce(
    (acc, r) => {
      const p = r.patient40Plus || {}
      acc.exM += Number(p.examinedMale) || 0
      acc.exF += Number(p.examinedFemale) || 0
      acc.presM += Number(p.presbyopiaMale) || 0
      acc.presF += Number(p.presbyopiaFemale) || 0
      acc.spM += Number(p.freeSpectaclesMale) || 0
      acc.spF += Number(p.freeSpectaclesFemale) || 0
      return acc
    },
    { exM: 0, exF: 0, presM: 0, presF: 0, spM: 0, spF: 0 }
  )

  // Sheet 2 Calculations
  const sheet2Totals = reports.reduce(
    (acc, r) => {
      const o = r.opd || {}
      acc.opd += Number(o.opdPatientsExamined) || 0
      acc.re += Number(o.refractiveError) || 0
      acc.catFound += Number(o.cataractFound) || 0
      acc.catSurg += Number(o.cataractSurgery) || 0
      acc.catWait += Number(o.cataractWaiting) || 0
      acc.schExam += Number(o.studentsExamined) || 0
      acc.schRe += Number(o.studentsWithRe) || 0
      acc.dr += Number(o.diabeticRetinopathy) || 0
      acc.gl += Number(o.glaucoma) || 0
      acc.sq += Number(o.squint) || 0
      acc.rop += Number(o.rop) || 0
      return acc
    },
    { opd: 0, re: 0, catFound: 0, catSurg: 0, catWait: 0, schExam: 0, schRe: 0, dr: 0, gl: 0, sq: 0, rop: 0 }
  )

  // Sheet 3 Calculations
  const sheet3Totals = reports.reduce(
    (acc, r) => {
      const s = r.school || {}
      acc.schEx += Number(s.schoolsExaminedMonth) || 0
      acc.stM += Number(s.studentsMaleMonth) || 0
      acc.stF += Number(s.studentsFemaleMonth) || 0
      acc.refM += Number(s.refractionMaleMonth) || 0
      acc.refF += Number(s.refractionFemaleMonth) || 0
      return acc
    },
    { schEx: 0, stM: 0, stF: 0, refM: 0, refF: 0 }
  )

  const submittedCount = reports.filter((r) => r.status === 'SUBMITTED').length

  return (
    <div className="space-y-6 max-w-7xl">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Excel Workbook Export</h1>
          <p className="text-sm text-slate-500">
            Preview the exact numbers across all 7 official worksheets before generating the workbook
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Period:</span>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download size={17} />
            {downloading ? 'Exporting...' : 'Download Master Excel (.xlsx)'}
          </button>
        </div>
      </div>

      {/* Snapshot KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stations Reporting</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {submittedCount} <span className="text-xs text-slate-400 font-normal">/ {reports.length} submitted</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total OPD Examined</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{sheet2Totals.opd}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cataract Surgeries</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{sheet2Totals.catSurg}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Students</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{allStudentRecords.length}</p>
        </div>
      </div>

      {/* Preview Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="bg-slate-50/80 border-b border-slate-200 px-4 pt-3 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex gap-1.5">
            {TABS.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap rounded-t-xl transition-all border-b-2 ${
                  activeTab === idx
                    ? 'bg-white text-blue-600 border-blue-600 shadow-xs'
                    : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Live Preview
          </span>
        </div>

        {/* Tab Preview Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading worksheet preview...</div>
          ) : (
            <>
              {/* 1) 40+ PATIENTS PREVIEW */}
              {activeTab === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        40+ Year Patients Presbyopic Report (Sheet 1)
                      </h3>
                      <p className="text-xs text-slate-500">
                        MONTH :- {monthNames[month - 1].toUpperCase()} {year}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 text-slate-700 font-bold border-b text-center">
                        <tr>
                          <th rowSpan="2" className="px-4 py-2.5 text-left border-r w-48">NAME OF OPHTHALMIC OFFICER</th>
                          <th rowSpan="2" className="px-4 py-2.5 text-left border-r w-48">WORKING STATION</th>
                          <th colSpan="3" className="px-3 py-1.5 border-r bg-blue-50/50">PERSONS EXAMINED (40+)</th>
                          <th colSpan="3" className="px-3 py-1.5 border-r bg-emerald-50/50">PRESBYOPIA (40+)</th>
                          <th colSpan="3" className="px-3 py-1.5 bg-amber-50/50">FREE SPECTACLES DISTRIBUTED</th>
                        </tr>
                        <tr className="border-t text-[11px] bg-slate-50">
                          <th className="px-2.5 py-1.5">M</th>
                          <th className="px-2.5 py-1.5">F</th>
                          <th className="px-2.5 py-1.5 border-r font-bold text-blue-700">Total</th>
                          <th className="px-2.5 py-1.5">M</th>
                          <th className="px-2.5 py-1.5">F</th>
                          <th className="px-2.5 py-1.5 border-r font-bold text-emerald-700">Total</th>
                          <th className="px-2.5 py-1.5">M</th>
                          <th className="px-2.5 py-1.5">F</th>
                          <th className="px-2.5 py-1.5 font-bold text-amber-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.map((r) => {
                          const p = r.patient40Plus || {}
                          const exM = Number(p.examinedMale) || 0
                          const exF = Number(p.examinedFemale) || 0
                          const presM = Number(p.presbyopiaMale) || 0
                          const presF = Number(p.presbyopiaFemale) || 0
                          const spM = Number(p.freeSpectaclesMale) || 0
                          const spF = Number(p.freeSpectaclesFemale) || 0

                          return (
                            <tr key={r.doctorId} className="hover:bg-slate-50 text-center">
                              <td className="px-4 py-2 text-left font-semibold text-slate-800 border-r">{r.doctorName}</td>
                              <td className="px-4 py-2 text-left text-slate-600 border-r">{r.workingStation}</td>
                              <td className="px-2.5 py-2">{exM}</td>
                              <td className="px-2.5 py-2">{exF}</td>
                              <td className="px-2.5 py-2 font-bold text-blue-700 border-r bg-blue-50/20">{exM + exF}</td>
                              <td className="px-2.5 py-2">{presM}</td>
                              <td className="px-2.5 py-2">{presF}</td>
                              <td className="px-2.5 py-2 font-bold text-emerald-700 border-r bg-emerald-50/20">{presM + presF}</td>
                              <td className="px-2.5 py-2">{spM}</td>
                              <td className="px-2.5 py-2">{spF}</td>
                              <td className="px-2.5 py-2 font-bold text-amber-700 bg-amber-50/20">{spM + spF}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                      {/* Total Row */}
                      <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-center">
                        <tr>
                          <td colSpan="2" className="px-4 py-2.5 text-left border-r uppercase">TOTAL »»»</td>
                          <td className="px-2.5 py-2.5">{sheet1Totals.exM}</td>
                          <td className="px-2.5 py-2.5">{sheet1Totals.exF}</td>
                          <td className="px-2.5 py-2.5 border-r text-blue-700">{sheet1Totals.exM + sheet1Totals.exF}</td>
                          <td className="px-2.5 py-2.5">{sheet1Totals.presM}</td>
                          <td className="px-2.5 py-2.5">{sheet1Totals.presF}</td>
                          <td className="px-2.5 py-2.5 border-r text-emerald-700">{sheet1Totals.presM + sheet1Totals.presF}</td>
                          <td className="px-2.5 py-2.5">{sheet1Totals.spM}</td>
                          <td className="px-2.5 py-2.5">{sheet1Totals.spF}</td>
                          <td className="px-2.5 py-2.5 text-amber-700">{sheet1Totals.spM + sheet1Totals.spF}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* 2) OPD REPORT PREVIEW */}
              {activeTab === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Monitoring of Activities of Ophthalmic Officers (Sheet 2)
                    </h3>
                    <p className="text-xs text-slate-500">
                      OPD, Cataract Surgeries, Waiting List, School Screening & Other Eye Diseases
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 text-slate-700 font-bold border-b text-center">
                        <tr>
                          <th rowSpan="2" className="px-4 py-2.5 text-left border-r w-44">OFFICER</th>
                          <th rowSpan="2" className="px-4 py-2.5 text-left border-r w-44">STATION</th>
                          <th colSpan="2" className="px-2.5 py-1.5 border-r bg-blue-50/50">OPD</th>
                          <th colSpan="3" className="px-2.5 py-1.5 border-r bg-amber-50/50">CATARACT</th>
                          <th colSpan="2" className="px-2.5 py-1.5 border-r bg-purple-50/50">SCHOOL SCREENING</th>
                          <th colSpan="4" className="px-2.5 py-1.5 bg-slate-50">OTHER EYE DISEASES</th>
                        </tr>
                        <tr className="border-t text-[11px] bg-slate-50">
                          <th className="px-2 py-1">Examined</th>
                          <th className="px-2 py-1 border-r">RE</th>
                          <th className="px-2 py-1">Found</th>
                          <th className="px-2 py-1 text-blue-700 font-bold">Surgery</th>
                          <th className="px-2 py-1 border-r text-amber-700 font-bold">Waiting</th>
                          <th className="px-2 py-1">Examined</th>
                          <th className="px-2 py-1 border-r">RE</th>
                          <th className="px-2 py-1">Diabetic</th>
                          <th className="px-2 py-1">Glaucoma</th>
                          <th className="px-2 py-1">Squint</th>
                          <th className="px-2 py-1">ROP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.map((r) => {
                          const o = r.opd || {}
                          return (
                            <tr key={r.doctorId} className="hover:bg-slate-50 text-center">
                              <td className="px-4 py-2 text-left font-semibold text-slate-800 border-r">{r.doctorName}</td>
                              <td className="px-4 py-2 text-left text-slate-600 border-r">{r.workingStation}</td>
                              <td className="px-2 py-2 font-medium">{o.opdPatientsExamined || 0}</td>
                              <td className="px-2 py-2 border-r">{o.refractiveError || 0}</td>
                              <td className="px-2 py-2">{o.cataractFound || 0}</td>
                              <td className="px-2 py-2 font-bold text-blue-600">{o.cataractSurgery || 0}</td>
                              <td className="px-2 py-2 font-medium text-amber-700 border-r">{o.cataractWaiting || 0}</td>
                              <td className="px-2 py-2">{o.studentsExamined || 0}</td>
                              <td className="px-2 py-2 border-r">{o.studentsWithRe || 0}</td>
                              <td className="px-2 py-2">{o.diabeticRetinopathy || 0}</td>
                              <td className="px-2 py-2">{o.glaucoma || 0}</td>
                              <td className="px-2 py-2">{o.squint || 0}</td>
                              <td className="px-2 py-2">{o.rop || 0}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-center">
                        <tr>
                          <td colSpan="2" className="px-4 py-2.5 text-left border-r uppercase">TOTAL »»»</td>
                          <td className="px-2 py-2.5">{sheet2Totals.opd}</td>
                          <td className="px-2 py-2.5 border-r">{sheet2Totals.re}</td>
                          <td className="px-2 py-2.5">{sheet2Totals.catFound}</td>
                          <td className="px-2 py-2.5 text-blue-700">{sheet2Totals.catSurg}</td>
                          <td className="px-2 py-2.5 text-amber-700 border-r">{sheet2Totals.catWait}</td>
                          <td className="px-2 py-2.5">{sheet2Totals.schExam}</td>
                          <td className="px-2 py-2.5 border-r">{sheet2Totals.schRe}</td>
                          <td className="px-2 py-2.5">{sheet2Totals.dr}</td>
                          <td className="px-2 py-2.5">{sheet2Totals.gl}</td>
                          <td className="px-2 py-2.5">{sheet2Totals.sq}</td>
                          <td className="px-2 py-2.5">{sheet2Totals.rop}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* 3) SCHOOL REPORT PREVIEW */}
              {activeTab === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">School Eye Screening Report (Sheet 3)</h3>
                    <p className="text-xs text-slate-500">Schools visited, students examined, and refractions</p>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 text-slate-700 font-bold border-b text-center">
                        <tr>
                          <th rowSpan="2" className="px-4 py-2.5 text-left border-r w-48">OFFICER</th>
                          <th rowSpan="2" className="px-4 py-2.5 text-left border-r w-48">STATION</th>
                          <th rowSpan="2" className="px-3 py-2.5 border-r">SCHOOLS EXAMINED</th>
                          <th colSpan="3" className="px-3 py-1.5 border-r bg-blue-50/50">STUDENTS EXAMINED</th>
                          <th colSpan="3" className="px-3 py-1.5 bg-emerald-50/50">TOTAL REFRACTION</th>
                        </tr>
                        <tr className="border-t text-[11px] bg-slate-50">
                          <th className="px-2.5 py-1.5">Male</th>
                          <th className="px-2.5 py-1.5">Female</th>
                          <th className="px-2.5 py-1.5 border-r font-bold text-blue-700">Total</th>
                          <th className="px-2.5 py-1.5">Male</th>
                          <th className="px-2.5 py-1.5">Female</th>
                          <th className="px-2.5 py-1.5 font-bold text-emerald-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.map((r) => {
                          const s = r.school || {}
                          const stM = Number(s.studentsMaleMonth) || 0
                          const stF = Number(s.studentsFemaleMonth) || 0
                          const refM = Number(s.refractionMaleMonth) || 0
                          const refF = Number(s.refractionFemaleMonth) || 0

                          return (
                            <tr key={r.doctorId} className="hover:bg-slate-50 text-center">
                              <td className="px-4 py-2 text-left font-semibold text-slate-800 border-r">{r.doctorName}</td>
                              <td className="px-4 py-2 text-left text-slate-600 border-r">{r.workingStation}</td>
                              <td className="px-3 py-2 border-r">{s.schoolsExaminedMonth || 0}</td>
                              <td className="px-2.5 py-2">{stM}</td>
                              <td className="px-2.5 py-2">{stF}</td>
                              <td className="px-2.5 py-2 font-bold text-blue-700 border-r bg-blue-50/20">{stM + stF}</td>
                              <td className="px-2.5 py-2">{refM}</td>
                              <td className="px-2.5 py-2">{refF}</td>
                              <td className="px-2.5 py-2 font-bold text-emerald-700 bg-emerald-50/20">{refM + refF}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-center">
                        <tr>
                          <td colSpan="2" className="px-4 py-2.5 text-left border-r uppercase">TOTAL »»»</td>
                          <td className="px-3 py-2.5 border-r">{sheet3Totals.schEx}</td>
                          <td className="px-2.5 py-2.5">{sheet3Totals.stM}</td>
                          <td className="px-2.5 py-2.5">{sheet3Totals.stF}</td>
                          <td className="px-2.5 py-2.5 border-r text-blue-700">{sheet3Totals.stM + sheet3Totals.stF}</td>
                          <td className="px-2.5 py-2.5">{sheet3Totals.refM}</td>
                          <td className="px-2.5 py-2.5">{sheet3Totals.refF}</td>
                          <td className="px-2.5 py-2.5 text-emerald-700">{sheet3Totals.refM + sheet3Totals.refF}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* 4) C-EXTENSION PREVIEW */}
              {activeTab === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">C-Extension Visual Acuity Report (Sheet 4)</h3>
                    <p className="text-xs text-slate-500">Post/Pre operative and conventional visual acuity categories</p>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 text-slate-700 font-bold border-b text-center">
                        <tr>
                          <th rowSpan="2" className="px-4 py-2.5 text-left border-r w-44">OFFICER</th>
                          <th rowSpan="2" className="px-4 py-2.5 text-left border-r w-44">STATION</th>
                          <th colSpan="4" className="px-2 py-1.5 border-r bg-blue-50/50">PRE-CORRECTION V/A IOL</th>
                          <th colSpan="4" className="px-2 py-1.5 border-r bg-emerald-50/50">POST-CORRECTION V/A IOL</th>
                          <th colSpan="4" className="px-2 py-1.5 bg-amber-50/50">CONVENTIONAL V/A</th>
                        </tr>
                        <tr className="border-t text-[11px] bg-slate-50">
                          <th className="px-2 py-1">&lt; 6/36</th>
                          <th className="px-2 py-1">6/24-36</th>
                          <th className="px-2 py-1">6/12-24</th>
                          <th className="px-2 py-1 border-r">6/6-12</th>
                          <th className="px-2 py-1">&lt; 6/36</th>
                          <th className="px-2 py-1">6/24-36</th>
                          <th className="px-2 py-1">6/12-24</th>
                          <th className="px-2 py-1 border-r">6/6-12</th>
                          <th className="px-2 py-1">&lt; 6/36</th>
                          <th className="px-2 py-1">6/24-36</th>
                          <th className="px-2 py-1">6/12-24</th>
                          <th className="px-2 py-1">6/6-12</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.map((r) => {
                          const e = r.extension || {}
                          return (
                            <tr key={r.doctorId} className="hover:bg-slate-50 text-center">
                              <td className="px-4 py-2 text-left font-semibold text-slate-800 border-r">{r.doctorName}</td>
                              <td className="px-4 py-2 text-left text-slate-600 border-r">{r.workingStation}</td>
                              <td className="px-2 py-2">{e.preVaLt636 || 0}</td>
                              <td className="px-2 py-2">{e.preVa624To636 || 0}</td>
                              <td className="px-2 py-2">{e.preVa612To624 || 0}</td>
                              <td className="px-2 py-2 border-r">{e.preVa66To612 || 0}</td>
                              <td className="px-2 py-2">{e.postVaLt636 || 0}</td>
                              <td className="px-2 py-2">{e.postVa624To636 || 0}</td>
                              <td className="px-2 py-2">{e.postVa612To624 || 0}</td>
                              <td className="px-2 py-2 border-r font-semibold text-emerald-700">{e.postVa66To612 || 0}</td>
                              <td className="px-2 py-2">{e.convVaLt636 || 0}</td>
                              <td className="px-2 py-2">{e.convVa624To636 || 0}</td>
                              <td className="px-2 py-2">{e.convVa612To624 || 0}</td>
                              <td className="px-2 py-2">{e.convVa66To612 || 0}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5) STUDENTS REFRACTION PREVIEW */}
              {activeTab === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        Students Refraction Register (Sheet 5)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Total {allStudentRecords.length} student records from all participating doctors
                      </p>
                    </div>
                  </div>

                  {allStudentRecords.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                      No student refraction records submitted for this period.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/80 text-slate-700 font-bold border-b">
                          <tr>
                            <th className="px-3 py-2 w-12">#</th>
                            <th className="px-3 py-2">Doctor / Station</th>
                            <th className="px-3 py-2">Student Name</th>
                            <th className="px-3 py-2">Class</th>
                            <th className="px-3 py-2">Age/Gen</th>
                            <th className="px-3 py-2">School</th>
                            <th className="px-3 py-2">Contact</th>
                            <th className="px-3 py-2">Right Eye (SPH/CYL/AXIS/VA)</th>
                            <th className="px-3 py-2">Left Eye (SPH/CYL/AXIS/VA)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {allStudentRecords.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                              <td className="px-3 py-2 font-medium text-slate-700">{s.doctorName}</td>
                              <td className="px-3 py-2 font-bold text-slate-900">{s.studentName}</td>
                              <td className="px-3 py-2">{s.studentClass}</td>
                              <td className="px-3 py-2">{s.age} / {s.gender}</td>
                              <td className="px-3 py-2">{s.schoolName}</td>
                              <td className="px-3 py-2">{s.guardianContact}</td>
                              <td className="px-3 py-2 font-mono">{s.rightSph}/{s.rightCyl}/{s.rightAxis}/{s.rightVa}</td>
                              <td className="px-3 py-2 font-mono">{s.leftSph}/{s.leftCyl}/{s.leftAxis}/{s.leftVa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 6) CAMP PROGRAMME PREVIEW */}
              {activeTab === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Cataract Eye Camp Schedule (Sheet 6)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Schedule for {monthNames[month - 1]} {year}
                    </p>
                  </div>

                  {campEntries.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                      No camp days scheduled yet for this month.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/80 text-slate-700 font-bold border-b">
                          <tr>
                            <th className="px-3 py-2 w-16">Day #</th>
                            <th className="px-3 py-2">Weekday</th>
                            <th className="px-3 py-2">Hospital Name</th>
                            <th className="px-3 py-2">Admission Date</th>
                            <th className="px-3 py-2">Surgery Date</th>
                            <th className="px-3 py-2">Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {campEntries.map((c, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-bold text-slate-700">{c.dayNumber}</td>
                              <td className="px-3 py-2 font-semibold text-slate-800">{c.weekday}</td>
                              <td className="px-3 py-2">{c.hospitalName}</td>
                              <td className="px-3 py-2">{c.admissionDate || '—'}</td>
                              <td className="px-3 py-2 font-medium text-blue-700">{c.surgeryDate || '—'}</td>
                              <td className="px-3 py-2">{c.surgeryLocation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 7) ACHIEVEMENT PREVIEW */}
              {activeTab === 6 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Cataract Operation Performance & Targets (Sheet 7)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Fiscal Year {year} Target vs Verified Actual Achievements
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 text-slate-700 font-bold border-b text-center">
                        <tr>
                          <th className="px-4 py-2.5 text-left w-52">OPHTHALMIC OFFICER</th>
                          <th className="px-4 py-2.5 text-left w-52">WORKING STATION</th>
                          <th className="px-4 py-2.5">CATARACT TARGET</th>
                          <th className="px-4 py-2.5">ACHIEVEMENT</th>
                          <th className="px-4 py-2.5">ACHIEVEMENT %</th>
                          <th className="px-4 py-2.5">CALCULATION FORMULA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {achievementList.map((a) => (
                          <tr key={a.doctorId} className="hover:bg-slate-50 text-center">
                            <td className="px-4 py-2 text-left font-semibold text-slate-800">{a.doctorName}</td>
                            <td className="px-4 py-2 text-left text-slate-600">{a.workingStation}</td>
                            <td className="px-4 py-2 font-medium">{a.cataractTarget}</td>
                            <td className="px-4 py-2 font-bold text-blue-600">{a.achievementCount}</td>
                            <td className="px-4 py-2 font-bold text-slate-800">{a.achievementPercentage}%</td>
                            <td className="px-4 py-2 font-mono text-slate-400 text-[11px]">
                              {a.cataractTarget > 0 ? `${a.achievementCount} × 100 / ${a.cataractTarget}` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Download Bar */}
      <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">
              Ready to Export {monthNames[month - 1]} {year} Consolidated Workbook
            </h4>
            <p className="text-xs text-slate-500">
              Matches your original template styling, merged headers, and Excel formulas
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Download size={18} />
          {downloading ? 'Generating Official Excel...' : 'Download Master Excel (.xlsx)'}
        </button>
      </div>
    </div>
  )
}
