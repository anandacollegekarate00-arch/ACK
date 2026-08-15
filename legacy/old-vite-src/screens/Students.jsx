import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Edit3, Trash2 } from '../components/Icons'
import './Students.css'

const BELTS = [
  'White (10th Kyu)',
  'Yellow (9th Kyu)',
  'Orange (8th Kyu)',
  'Orange & Blue Stripe (7th Kyu)',
  'Blue (6th Kyu)',
  'Blue & Yellow Stripe (5th Kyu)',
  'Purple (4th Kyu)',
  'Purple & Yellow Stripe (3rd Kyu)',
  'Brown (2nd Kyu)',
  'Brown & Yellow Stripe (1st Kyu)',
]

export default function Students({ profile }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name')
    
    if (!error && data) {
      setStudents(data)
    }
    setLoading(false)
  }

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.belt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.grade?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setStudents(students.filter(s => s.id !== id))
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="screen">
      <header className="screen-header">
        <h1>Students</h1>
        <p>{students.length} registered</p>
      </header>

      <div className="screen-content">
        <div className="search-bar">
          <Search />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h2>{searchTerm ? 'No students found' : 'No students yet'}</h2>
            <p>{searchTerm ? 'Try a different search term' : 'Add your first student to get started'}</p>
          </div>
        ) : (
          <div className="students-list">
            {filteredStudents.map((student) => (
              <div key={student.id} className="student-card">
                <div className="student-avatar">
                  {student.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="student-info">
                  <h3>{student.name}</h3>
                  <p className="student-meta">
                    {student.belt} • Grade {student.grade}
                  </p>
                </div>
                <div className="student-actions">
                  <button
                    className="btn-icon"
                    onClick={() => setEditingStudent(student)}
                  >
                    <Edit3 />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => setDeleteConfirm(student)}
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="fab" onClick={() => setShowAddModal(true)}>
        <Plus />
      </button>

      {(showAddModal || editingStudent) && (
        <StudentModal
          student={editingStudent}
          onClose={() => {
            setShowAddModal(false)
            setEditingStudent(null)
          }}
          onSave={(student) => {
            loadStudents()
            setShowAddModal(false)
            setEditingStudent(null)
          }}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          student={deleteConfirm}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}

function StudentModal({ student, onClose, onSave }) {
  const [form, setForm] = useState(student || {
    name: '',
    full_name: '',
    dob: '',
    grade: '',
    belt: 'White (10th Kyu)',
    join_date: new Date().toISOString().split('T')[0],
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    if (student) {
      // Update existing
      const { error } = await supabase
        .from('students')
        .update(form)
        .eq('id', student.id)
      
      if (!error) onSave()
    } else {
      // Create new
      const { error } = await supabase
        .from('students')
        .insert([form])
      
      if (!error) onSave()
    }
    
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{student ? 'Edit Student' : 'Add Student'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label>Name *</label>
            <input
              required
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              value={form.full_name || ''}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="John Michael Doe"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                required
                value={form.dob || ''}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Grade *</label>
              <input
                required
                value={form.grade || ''}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Belt/Kyu *</label>
            <select
              value={form.belt || 'White (10th Kyu)'}
              onChange={(e) => setForm({ ...form, belt: e.target.value })}
            >
              {BELTS.map((belt) => (
                <option key={belt} value={belt}>
                  {belt}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Join Date *</label>
            <input
              type="date"
              required
              value={form.join_date || ''}
              onChange={(e) => setForm({ ...form, join_date: e.target.value })}
            />
          </div>

          <h3 className="section-title">Guardian Information</h3>

          <div className="form-group">
            <label>Guardian Name</label>
            <input
              value={form.guardian_name || ''}
              onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
              placeholder="Parent/Guardian"
            />
          </div>

          <div className="form-group">
            <label>Guardian Phone</label>
            <input
              type="tel"
              value={form.guardian_phone || ''}
              onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
              placeholder="+94 77 123 4567"
            />
          </div>

          <div className="form-group">
            <label>Guardian Email</label>
            <input
              type="email"
              value={form.guardian_email || ''}
              onChange={(e) => setForm({ ...form, guardian_email: e.target.value })}
              placeholder="parent@email.com"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : student ? 'Update' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ student, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Delete Student?</h3>
        <p>Are you sure you want to delete <strong>{student.name}</strong>? This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}
