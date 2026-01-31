import React, { useEffect, useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { useNavigate } from 'react-router-dom'

function TodoDashboard() {
  const auth = useAuth()
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('Non-Urgent')
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ title: '', description: '', dueDate: '', category: 'Non-Urgent', completed: false })
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    try {
      const res = await auth.fetchWithAuth('http://localhost:4000/api/todos')
      if (!res.ok) {
        console.error('Failed fetching todos')
        setTodos([])
        return
      }
      const data = await res.json()
      setTodos(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createTodo(e) {
    e.preventDefault()
    if (!title) return
    try {
      const res = await auth.fetchWithAuth('http://localhost:4000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, dueDate: dueDate || undefined, category }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Create failed')
        return
      }
      setTitle('')
      setDescription('')
      setDueDate('')
      setCategory('Non-Urgent')
      load()
    } catch (err) {
      console.error(err)
    }
  }

  async function removeTodo(id) {
    if (!confirm('Delete this todo?')) return
    try {
      if (!auth || !auth.token) {
        alert('Not authenticated — please login again')
        navigate('/login', { replace: true })
        return
      }

      const res = await auth.fetchWithAuth(`http://localhost:4000/api/todos/${id}`, { method: 'DELETE' })

      // try to parse response body for a helpful message
      let body = null
      try { body = await res.json() } catch (e) { body = await res.text().catch(()=>null) }

      if (!res.ok) {
        console.error('Delete failed', { status: res.status, body })
        const msg = body && (body.error || (body.message || JSON.stringify(body)))
        alert(`Delete failed: ${res.status} ${msg || ''}`)
        return
      }

      // success
      load()
    } catch (err) {
      console.error('Network/error deleting todo:', err)
      alert('Delete failed: network error')
    }
  }

  function handleLogout() {
    auth.logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ maxWidth: 900, margin: '1rem auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Your Todos</h2>
        <div>
          {auth.role === 'admin' && (
            <button onClick={() => navigate('/admin-dashboard')} style={{ marginRight: 8 }}>Admin</button>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <form onSubmit={createTodo} style={{ marginBottom: 16 }}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{ width: '100%', padding:8, marginBottom:8 }} maxLength={100} />
        <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} style={{ width:'100%', padding:8, marginBottom:8 }} maxLength={500} />
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
          <select value={category} onChange={e=>setCategory(e.target.value)}>
            <option>Urgent</option>
            <option>Non-Urgent</option>
          </select>
        </div>
        <button type="submit">Create Todo</button>
      </form>

      {loading ? <div>Loading...</div> : (
        <div>
          {todos.length === 0 ? <div>No todos yet.</div> : (
            todos.map(t => (
              <div key={t._id || t.id} style={{ border:'1px solid #ddd', padding:8, marginBottom:8 }}>
                {editingId === (t._id || t.id) ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    try {
                      const res = await auth.fetchWithAuth(`http://localhost:4000/api/todos/${editingId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editValues)
                      })
                      if (!res.ok) { const err = await res.json().catch(()=>({})); alert(err.error || 'Update failed'); return }
                      setEditingId(null)
                      load()
                    } catch (err) { console.error(err) }
                  }}>
                    <input value={editValues.title} onChange={e=>setEditValues(v=>({...v, title: e.target.value}))} style={{ width: '100%', padding:8, marginBottom:8 }} maxLength={100} />
                    <textarea value={editValues.description} onChange={e=>setEditValues(v=>({...v, description: e.target.value}))} style={{ width:'100%', padding:8, marginBottom:8 }} maxLength={500} />
                    <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                      <input type="date" value={editValues.dueDate ? editValues.dueDate.split('T')[0] : ''} onChange={e=>setEditValues(v=>({...v, dueDate: e.target.value}))} />
                      <select value={editValues.category} onChange={e=>setEditValues(v=>({...v, category: e.target.value}))}>
                        <option>Urgent</option>
                        <option>Non-Urgent</option>
                      </select>
                      <label style={{ display:'flex', alignItems:'center', gap:6 }}><input type="checkbox" checked={editValues.completed} onChange={e=>setEditValues(v=>({...v, completed: e.target.checked}))} /> Completed</label>
                    </div>
                    <div>
                      <button type="submit">Save</button>
                      <button type="button" onClick={()=>setEditingId(null)} style={{ marginLeft:8 }}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ fontWeight: 'bold' }}>{t.title} {t.category ? `(${t.category})` : ''}</div>
                    <div>{t.description}</div>
                    <div>Due: {t.dueDate ? new Date(t.dueDate).toLocaleString() : '—'}</div>
                    <div>By: {t.user && (t.user.username || t.user.email)}</div>
                    <div style={{ marginTop:8 }}>
                      <button onClick={()=>{ setEditingId(t._id || t.id); setEditValues({ title: t.title||'', description: t.description||'', dueDate: t.dueDate||'', category: t.category||'Non-Urgent', completed: !!t.completed }) }}>Edit</button>
                      <button onClick={()=>removeTodo(t._id || t.id)} style={{ marginLeft:8 }}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default TodoDashboard