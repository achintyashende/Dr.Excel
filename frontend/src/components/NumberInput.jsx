export default function NumberInput({
  label,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  min = 0,
  className = '',
}) {
  const handleChange = (e) => {
    const val = e.target.value
    if (val === '') {
      onChange(0)
      return
    }
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= min) {
      onChange(num)
    }
  }

  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg p-3 ${className}`}
    >
      <label className="block text-xs font-medium text-slate-500 mb-1 truncate">
        {label}
      </label>
      <input
        type="number"
        min={min}
        value={value ?? 0}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full text-lg font-semibold text-slate-800 bg-transparent border-0 outline-none focus:ring-0 p-0
          ${readOnly ? 'text-blue-700 cursor-default' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  )
}
