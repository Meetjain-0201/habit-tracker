const TYPE_STYLES = {
  success: 'bg-[#22c55e] text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-yellow-600 text-white',
}

const ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
}

function ToastItem({ toast, onDismiss }) {
  const style = TYPE_STYLES[toast.type] ?? TYPE_STYLES.info
  const icon = ICONS[toast.type] ?? ICONS.info

  return (
    <div
      role="alert"
      onClick={() => onDismiss(toast.id)}
      className={`pointer-events-auto cursor-pointer flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium toast-in transition-all duration-200 ${
        toast.dismissing ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
      } ${style}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={(e) => {
          e.stopPropagation()
          onDismiss(toast.id)
        }}
        className="text-white/80 hover:text-white text-lg leading-none px-1"
      >
        ×
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-[400px] pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
