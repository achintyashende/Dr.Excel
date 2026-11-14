import { useState, useEffect } from 'react'
import { getCampProgramme, saveCampProgramme, getPeriods } from '../services/api'
import Toast from '../components/Toast'
import { Calendar, Plus, Save, Trash2 } from 'lucide-react'

const WEEKDAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

export default function CampProgramme() {
  const [periods, setPeriods] = useState([])
  const [selectedPeriodId, setSelectedPeriodId] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadPeriods()
  }, [])

  useEffect(() => {
    if (selectedPeriodId) {
      loadCamp(selectedPeriodId)
    }
  }, [selectedPeriodId])

  const loadPeriods = async () => {
    try {
      const res = await getPeriods()
      setPeriods(res.data || [])
      if (res.data?.length > 0) {
        setSelectedPeriodId(res.data[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadCamp = async (periodId) => {
    try {
      setLoading(true)
      const res = await getCampProgramme(periodId)
      setEntries(res.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load camp programme' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddRow = () => {
    const maxDay = entries.reduce((max, e) => Math.max(max, Number(e.dayNumber) || 0), 0)
    const nextDay = maxDay + 1
    setEntries([
      ...entries,
      {
        dayNumber: nextDay,
        weekday: 'MONDAY',
        hospitalName: 'G.H.AMRAVATI OPD',
        admissionDate: '2026-05-01',
        surgeryDate: '2026-05-02',
        surgeryLocation: 'G.H. Amravati',
      },
    ])
  }

  const handleChange = (index, field, value) => {
    const updated = [...entries]
    updated[index][field] = value

    // If admission date changed, automatically suggest the correct weekday
    if (field === 'admissionDate' && value) {
      try {
        const dateObj = new Date(value + 'T00:00:00')
        const dayIdx = dateObj.getDay() // 0=Sunday, 1=Monday...
        const mapDay = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
        updated[index].weekday = mapDay[dayIdx]
      } catch (e) {
        // ignore parse error
      }
    }

    setEntries(updated)
  }

  const handleDelete = (index) => {
    setEntries(entries.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!selectedPeriodId) return
    try {
      setSaving(true)
      const sanitized = entries.map((entry, idx) => ({
        ...entry,
        dayNumber: Number(entry.dayNumber) || (idx + 1),
      }))
      await saveCampProgramme(selectedPeriodId, sanitized)
      setToast({ type: 'success', message: 'Camp programme schedule saved successfully' })
      loadCamp(selectedPeriodId)
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to save camp programme' })
    } finally {
      setSaving(false)
    }
  }

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
          <h1 className="text-2xl font-bold text-slate-800">Cataract Camp Programme (Sheet 6)</h1>
          <p className="text-sm text-slate-500">Central monthly schedule for cataract surgery eye camps</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                Period: {p.month}/{p.year} ({p.status})
              </option>
            ))}
          </select>

          <button
            onClick={handleAddRow}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus size={16} /> Add Day
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading camp programme...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p>No camp days scheduled yet for this period. Click "Add Day" to add entries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 w-16">Day #</th>
                  <th className="px-4 py-3">Weekday</th>
                  <th className="px-4 py-3">Hospital / PHC / RH</th>
                  <th className="px-4 py-3">Admission Date</th>
                  <th className="px-4 py-3">Surgery Date</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {entries.map((entry, index) => (
                  <tr key={index} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 font-bold text-slate-700">
                      <input
                        type="number"
                        value={entry.dayNumber}
                        onChange={(e) => handleChange(index, 'dayNumber', Number(e.target.value))}
                        className="w-12 px-2 py-1 border rounded text-center"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={(entry.weekday || 'MONDAY').toUpperCase()}
                        onChange={(e) => handleChange(index, 'weekday', e.target.value)}
                        className="w-32 px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {WEEKDAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={entry.hospitalName || ''}
                        onChange={(e) => handleChange(index, 'hospitalName', e.target.value)}
                        className="w-full min-w-48 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="date"
                        value={entry.admissionDate || ''}
                        onChange={(e) => handleChange(index, 'admissionDate', e.target.value)}
                        className="px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="date"
                        value={entry.surgeryDate || ''}
                        onChange={(e) => handleChange(index, 'surgeryDate', e.target.value)}
                        className="px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={entry.surgeryLocation || ''}
                        onChange={(e) => handleChange(index, 'surgeryLocation', e.target.value)}
                        className="w-36 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-1 text-red-500 hover:text-red-700 rounded transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
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
