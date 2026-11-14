import { useState, useEffect } from 'react'
import { getAchievement, saveCataractTargets } from '../services/api'
import Toast from '../components/Toast'
import { Trophy, Save, Target } from 'lucide-react'

export default function AchievementView() {
  const [year, setYear] = useState(2026)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadAchievement()
  }, [year])

  const loadAchievement = async () => {
    try {
      setLoading(true)
      const res = await getAchievement(year)
      setItems(res.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load achievement report' })
    } finally {
      setLoading(false)
    }
  }

  const handleTargetChange = (index, value) => {
    const updated = [...items]
    updated[index].cataractTarget = Number(value)
    // Recalculate percentage
    if (updated[index].cataractTarget > 0) {
      updated[index].achievementPercentage = (
        (updated[index].achievementCount * 100) /
        updated[index].cataractTarget
      ).toFixed(2)
    } else {
      updated[index].achievementPercentage = '0.00'
    }
    setItems(updated)
  }

  const handleSaveTargets = async () => {
    try {
      setSaving(true)
      const targetList = items.map((i) => ({
        doctorId: i.doctorId,
        targetCount: i.cataractTarget,
      }))
      await saveCataractTargets(year, targetList)
      setToast({ type: 'success', message: 'Cataract targets updated successfully' })
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save cataract targets' })
    } finally {
      setSaving(false)
    }
  }

  const totalTarget = items.reduce((acc, i) => acc + (i.cataractTarget || 0), 0)
  const totalAchievement = items.reduce((acc, i) => acc + (i.achievementCount || 0), 0)
  const overallPercentage = totalTarget > 0 ? ((totalAchievement * 100) / totalTarget).toFixed(2) : 0

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cataract Operation Achievement (Sheet 7)</h1>
          <p className="text-sm text-slate-500">
            Annual targets vs actual cataract surgeries performed (Auto-calculated formula: Achievement × 100 / Target)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none"
          >
            <option value={2026}>Fiscal Year 2026-27</option>
            <option value={2027}>Fiscal Year 2027-28</option>
          </select>

          <button
            onClick={handleSaveTargets}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Targets'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Annual Target</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalTarget}</h3>
          </div>
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
            <Target size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Surgeries Performed</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{totalAchievement}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Trophy size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">District Overall %</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{overallPercentage}%</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Trophy size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading achievement metrics...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Ophthalmic Officer</th>
                  <th className="px-6 py-3.5">Working Station</th>
                  <th className="px-6 py-3.5 text-center">Cataract Target</th>
                  <th className="px-6 py-3.5 text-center">Achievement</th>
                  <th className="px-6 py-3.5 text-center">Achievement %</th>
                  <th className="px-6 py-3.5 text-center">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((row, idx) => (
                  <tr key={row.doctorId} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{row.doctorName}</td>
                    <td className="px-6 py-3.5 text-slate-600">{row.workingStation}</td>
                    <td className="px-6 py-3.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={row.cataractTarget}
                        onChange={(e) => handleTargetChange(idx, e.target.value)}
                        className="w-24 px-2.5 py-1 text-center font-medium bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-blue-600">
                      {row.achievementCount}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                      {row.achievementPercentage}%
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="w-28 bg-slate-100 rounded-full h-2.5 mx-auto overflow-hidden">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, Number(row.achievementPercentage) || 0))}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
