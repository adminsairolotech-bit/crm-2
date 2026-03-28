import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import InquiryForm from './pages/InquiryForm'
import Customers from './pages/Customers'
import Leads from './pages/Leads'
import MachineReport from './pages/MachineReport'
import PLCErrors from './pages/PLCErrors'
import PNMGLoan from './pages/PNMGLoan'
import AIQuestions from './pages/AIQuestions'
import BuddyBot from './pages/BuddyBot'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/inquiry" element={<InquiryForm />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
        <Route path="/machine-report" element={<ProtectedRoute><MachineReport /></ProtectedRoute>} />
        <Route path="/plc-errors" element={<ProtectedRoute><PLCErrors /></ProtectedRoute>} />
        <Route path="/pnmg-loan" element={<ProtectedRoute><PNMGLoan /></ProtectedRoute>} />
        <Route path="/ai-questions" element={<ProtectedRoute><AIQuestions /></ProtectedRoute>} />
        <Route path="/buddy-bot" element={<ProtectedRoute><BuddyBot /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
