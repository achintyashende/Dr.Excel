import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  const styles =
    type === 'success'
      ? 'bg-green-50 border-green-400 text-green-800'
      : 'bg-red-50 border-red-400 text-red-800'

  const Icon = type === 'success' ? CheckCircle : AlertCircle

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles}`}
      >
        <Icon size={18} />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setVisible(false)
            onClose?.()
          }}
          className="ml-2 hover:opacity-70"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
