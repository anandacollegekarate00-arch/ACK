import './Profile.css'

export default function Profile({ profile, onSignOut }) {
  return (
    <div className="screen">
      <header className="screen-header">
        <h1>Profile</h1>
        <p>Account settings</p>
      </header>
      <div className="screen-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {profile?.name?.charAt(0)?.toUpperCase() || '👤'}
          </div>
          <h2>{profile?.name || 'Coach'}</h2>
          <p className="profile-role">{profile?.role || 'Coach'}</p>
          
          <button className="sign-out-button" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
