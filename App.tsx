import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './components/AuthContext'
import { LandingPage } from './components/LandingPage'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'
import { PatientDashboard } from './components/PatientDashboard'
import { DietitianDashboard } from './components/DietitianDashboard'
import { PrakritiAssessment } from './components/PrakritiAssessment'
import { DietPlan } from './components/DietPlan'
import { BookAppointment } from './components/BookAppointment'
import { ProgressTracking } from './components/ProgressTracking'
import { Toaster } from './components/ui/sonner'
import exampleImage from 'figma:asset/4f4006fd1025214acdcb7d7e436b5d3c3b265ccb.png'

type Page = 'landing' | 'login' | 'register' | 'patient-dashboard' | 'dietitian-dashboard' | 
           'prakriti-assessment' | 'diet-plan' | 'book-appointment' | 'progress-tracking'

interface User {
  id: string
  email: string
  name?: string
  role: string
}

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [userRole, setUserRole] = useState<string>('patient')
  const [authToken, setAuthToken] = useState<string>('')

  useEffect(() => {
    if (user && authToken) {
      // Redirect based on user role
      if (userRole === 'dietitian') {
        setCurrentPage('dietitian-dashboard')
      } else {
        setCurrentPage('patient-dashboard')
      }
    } else if (!loading && !user) {
      setCurrentPage('landing')
    }
  }, [user, userRole, authToken, loading])

  const handleAuth = (userData: any, token: string, role: string) => {
    setUserRole(role)
    setAuthToken(token)
    
    if (role === 'dietitian') {
      setCurrentPage('dietitian-dashboard')
    } else {
      setCurrentPage('patient-dashboard')
    }
  }

  const handleNavigation = (page: Page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading AyurNutri...</p>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigation} />
      
      case 'login':
        return <LoginForm onAuth={handleAuth} onNavigate={handleNavigation} />
      
      case 'register':
        return <RegisterForm onAuth={handleAuth} onNavigate={handleNavigation} />
      
      case 'patient-dashboard':
        return <PatientDashboard onNavigate={handleNavigation} user={user} token={authToken} />
      
      case 'dietitian-dashboard':
        return <DietitianDashboard onNavigate={handleNavigation} user={user} token={authToken} />
      
      case 'prakriti-assessment':
        return <PrakritiAssessment onNavigate={handleNavigation} user={user} token={authToken} />
      
      case 'diet-plan':
        return <DietPlan onNavigate={handleNavigation} user={user} token={authToken} />
      
      case 'book-appointment':
        return <BookAppointment onNavigate={handleNavigation} user={user} token={authToken} />
      
      case 'progress-tracking':
        return <ProgressTracking onNavigate={handleNavigation} user={user} token={authToken} />
      
      default:
        return <LandingPage onNavigate={handleNavigation} />
    }
  }

  return (
    <div className="size-full">
      {renderPage()}
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}