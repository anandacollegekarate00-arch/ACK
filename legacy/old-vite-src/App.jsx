import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import Students from './screens/Students'
import Attendance from './screens/Attendance'
import Achievements from './screens/Achievements'
import Analytics from './screens/Analytics'
import Profile from './screens/Profile'
import BottomNav from './components/BottomNav'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!error && data) {
      setProfile(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard profile={profile} />
      case 'students':
        return <Students profile={profile} />
      case 'attendance':
        return <Attendance profile={profile} />
      case 'achievements':
        return <Achievements profile={profile} />
      case 'analytics':
        return <Analytics profile={profile} />
      case 'profile':
        return <Profile profile={profile} onSignOut={handleSignOut} />
      default:
        return <Dashboard profile={profile} />
    }
  }

  return (
    <div className="app-container">
      <div className="main-content">
        {renderScreen()}
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default App
