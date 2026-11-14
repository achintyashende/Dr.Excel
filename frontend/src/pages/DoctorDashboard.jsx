import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyReport, getProfile } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import { FileText, History, Calendar, Stethoscope } from 'lucide-react'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, reportRes] = await Promise.allSettled([
          getProfile(),
          getMyReport(currentMonth, currentYear),
        ])
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data)
        if (reportRes.status === 'fulfilled') setReport(reportRes.value.data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentMonth, currentYear])

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString(
    'default',
    { month: 'long' }
  )

  const isSubmitted = report?.status === 'SUBMITTED'

  const stats = [
    {
      label: 'OPD Patients',
      value: report?.opdData?.totalPatients ?? '—',
      icon: Stethoscope,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Cataract Surgeries',
      value: report?.opdData?.cataractSurgeries ?? '—',
      icon: Stethoscope,
      color: 'bg-green-50 text-green-700',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, {user?.doctorName || user?.username} 
        </h1>
        <p className="text-slate-500 mt-1">
          Here's your reporting overview for the current period.
        </p>
      </div>

      {/* Current Period */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar size={20} className="text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {monthName} {currentYear}
              </h2>
              <p className="text-sm text-slate-500">Current Reporting Period</p>
            </div>
          </div>
          <StatusBadge status={report?.status || 'PENDING'} />
        </div>
      </div>

      {/* Quick Stats */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/report')}
          disabled={isSubmitted}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors"
        >
          <FileText size={18} />
          {isSubmitted ? 'Report Submitted' : 'Fill Monthly Report'}
        </button>
        <button
          onClick={() => navigate('/report/history')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm transition-colors"
        >
          <History size={18} />
          View History
        </button>
      </div>
    </div>
  )
}
