import './BottomNav.css'
import { Home, Users, Calendar, Trophy, PieChart, User } from './Icons'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', Icon: Home },
  { id: 'students', label: 'Students', Icon: Users },
  { id: 'attendance', label: 'Attendance', Icon: Calendar },
  { id: 'achievements', label: 'Awards', Icon: Trophy },
  { id: 'analytics', label: 'Analytics', Icon: PieChart },
  { id: 'profile', label: 'Profile', Icon: User },
]

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id
        const Icon = item.Icon
        
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="nav-icon">
              <Icon />
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
