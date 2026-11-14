import { useState, useEffect } from 'react'
import { getReportHistory } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import { FileText, Calendar, Clock } from 'lucide-react'

export default function ReportHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const res = await getReportHistory()
      setHistory(res.data || [])
    } catch (err) {
      console.error('Failed to load history', err)
    } finally {
      setLoading(false)
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Submission History</h1>
          <p className="text-sm text-slate-500">View your previous monthly reports</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-700">No submissions found</h3>
          <p className="text-sm text-slate-500 mt-1">You haven't submitted any monthly reports yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {history.map((rep) => (
                <tr key={rep.reportId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    {monthNames[rep.month - 1]} {rep.year}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={rep.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {rep.submittedAt ? (
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(rep.submittedAt).toLocaleDateString()} {new Date(rep.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedReport(rep)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Report: {monthNames[selectedReport.month - 1]} {selectedReport.year}
                </h3>
                <p className="text-xs text-slate-500">{selectedReport.doctorName} • {selectedReport.workingStation}</p>
              </div>
              <StatusBadge status={selectedReport.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-700 mb-2">40+ Presbyopic Patients</h4>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Examined Total:</span>
                    <span className="font-medium">{(selectedReport.patient40Plus?.examinedMale || 0) + (selectedReport.patient40Plus?.examinedFemale || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Presbyopia Total:</span>
                    <span className="font-medium">{(selectedReport.patient40Plus?.presbyopiaMale || 0) + (selectedReport.patient40Plus?.presbyopiaFemale || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free Spectacles:</span>
                    <span className="font-medium">{(selectedReport.patient40Plus?.freeSpectaclesMale || 0) + (selectedReport.patient40Plus?.freeSpectaclesFemale || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-700 mb-2">OPD & Surgeries</h4>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>OPD Patients:</span>
                    <span className="font-medium">{selectedReport.opd?.opdPatientsExamined || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cataract Surgeries:</span>
                    <span className="font-medium text-blue-600">{selectedReport.opd?.cataractSurgery || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waiting List:</span>
                    <span className="font-medium">{selectedReport.opd?.cataractWaiting || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
