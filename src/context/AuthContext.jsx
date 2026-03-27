import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'

const AuthContext = createContext(null)

// Demo fallback users (jab tak Firebase properly configure na ho)
const DEMO_USERS = [
  { email: 'admin.sairolotech@gmail.com', password: 'v9667146889V', name: 'SAI RoloTech Admin', role: 'Admin' },
  { email: 'admin@sairolotech.com', password: 'admin@123', name: 'Admin User', role: 'Admin' },
  { email: 'sales@sairolotech.com', password: 'sales@123', name: 'Sales User', role: 'Sales' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: 'User',
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      })
      return () => unsubscribe()
    } else {
      // Demo mode — check localStorage
      const saved = localStorage.getItem('crm_demo_user')
      if (saved) setUser(JSON.parse(saved))
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password)
        return { success: true }
      } catch (error) {
        let message = 'Login nahi ho saka. Dobara koshish karein.'
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential'
        ) {
          message = 'Galat Email ya Password hai.'
        } else if (error.code === 'auth/invalid-email') {
          message = 'Sahi email address likhein.'
        } else if (error.code === 'auth/too-many-requests') {
          message = 'Zyada koshishein ho gayi. Thodi der baad try karein.'
        }
        return { success: false, error: message }
      }
    } else {
      // Demo fallback
      const found = DEMO_USERS.find(
        (u) => u.email === email && u.password === password
      )
      if (found) {
        const userData = { id: found.email, name: found.name, email: found.email, role: found.role }
        setUser(userData)
        localStorage.setItem('crm_demo_user', JSON.stringify(userData))
        return { success: true }
      }
      return { success: false, error: 'Galat Email ya Password hai.' }
    }
  }

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth)
    } else {
      localStorage.removeItem('crm_demo_user')
      setUser(null)
    }
  }

  const recoverPassword = async (email) => {
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email)
        return {
          success: true,
          message: `Password reset email "${email}" par bhej diya gaya! Inbox check karein.`,
        }
      } catch (error) {
        return { success: false, error: 'Email send nahi ho saka. Sahi email likhein.' }
      }
    } else {
      const found = DEMO_USERS.find((u) => u.email === email)
      if (found) {
        return {
          success: true,
          message: `(Demo mode) Reset link ${email} par bheja gaya hota. Firebase configure karein real email ke liye.`,
        }
      }
      return { success: false, error: 'Yeh email register nahi hai.' }
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, recoverPassword, isFirebaseConfigured }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
