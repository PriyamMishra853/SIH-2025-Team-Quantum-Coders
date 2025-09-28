import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  Leaf, User, Calendar, Brain, Heart, TrendingUp, 
  LogOut, Settings, FileText, Clock, CheckCircle
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface PatientDashboardProps {
  user: any
  token: string
  onNavigate: (page: string) => void
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ 
  user, token, onNavigate 
}) => {
  const [profile, setProfile] = useState<any>(null)
  const [prakritiAnalysis, setPrakritiAnalysis] = useState<any>(null)
  const [dietPlan, setDietPlan] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    if (!token || !user) return

    try {
      // Load profile
      const profileResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/user/profile`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData)
      }

      // Load prakriti analysis
      const prakritiResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/prakriti/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (prakritiResponse.ok) {
        const analysis = await prakritiResponse.json()
        setPrakritiAnalysis(analysis)
      }

      // Load diet plan
      const dietResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/diet-plan/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (dietResponse.ok) {
        const planData = await dietResponse.json()
        setDietPlan(planData)
      }

      // Load appointments
      const appointmentsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/appointments/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (appointmentsResponse.ok) {
        const appointmentData = await appointmentsResponse.json()
        setAppointments(appointmentData || [])
      }

      // Load progress
      const progressResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/progress/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        setProgress(progressData || [])
      }

    } catch (error) {
      console.error('Dashboard data loading error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    const name = user?.user_metadata?.name || 'there'
    
    if (hour < 12) return `Good morning, ${name}!`
    if (hour < 17) return `Good afternoon, ${name}!`
    return `Good evening, ${name}!`
  }

  const getNextAppointment = () => {
    const upcoming = appointments
      .filter(apt => new Date(apt.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return upcoming[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">AyurNutri</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate('landing')}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getWelcomeMessage()}
          </h1>
          <p className="text-lg text-gray-600">
            Continue your personalized wellness journey with AyurNutri
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button 
            className="h-20 flex-col space-y-2" 
            onClick={() => onNavigate('prakriti-assessment')}
          >
            <Brain className="w-6 h-6" />
            <span>Prakriti Assessment</span>
          </Button>
          
          <Button 
            className="h-20 flex-col space-y-2" 
            variant="outline"
            onClick={() => onNavigate('diet-plan')}
          >
            <Heart className="w-6 h-6" />
            <span>My Diet Plan</span>
          </Button>
          
          <Button 
            className="h-20 flex-col space-y-2" 
            variant="outline"
            onClick={() => onNavigate('book-appointment')}
          >
            <Calendar className="w-6 h-6" />
            <span>Book Appointment</span>
          </Button>
          
          <Button 
            className="h-20 flex-col space-y-2" 
            variant="outline"
            onClick={() => onNavigate('progress-tracking')}
          >
            <TrendingUp className="w-6 h-6" />
            <span>Track Progress</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prakriti Analysis Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Your Prakriti Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prakritiAnalysis ? (
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        Dominant: {prakritiAnalysis.dominant?.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Analyzed on {new Date(prakritiAnalysis.analyzed_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Vata</span>
                          <span>{prakritiAnalysis.scores?.vata || 0}</span>
                        </div>
                        <Progress value={(prakritiAnalysis.scores?.vata || 0) * 10} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Pitta</span>
                          <span>{prakritiAnalysis.scores?.pitta || 0}</span>
                        </div>
                        <Progress value={(prakritiAnalysis.scores?.pitta || 0) * 10} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Kapha</span>
                          <span>{prakritiAnalysis.scores?.kapha || 0}</span>
                        </div>
                        <Progress value={(prakritiAnalysis.scores?.kapha || 0) * 10} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2">Key Recommendations:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {prakritiAnalysis.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      Discover Your Prakriti
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Take our comprehensive assessment to understand your unique body constitution
                    </p>
                    <Button onClick={() => onNavigate('prakriti-assessment')}>
                      Start Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Diet Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Your Personalized Diet Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dietPlan ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">
                        Based on {dietPlan.prakriti?.toUpperCase()} constitution
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {dietPlan.duration} program
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-800 mb-2">Today's Breakfast</h4>
                        <p className="text-sm text-orange-700">
                          {dietPlan.weeklyPlan?.breakfast?.[0] || 'Warm oatmeal with almonds'}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Today's Lunch</h4>
                        <p className="text-sm text-blue-700">
                          {dietPlan.weeklyPlan?.lunch?.[0] || 'Dal with ghee and vegetables'}
                        </p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => onNavigate('diet-plan')}
                    >
                      View Complete Diet Plan
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      Get Your Personalized Diet Plan
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Complete your Prakriti assessment to receive a customized nutrition plan
                    </p>
                    <Button 
                      onClick={() => onNavigate('prakriti-assessment')}
                      disabled={!prakritiAnalysis}
                    >
                      {prakritiAnalysis ? 'Generate Diet Plan' : 'Complete Assessment First'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Appointment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Next Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getNextAppointment() ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        {new Date(getNextAppointment().date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {getNextAppointment().time} - {getNextAppointment().type}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      No upcoming appointments
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => onNavigate('book-appointment')}
                    >
                      Book Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Progress Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progress.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Weight Progress</span>
                      <span className="text-sm font-medium text-green-600">-2.5 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Energy Level</span>
                      <span className="text-sm font-medium text-green-600">+25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Diet Adherence</span>
                      <span className="text-sm font-medium text-blue-600">87%</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full mt-3"
                      onClick={() => onNavigate('progress-tracking')}
                    >
                      View Detailed Progress
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      Start tracking your progress
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => onNavigate('progress-tracking')}
                    >
                      Add Progress Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Tip */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="w-5 h-5 mr-2" />
                  Today's Health Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    "Start your day with warm water and lemon to stimulate digestion 
                    and balance your doshas naturally."
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    - Ancient Ayurvedic Wisdom
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}