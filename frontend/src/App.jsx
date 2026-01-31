import React from 'react'
import { Routes, Route, Navigate } from "react-router-dom"
import Registration from './Registration'
import Login from './Login'
import TodoDashboard from './TodoDashboard'
import AdminDashboard from './AdminDashboard'
import RequireAuth from './RequireAuth'


const App = () => {
  return (
    <>
      <Routes>
      <Route path ="/" element = {<Registration/>} />
      <Route path='/login' element = {<Login/>} />

      {/* user dashboard - any authenticated user */}
      <Route
        path='/dashboard'
        element={
          <RequireAuth>
            <TodoDashboard />
          </RequireAuth>
        }
      />

      {/* admin dashboard - admin only */}
      <Route
        path='/admin-dashboard'
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminDashboard />
          </RequireAuth>
        }
      />
      
      {/* fallback to registration */}
      <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
    

  )
}

export default App