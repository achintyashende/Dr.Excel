export default function Modal({
  open,
  isOpen,
  title,
  children,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  confirmVariant = 'primary', // 'danger' | 'warning' | 'success' | 'primary'
}) {
  const isVisible = open !== undefined ? open : isOpen
  if (!isVisible) return null

  const getButtonClass = () => {
    if (danger || confirmVariant === 'danger') {
      return 'bg-red-600 hover:bg-red-700 text-white'
    }
    if (confirmVariant === 'warning') {
      return 'bg-amber-600 hover:bg-amber-700 text-white'
    }
    if (confirmVariant === 'success') {
      return 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity backdrop-blur-xs"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 z-10 space-y-4 border border-slate-100">
        {title && (
          <h3 className="text-lg font-bold text-slate-800">
            {title}
          </h3>
        )}

        {message && (
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>
        )}

        {children && <div className="text-sm text-slate-600">{children}</div>}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors shadow-sm ${getButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
