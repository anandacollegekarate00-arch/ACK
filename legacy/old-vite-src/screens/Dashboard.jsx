import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

export default function Dashboard({ profile }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    attendanceRate: 0,
    totalPoints: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Get total students
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0]
      const { count: presentCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'present')

      // Get total achievement points
      const { data: achievements } = await supabase
        .from('achievements')
        .select('points')
      
      const totalPoints = achievements?.reduce((sum, a) => sum + (a.points || 0), 0) || 0

      // Calculate attendance rate (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: recentAttendance } = await supabase
        .from('attendance')
        .select('status')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

      const presentCount30 = recentAttendance?.filter(a => a.status === 'present').length || 0
      const totalRecords = recentAttendance?.length || 1
      const attendanceRate = ((presentCount30 / totalRecords) * 100).toFixed(1)

      setStats({
        totalStudents: studentCount || 0,
        presentToday: presentCount || 0,
        attendanceRate: parseFloat(attendanceRate) || 0,
        totalPoints,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {profile?.name || 'Coach'}!</p>
        </div>
      </header>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading stats...</p>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon students">👥</div>
              <div className="stat-value">{stats.totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon attendance">✓</div>
              <div className="stat-value">{stats.presentToday}</div>
              <div className="stat-label">Present Today</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon rate">📊</div>
              <div className="stat-value">{stats.attendanceRate}%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon points">🏆</div>
              <div className="stat-value">{stats.totalPoints}</div>
              <div className="stat-label">Total Points</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
