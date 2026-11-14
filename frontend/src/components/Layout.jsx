import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  FileText,
  History,
  Users,
  Calendar,
  Trophy,
  Download,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

const doctorLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/report', label: 'Monthly Report', icon: FileText },
  { to: '/report/history', label: 'History', icon: History },
]

const seniorLinks = [
  { to: '/senior', label: 'Senior Dashboard', icon: LayoutDashboard },
  { to: '/senior/camp', label: 'Camp Programme', icon: Calendar },
  { to: '/senior/achievement', label: 'Achievement', icon: Trophy },
  { to: '/senior/export', label: 'Excel Export', icon: Download },
  { to: '/senior/users', label: 'User Management', icon: Users },
]

function SidebarLink({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout, isSenior } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 flex flex-col transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Dr<span className="text-blue-400">.Excel</span>
          </h1>
          <button
            onClick={closeSidebar}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Doctor links always visible */}
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Doctor
          </p>
          {doctorLinks.map((link) => (
            <SidebarLink key={link.to} {...link} onClick={closeSidebar} />
          ))}

          {/* Senior links only for seniors */}
          {isSenior && (
            <>
              <div className="my-4 border-t border-slate-700" />
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Senior
              </p>
              {seniorLinks.map((link) => (
                <SidebarLink key={link.to} {...link} onClick={closeSidebar} />
              ))}
            </>
          )}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-slate-700">
          <div className="text-sm text-slate-300 truncate">
            {user?.doctorName || user?.username}
          </div>
          <div className="text-xs text-slate-500 capitalize">
            {user?.role?.toLowerCase()}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-600 hover:text-slate-800"
          >
            <Menu size={24} />
          </button>

          <div className="hidden lg:block" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                {(user?.doctorName || user?.username || 'U')[0].toUpperCase()}
              </div>
              <span className="hidden sm:inline font-medium">
                {user?.doctorName || user?.username}
              </span>
              <ChevronDown size={16} />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
