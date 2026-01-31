(async ()=>{
  try {
    const loginResp = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin', password: 'AdminPass123' })
    })
    const login = await loginResp.json()
    console.log('LOGIN', login)
    const token = login.token

    const createResp = await fetch('http://localhost:4000/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: 'temp-delete', description: 'temp', dueDate: new Date().toISOString(), category: 'Urgent' })
    })
    const created = await createResp.json()
    console.log('CREATED', created)

    const tid = created._id || created.id
    const delResp = await fetch(`http://localhost:4000/api/todos/${tid}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const deleted = await delResp.json()
    console.log('DELETED', deleted)
  } catch (e) {
    console.error('ERROR', e)
    process.exit(1)
  }
})()
