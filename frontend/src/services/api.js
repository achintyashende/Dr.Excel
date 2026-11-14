import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ────────────────────────────────────────────────────────────
export const login = (username, password) =>
  api.post('/auth/login', { username, password })

export const changePassword = (oldPassword, newPassword) =>
  api.post('/auth/change-password', { oldPassword, newPassword })

// ─── Doctor APIs ─────────────────────────────────────────────────────
export const getProfile = () => api.get('/doctor/profile')

export const getMyReport = (month, year) =>
  api.get('/doctor/reports', { params: { month, year } })

export const savePatient40Plus = (periodId, data) =>
  api.put(`/doctor/reports/${periodId}/40plus`, data)

export const saveOpd = (periodId, data) =>
  api.put(`/doctor/reports/${periodId}/opd`, data)

export const saveSchool = (periodId, data) =>
  api.put(`/doctor/reports/${periodId}/school`, data)

export const saveExtension = (periodId, data) =>
  api.put(`/doctor/reports/${periodId}/extension`, data)

export const addStudentRecord = (periodId, data) =>
  api.post(`/doctor/reports/${periodId}/students`, data)

export const updateStudentRecord = (periodId, studentId, data) =>
  api.put(`/doctor/reports/${periodId}/students/${studentId}`, data)

export const deleteStudentRecord = (periodId, studentId) =>
  api.delete(`/doctor/reports/${periodId}/students/${studentId}`)

export const submitReport = (periodId) =>
  api.post(`/doctor/reports/${periodId}/submit`)

export const getReportHistory = () => api.get('/doctor/reports/history')

// ─── Senior APIs ─────────────────────────────────────────────────────
export const getDashboard = (month, year) =>
  api.get('/senior/dashboard', { params: { month, year } })

export const getAllReports = (month, year) =>
  api.get('/senior/reports', { params: { month, year } })

export const getDoctorReport = (doctorId, month, year) =>
  api.get(`/senior/reports/${doctorId}`, { params: { month, year } })

export const saveCampProgramme = (periodId, entries) =>
  api.put(`/senior/camp/${periodId}`, entries)

export const getCampProgramme = (periodId) =>
  api.get(`/senior/camp/${periodId}`)

export const saveCataractTargets = (year, targets) =>
  api.put(`/senior/targets/${year}`, targets)

export const getAchievement = (year) =>
  api.get('/senior/achievement', { params: { year } })

export const reopenReport = (reportId) =>
  api.post(`/senior/reports/${reportId}/reopen`)

export const exportExcel = (month, year) =>
  api.get('/senior/export', { params: { month, year }, responseType: 'blob' })

export const getUsers = () => api.get('/senior/users')

export const createUser = (data) => api.post('/senior/users', data)

export const updateUser = (id, data) => api.put(`/senior/users/${id}`, data)

export const deactivateUser = (id) => api.delete(`/senior/users/${id}`)

export const activateUser = (id) => api.post(`/senior/users/${id}/activate`)

export const resetPassword = (id) =>
  api.post(`/senior/users/${id}/reset-password`)

export const getPeriods = () => api.get('/senior/periods')

export const createPeriod = (data) => api.post('/senior/periods', data)

export const closePeriod = (id) => api.put(`/senior/periods/${id}/close`)

export const reopenPeriod = (id) => api.put(`/senior/periods/${id}/reopen`)
