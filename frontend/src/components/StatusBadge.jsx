const variants = {
  DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  SUBMITTED: 'bg-green-100 text-green-800 border-green-300',
  PENDING: 'bg-slate-100 text-slate-600 border-slate-300',
  REOPENED: 'bg-orange-100 text-orange-800 border-orange-300',
}

export default function StatusBadge({ status }) {
  const classes = variants[status] || variants.PENDING

  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 text-xs font-semibold rounded-full border ${classes}`}
    >
      {status}
    </span>
  )
}
