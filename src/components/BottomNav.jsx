import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', icon: '🏠', label: 'Today' },
  { to: '/progress', icon: '📊', label: 'Progress' },
  { to: '/profile', icon: '👤', label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#1a1a1a] border-t border-[#2a2a2a] z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full text-xs gap-1 transition-colors ${
                isActive ? 'text-[#22c55e]' : 'text-gray-400'
              }`
            }
          >
            <span className="text-2xl leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
