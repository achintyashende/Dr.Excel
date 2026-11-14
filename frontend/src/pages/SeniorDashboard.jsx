import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard, reopenReport } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import { Users, CheckCircle, Clock, Eye, RotateCcw, Filter } from 'lucide-react'

export default function SeniorDashboard() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(4)
  const [year, setYear] = useState(2026)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [toast, setToast] = useState(null)
  const [reopenTarget, setReopenTarget] = useState(null)
  const [reopenReason, setReopenReason] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [month, year])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const res = await getDashboard(month, year)
      setData(res.data)
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load dashboard data' })
    } finally {
      setLoading(false)
    }
  }

  const handleReopen = async () => {
    if (!reopenTarget) return
    try {
      await reopenReport(reopenTarget.id, { reason: reopenReason })
      setToast({ type: 'success', message: 'Report reopened for doctor successfully' })
      setReopenTarget(null)
      setReopenReason('')
      loadDashboard()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to reopen report' })
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const filteredDoctors = (data?.doctorSummaries || []).filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.workingStation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'ALL' || d.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Senior Doctor Dashboard</h1>
          <p className="text-sm text-slate-500">Supervise, inspect submissions, and verify district reports</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
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
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stations</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{data?.totalDoctors || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{data?.submitted || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{data?.pending || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search doctor or facility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Filter size={16} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading doctor reports...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Doctor / Officer</th>
                  <th className="px-6 py-3.5">Facility / Station</th>
                  <th className="px-6 py-3.5 text-center">OPD Count</th>
                  <th className="px-6 py-3.5 text-center">Cataract Surgeries</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.doctorId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {doc.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {doc.workingStation}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {doc.opdCount > 0 ? (
                        <span className="text-slate-800">{doc.opdCount}</span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {doc.cataractSurgery > 0 ? (
                        <span className="text-blue-600 font-semibold">{doc.cataractSurgery}</span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/senior/doctors/${doc.doctorId}?month=${month}&year=${year}`)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Eye size={14} />
                          Inspect
                        </button>

                        {doc.status === 'SUBMITTED' && (
                          <button
                            onClick={() => setReopenTarget({ id: doc.doctorId, name: doc.name })}
                            title="Reopen Report for Edit"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reopen Confirmation Modal */}
      {reopenTarget && (
        <Modal
          isOpen={!!reopenTarget}
          title={`Reopen Report for ${reopenTarget.name}`}
          message="Reopening will return the report to DRAFT status and allow the doctor to make changes."
          confirmText="Reopen Report"
          confirmVariant="warning"
          onConfirm={handleReopen}
          onCancel={() => {
            setReopenTarget(null)
            setReopenReason('')
          }}
        >
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Reason for reopening (Required for audit log):
            </label>
            <input
              type="text"
              required
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. Doctor requested correction in OPD count"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
