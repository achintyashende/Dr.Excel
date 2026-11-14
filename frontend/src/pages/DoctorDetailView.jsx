import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getDoctorReport } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import { ArrowLeft, User, Building, Calendar, CheckCircle2 } from 'lucide-react'

export default function DoctorDetailView() {
  const { doctorId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const month = Number(searchParams.get('month') || 4)
  const year = Number(searchParams.get('year') || 2026)

  const [activeTab, setActiveTab] = useState('40plus')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    loadReport()
  }, [doctorId, month, year])

  const loadReport = async () => {
    try {
      setLoading(true)
      const res = await getDoctorReport(doctorId, month, year)
      setReport(res.data)
    } catch (err) {
      console.error('Failed to load report', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading doctor report...</div>
  }

  return (
    <div className="space-y-6">
      {/* Back button and profile header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/senior')}
          className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{report?.doctorName}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
            <Building size={14} /> {report?.workingStation}
            <span>•</span>
            <Calendar size={14} /> {monthNames[month - 1]} {year}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={report?.status || 'PENDING'} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('40plus')}
          className={`py-2 px-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === '40plus'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          1) 40+ Patients
        </button>
        <button
          onClick={() => setActiveTab('opd')}
          className={`py-2 px-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'opd'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          2) OPD & Surgeries
        </button>
        <button
          onClick={() => setActiveTab('school')}
          className={`py-2 px-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'school'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          3) School Report
        </button>
        <button
          onClick={() => setActiveTab('extension')}
          className={`py-2 px-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'extension'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          4) C-Extension
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`py-2 px-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          5) Student Refraction ({report?.studentRecords?.length || 0})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {activeTab === '40plus' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-700 text-sm mb-3">Examined (40+ Years)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Male:</span><span className="font-semibold">{report?.patient40Plus?.examinedMale || 0}</span></div>
                <div className="flex justify-between"><span>Female:</span><span className="font-semibold">{report?.patient40Plus?.examinedFemale || 0}</span></div>
                <div className="flex justify-between border-t pt-2 text-blue-600 font-bold">
                  <span>Total:</span>
                  <span>{(report?.patient40Plus?.examinedMale || 0) + (report?.patient40Plus?.examinedFemale || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-700 text-sm mb-3">Presbyopia Cases</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Male:</span><span className="font-semibold">{report?.patient40Plus?.presbyopiaMale || 0}</span></div>
                <div className="flex justify-between"><span>Female:</span><span className="font-semibold">{report?.patient40Plus?.presbyopiaFemale || 0}</span></div>
                <div className="flex justify-between border-t pt-2 text-blue-600 font-bold">
                  <span>Total:</span>
                  <span>{(report?.patient40Plus?.presbyopiaMale || 0) + (report?.patient40Plus?.presbyopiaFemale || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-700 text-sm mb-3">Free Spectacles Distributed</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Male:</span><span className="font-semibold">{report?.patient40Plus?.freeSpectaclesMale || 0}</span></div>
                <div className="flex justify-between"><span>Female:</span><span className="font-semibold">{report?.patient40Plus?.freeSpectaclesFemale || 0}</span></div>
                <div className="flex justify-between border-t pt-2 text-blue-600 font-bold">
                  <span>Total:</span>
                  <span>{(report?.patient40Plus?.freeSpectaclesMale || 0) + (report?.patient40Plus?.freeSpectaclesFemale || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'opd' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">OPD Patients</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{report?.opd?.opdPatientsExamined || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">Refractive Error</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{report?.opd?.refractiveError || 0}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 uppercase font-semibold">Cataract Surgeries</p>
                <p className="text-xl font-bold text-blue-700 mt-1">{report?.opd?.cataractSurgery || 0}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-600 uppercase font-semibold">On Waiting List</p>
                <p className="text-xl font-bold text-amber-700 mt-1">{report?.opd?.cataractWaiting || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">Diabetic Retinopathy</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{report?.opd?.diabeticRetinopathy || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">Glaucoma</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{report?.opd?.glaucoma || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">Squint</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{report?.opd?.squint || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">ROP</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{report?.opd?.rop || 0}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <h4 className="font-semibold text-slate-700 text-sm">School Eye Screening (OPD)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Students Examined</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{report?.opd?.studentsExamined || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Students with RE</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{report?.opd?.studentsWithRe || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Free Spectacles Provided</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{report?.opd?.freeSpectaclesProvided || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'school' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">Schools Examined</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{report?.school?.schoolsExaminedMonth || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">Students Examined</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {(report?.school?.studentsMaleMonth || 0) + (report?.school?.studentsFemaleMonth || 0)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">Total Refraction</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {(report?.school?.refractionMaleMonth || 0) + (report?.school?.refractionFemaleMonth || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'extension' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-700 text-sm mb-2">Pre-Correction V/A IOL</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>&lt; 6/36:</span><span className="font-medium">{report?.extension?.preVaLt636 || 0}</span></div>
                  <div className="flex justify-between"><span>6/24 - 6/36:</span><span className="font-medium">{report?.extension?.preVa624To636 || 0}</span></div>
                  <div className="flex justify-between"><span>6/12 - 6/24:</span><span className="font-medium">{report?.extension?.preVa612To624 || 0}</span></div>
                  <div className="flex justify-between"><span>6/6 - 6/12:</span><span className="font-medium">{report?.extension?.preVa66To612 || 0}</span></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-700 text-sm mb-2">Post-Correction V/A IOL</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>&lt; 6/36:</span><span className="font-medium">{report?.extension?.postVaLt636 || 0}</span></div>
                  <div className="flex justify-between"><span>6/24 - 6/36:</span><span className="font-medium">{report?.extension?.postVa624To636 || 0}</span></div>
                  <div className="flex justify-between"><span>6/12 - 6/24:</span><span className="font-medium">{report?.extension?.postVa612To624 || 0}</span></div>
                  <div className="flex justify-between"><span>6/6 - 6/12:</span><span className="font-medium">{report?.extension?.postVa66To612 || 0}</span></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-700 text-sm mb-2">Conventional Post-Correction</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>&lt; 6/36:</span><span className="font-medium">{report?.extension?.convVaLt636 || 0}</span></div>
                  <div className="flex justify-between"><span>6/24 - 6/36:</span><span className="font-medium">{report?.extension?.convVa624To636 || 0}</span></div>
                  <div className="flex justify-between"><span>6/12 - 6/24:</span><span className="font-medium">{report?.extension?.convVa612To624 || 0}</span></div>
                  <div className="flex justify-between"><span>6/6 - 6/12:</span><span className="font-medium">{report?.extension?.convVa66To612 || 0}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            {(!report?.studentRecords || report.studentRecords.length === 0) ? (
              <p className="text-center py-8 text-slate-400">No student refraction records submitted for this month.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase">
                  <tr>
                    <th className="px-3 py-2">Student Name</th>
                    <th className="px-3 py-2">Class</th>
                    <th className="px-3 py-2">Age/Gen</th>
                    <th className="px-3 py-2">School</th>
                    <th className="px-3 py-2">Contact</th>
                    <th className="px-3 py-2">Right Eye (SPH / CYL / AXIS / VA)</th>
                    <th className="px-3 py-2">Left Eye (SPH / CYL / AXIS / VA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.studentRecords.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-800">{s.studentName}</td>
                      <td className="px-3 py-2.5">{s.studentClass}</td>
                      <td className="px-3 py-2.5">{s.age} / {s.gender}</td>
                      <td className="px-3 py-2.5">{s.schoolName}</td>
                      <td className="px-3 py-2.5">{s.guardianContact}</td>
                      <td className="px-3 py-2.5 font-mono">{s.rightSph} / {s.rightCyl} / {s.rightAxis} / {s.rightVa}</td>
                      <td className="px-3 py-2.5 font-mono">{s.leftSph} / {s.leftCyl} / {s.leftAxis} / {s.leftVa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
