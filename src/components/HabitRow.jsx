export default function HabitRow({ label, subtext, done, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3 py-3 text-left active:opacity-70 transition-opacity"
    >
      <span
        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          done ? 'bg-[#22c55e] border-[#22c55e]' : 'border-[#6b7280] bg-transparent'
        }`}
      >
        {done && (
          <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm transition-colors ${
            done ? 'text-gray-400 line-through' : 'text-white'
          }`}
        >
          {label}
        </div>
        {subtext && (
          <div className="text-xs text-gray-500 mt-0.5">{subtext}</div>
        )}
      </div>
    </button>
  )
}
