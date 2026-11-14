import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'

// Pages
import LoginPage from './pages/LoginPage'
import DoctorDashboard from './pages/DoctorDashboard'
import MonthlyReportForm from './pages/MonthlyReportForm'
import ReportHistory from './pages/ReportHistory'
import SeniorDashboard from './pages/SeniorDashboard'
import DoctorDetailView from './pages/DoctorDetailView'
import CampProgramme from './pages/CampProgramme'
import AchievementView from './pages/AchievementView'
import ExcelExport from './pages/ExcelExport'
import UserManagement from './pages/UserManagement'

function ProtectedRoute({ children, requireSenior = false }) {
  const { isAuthenticated, isSenior, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-sm font-medium text-slate-500 animate-pulse">
          Loading Dr.Excel...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireSenior && !isSenior) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="report" element={<MonthlyReportForm />} />
            <Route path="report/history" element={<ReportHistory />} />

            {/* Senior Only Routes */}
            <Route
              path="senior"
              element={
                <ProtectedRoute requireSenior>
                  <SeniorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="senior/doctors/:doctorId"
              element={
                <ProtectedRoute requireSenior>
                  <DoctorDetailView />
                </ProtectedRoute>
              }
            />
            <Route
              path="senior/camp"
              element={
                <ProtectedRoute requireSenior>
                  <CampProgramme />
                </ProtectedRoute>
              }
            />
            <Route
              path="senior/achievement"
              element={
                <ProtectedRoute requireSenior>
                  <AchievementView />
                </ProtectedRoute>
              }
            />
            <Route
              path="senior/export"
              element={
                <ProtectedRoute requireSenior>
                  <ExcelExport />
                </ProtectedRoute>
              }
            />
            <Route
              path="senior/users"
              element={
                <ProtectedRoute requireSenior>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
