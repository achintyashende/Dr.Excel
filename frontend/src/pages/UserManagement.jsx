import { useState, useEffect } from 'react'
import {
  getUsers,
  createUser,
  deactivateUser,
  activateUser,
  resetPassword,
  getPeriods,
  createPeriod,
  closePeriod,
  reopenPeriod,
} from '../services/api'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import {
  Users,
  UserPlus,
  Key,
  Ban,
  Calendar,
  Plus,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // New user modal form state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'DOCTOR',
    doctorName: '',
    workingStation: '',
    block: '',
    facilityType: 'PHC',
  })

  // New period form state
  const [newMonth, setNewMonth] = useState(5)
  const [newYear, setNewYear] = useState(2026)

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmVariant: 'primary',
    action: null,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [uRes, pRes] = await Promise.all([getUsers(), getPeriods()])
      setUsers(uRes.data || [])
      setPeriods(pRes.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load user and period data' })
    } finally {
      setLoading(false)
    }
  }

  const closeConfirmModal = () => {
    setConfirmModal({
      open: false,
      title: '',
      message: '',
      confirmText: 'Confirm',
      confirmVariant: 'primary',
      action: null,
    })
  }

  // 1. Create User
  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await createUser(newUser)
      setToast({ type: 'success', message: 'Doctor account created successfully' })
      setShowAddModal(false)
      setNewUser({
        username: '',
        password: '',
        role: 'DOCTOR',
        doctorName: '',
        workingStation: '',
        block: '',
        facilityType: 'PHC',
      })
      loadData()
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to create user' })
    }
  }

  // 2. Block / Deactivate User with Confirmation
  const confirmBlockUser = (u) => {
    setConfirmModal({
      open: true,
      title: `Block Doctor Access?`,
      message: `Are you sure you want to block ${u.doctorName || u.username} (${u.username})? They will be immediately locked out and cannot log in or enter reports.`,
      confirmText: 'Yes, Block Doctor',
      confirmVariant: 'danger',
      action: async () => {
        try {
          await deactivateUser(u.id)
          setToast({ type: 'success', message: `Access blocked for ${u.username}` })
          loadData()
        } catch (err) {
          setToast({ type: 'error', message: 'Failed to block doctor' })
        }
      },
    })
  }

  // 3. Unblock / Restore User with Confirmation
  const confirmRestoreUser = (u) => {
    setConfirmModal({
      open: true,
      title: `Restore Access for Doctor?`,
      message: `Do you want to restore and reactivate login access for ${u.doctorName || u.username} (${u.username})? They will be able to log in and fill their monthly reports again.`,
      confirmText: 'Yes, Restore Access',
      confirmVariant: 'success',
      action: async () => {
        try {
          await activateUser(u.id)
          setToast({ type: 'success', message: `Access restored for ${u.username}!` })
          loadData()
        } catch (err) {
          setToast({ type: 'error', message: 'Failed to restore access' })
        }
      },
    })
  }

  // 4. Reset Password with Confirmation
  const confirmResetPassword = (u) => {
    setConfirmModal({
      open: true,
      title: `Reset Password for ${u.username}?`,
      message: `This will reset the password for ${u.doctorName || u.username} back to the default temporary password: Doctor@123. Are you sure?`,
      confirmText: 'Reset Password',
      confirmVariant: 'primary',
      action: async () => {
        try {
          await resetPassword(u.id)
          setToast({
            type: 'success',
            message: `Password for ${u.username} reset to Doctor@123`,
          })
        } catch (err) {
          setToast({ type: 'error', message: 'Failed to reset password' })
        }
      },
    })
  }

  // 5. Close Reporting Window with Confirmation
  const confirmClosePeriod = (p) => {
    setConfirmModal({
      open: true,
      title: `Close Reporting Window for ${p.month}/${p.year}?`,
      message: `Closing this reporting period will prevent all doctors from entering or modifying their monthly data for ${p.month}/${p.year}. You can reopen it at any time if needed.`,
      confirmText: 'Yes, Close Window',
      confirmVariant: 'warning',
      action: async () => {
        try {
          await closePeriod(p.id)
          setToast({ type: 'success', message: `Reporting window for ${p.month}/${p.year} closed` })
          loadData()
        } catch (err) {
          setToast({ type: 'error', message: 'Failed to close period' })
        }
      },
    })
  }

  // 6. Reopen Reporting Window with Confirmation
  const confirmReopenPeriod = (p) => {
    setConfirmModal({
      open: true,
      title: `Reopen Reporting Window for ${p.month}/${p.year}?`,
      message: `Reopening this period will allow doctors to continue entering, correcting, and submitting their monthly reports for ${p.month}/${p.year}.`,
      confirmText: 'Yes, Reopen Window',
      confirmVariant: 'primary',
      action: async () => {
        try {
          await reopenPeriod(p.id)
          setToast({ type: 'success', message: `Reporting window for ${p.month}/${p.year} reopened!` })
          loadData()
        } catch (err) {
          setToast({ type: 'error', message: 'Failed to reopen period' })
        }
      },
    })
  }

  // 7. Create New Period
  const handleCreatePeriod = async () => {
    try {
      await createPeriod({ month: newMonth, year: newYear })
      setToast({ type: 'success', message: `Period ${newMonth}/${newYear} opened successfully` })
      loadData()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to create period' })
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User & Period Management</h1>
          <p className="text-sm text-slate-500">
            Manage doctor credentials, access permissions, and monthly reporting cycles
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <UserPlus size={16} /> Add Doctor Account
        </button>
      </div>

      {/* Reporting Periods Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              Reporting Periods (Monthly Windows)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Doctors can only submit data for OPEN reporting windows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={newMonth}
              onChange={(e) => setNewMonth(Number(e.target.value))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  Month {m}
                </option>
              ))}
            </select>
            <select
              value={newYear}
              onChange={(e) => setNewYear(Number(e.target.value))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
            <button
              onClick={handleCreatePeriod}
              className="px-3.5 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus size={14} /> Open Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {periods.map((p) => (
            <div
              key={p.id}
              className={`p-4 rounded-xl border transition-all ${
                p.status === 'OPEN'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              } flex items-center justify-between`}
            >
              <div>
                <p className="font-bold text-slate-800 text-base">
                  Month {p.month} / {p.year}
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 text-[11px] font-bold rounded-full ${
                    p.status === 'OPEN'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {p.status === 'OPEN' ? 'ACTIVE & OPEN' : 'CLOSED'}
                </span>
              </div>

              <div>
                {p.status === 'OPEN' ? (
                  <button
                    onClick={() => confirmClosePeriod(p)}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Close Window
                  </button>
                ) : (
                  <button
                    onClick={() => confirmReopenPeriod(p)}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={12} /> Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Doctor Accounts & Permissions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total {users.length} registered system users
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Username</th>
                  <th className="px-6 py-3.5">Doctor Name</th>
                  <th className="px-6 py-3.5">Facility / Station</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions & Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800">
                      {u.username}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {u.doctorName || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {u.workingStation || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                          u.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.active ? 'Active' : 'Blocked / Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => confirmResetPassword(u)}
                          title="Reset Password to Doctor@123"
                          className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <Key size={13} /> Reset PW
                        </button>

                        {u.active ? (
                          <button
                            onClick={() => confirmBlockUser(u)}
                            title="Block doctor login access"
                            className="px-2.5 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <Ban size={13} /> Block
                          </button>
                        ) : (
                          <button
                            onClick={() => confirmRestoreUser(u)}
                            title="Unblock and restore login access"
                            className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <CheckCircle size={13} /> Unblock / Restore Access
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

      {/* General Safety Action Confirmation Modal */}
      <Modal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={async () => {
          if (confirmModal.action) {
            await confirmModal.action()
          }
          closeConfirmModal()
        }}
        onCancel={closeConfirmModal}
      />

      {/* Add Doctor Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Create New Doctor Account</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add an individual login credential for an ophthalmic officer.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kiran.chavan"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor / Officer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DR. KIRAN CHAVAN"
                  value={newUser.doctorName}
                  onChange={(e) => setNewUser({ ...newUser, doctorName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Working Station / Facility</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. R.H DHAMANGAON RAILWAY"
                  value={newUser.workingStation}
                  onChange={(e) => setNewUser({ ...newUser, workingStation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Block / Taluka</label>
                  <input
                    type="text"
                    placeholder="e.g. DHAMANGAON"
                    value={newUser.block}
                    onChange={(e) => setNewUser({ ...newUser, block: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Type</label>
                  <select
                    value={newUser.facilityType}
                    onChange={(e) => setNewUser({ ...newUser, facilityType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RH">Rural Hospital (RH)</option>
                    <option value="PHC">Primary Health Centre (PHC)</option>
                    <option value="SDH">Sub-District Hospital (SDH)</option>
                    <option value="DH">District Hospital (DH)</option>
                    <option value="DWH">District Women Hospital (DWH)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
