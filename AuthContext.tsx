import React, { createContext, useContext, useState, useEffect } from 'react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface AuthContextType {
  user: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name: string, role: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('ayurnutri_user')
        const storedToken = localStorage.getItem('ayurnutri_token')
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          
          // Also ensure access_token is available for API calls
          if (!localStorage.getItem('access_token')) {
            localStorage.setItem('access_token', storedToken)
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
        // Clear invalid stored data
        localStorage.removeItem('ayurnutri_user')
        localStorage.removeItem('ayurnutri_token')
        localStorage.removeItem('access_token')
      } finally {
        setLoading(false)
      }
    }
    
    checkSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // First try demo credentials for testing
      const demoUsers = {
        'patient@demo.com': { id: 'patient-1', email: 'patient@demo.com', name: 'Demo Patient', role: 'patient' },
        'dietitian@demo.com': { id: 'dietitian-1', email: 'dietitian@demo.com', name: 'Dr. Demo Dietitian', role: 'dietitian' }
      }
      
      if (password === 'demo123' && demoUsers[email as keyof typeof demoUsers]) {
        const userData = demoUsers[email as keyof typeof demoUsers]
        const mockToken = `mock_token_${Date.now()}`
        
        // Store in localStorage
        localStorage.setItem('ayurnutri_user', JSON.stringify(userData))
        localStorage.setItem('ayurnutri_token', mockToken)
        localStorage.setItem('access_token', mockToken)
        
        setUser(userData)
        
        return {
          user: userData,
          session: { access_token: mockToken }
        }
      }

      // Try server authentication for real users
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed')
      }
      
      // Store in localStorage
      localStorage.setItem('ayurnutri_user', JSON.stringify(result.user))
      localStorage.setItem('ayurnutri_token', result.access_token)
      localStorage.setItem('access_token', result.access_token)
      
      setUser(result.user)
      
      return {
        user: result.user,
        session: { access_token: result.access_token }
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string, role: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name, role })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      
      return result
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Clear stored data
      localStorage.removeItem('ayurnutri_user')
      localStorage.removeItem('ayurnutri_token')
      localStorage.removeItem('access_token')
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}