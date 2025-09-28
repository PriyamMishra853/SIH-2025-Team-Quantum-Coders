import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Leaf, User, Calendar, Brain, Heart, TrendingUp, LogOut, Settings, 
  FileText, Clock, CheckCircle, Users, Activity, PlusCircle, Search,
  MessageCircle, Send, X, Bot
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId } from '../utils/supabase/info'
import { Input } from './ui/input'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DietitianDashboardProps {
  user: any
  onNavigate: (page: string) => void
  token: string
}

interface NewPatient {
  name: string
  email: string
  phone: string
  age: string
  gender: string
}

interface NewAppointment {
  patientId: string
  patientName: string
  date: string
  time: string
  type: string
  notes: string
}

interface DietPlanData {
  patientId: string
  patientName: string
  goal: string
  duration: string
  restrictions: string
}

export const DietitianDashboard: React.FC<DietitianDashboardProps> = ({ 
  user, onNavigate, token 
}) => {
  const [stats, setStats] = useState<any>({})
  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Modal states
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showScheduleAppointment, setShowScheduleAppointment] = useState(false)
  const [showCreateDietPlan, setShowCreateDietPlan] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  
  // Form states
  const [newPatient, setNewPatient] = useState<NewPatient>({
    name: '', email: '', phone: '', age: '', gender: ''
  })
  const [newAppointment, setNewAppointment] = useState<NewAppointment>({
    patientId: '', patientName: '', date: '', time: '', type: '', notes: ''
  })
  const [dietPlanData, setDietPlanData] = useState<DietPlanData>({
    patientId: '', patientName: '', goal: '', duration: '', restrictions: ''
  })
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    weightProgress: [],
    energyLevels: [],
    compliance: []
  })

  useEffect(() => {
    loadDashboardData()
    generateAnalyticsData()
  }, [])

  const generateAnalyticsData = () => {
    // Generate random analytics data for demonstration
    const weightProgress = Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      patient1: 75 - Math.random() * 10,
      patient2: 68 - Math.random() * 8,
      patient3: 82 - Math.random() * 12
    }))

    const energyLevels = Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      morning: Math.floor(Math.random() * 40) + 60,
      afternoon: Math.floor(Math.random() * 30) + 50,
      evening: Math.floor(Math.random() * 35) + 45
    }))

    const compliance = [
      { name: 'Diet Plan', value: 85, color: '#22c55e' },
      { name: 'Exercise', value: 72, color: '#3b82f6' },
      { name: 'Meditation', value: 68, color: '#a855f7' },
      { name: 'Sleep Schedule', value: 79, color: '#f59e0b' }
    ]

    setAnalyticsData({ weightProgress, energyLevels, compliance })
  }

  const loadDashboardData = async () => {
    try {
      const authToken = localStorage.getItem('access_token')
      if (!authToken) return

      // Load dietitian dashboard stats
      const statsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/dietitian/dashboard`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      )
      
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats(data.stats || {})
        setPatients(data.patients || [])
      }

      // Load appointments (mock data for demo)
      setAppointments([
        {
          id: 1,
          patientName: 'Sarah Johnson',
          time: '10:00 AM',
          type: 'Initial Consultation',
          date: new Date().toISOString(),
          status: 'confirmed'
        },
        {
          id: 2,
          patientName: 'Mike Chen',
          time: '2:00 PM',
          type: 'Follow-up',
          date: new Date().toISOString(),
          status: 'confirmed'
        },
        {
          id: 3,
          patientName: 'Emma Wilson',
          time: '4:00 PM',
          type: 'Diet Plan Review',
          date: new Date().toISOString(),
          status: 'pending'
        }
      ])

    } catch (error) {
      console.error('Dashboard data loading error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPatient = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/patients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newPatient)
        }
      )

      if (response.ok) {
        toast.success('Patient added successfully!')
        setShowAddPatient(false)
        setNewPatient({ name: '', email: '', phone: '', age: '', gender: '' })
        loadDashboardData()
      } else {
        toast.error('Failed to add patient')
      }
    } catch (error) {
      console.error('Add patient error:', error)
      toast.error('Failed to add patient')
    }
  }

  const handleScheduleAppointment = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/appointments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...newAppointment,
            dietitianId: user.id
          })
        }
      )

      if (response.ok) {
        toast.success('Appointment scheduled successfully!')
        setShowScheduleAppointment(false)
        setNewAppointment({ patientId: '', patientName: '', date: '', time: '', type: '', notes: '' })
        loadDashboardData()
      } else {
        toast.error('Failed to schedule appointment')
      }
    } catch (error) {
      console.error('Schedule appointment error:', error)
      toast.error('Failed to schedule appointment')
    }
  }

  const handleCreateDietPlan = async () => {
    try {
      const generatedPlan = generateRandomDietPlan(dietPlanData)
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/diet-plans`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...dietPlanData,
            plan: generatedPlan,
            dietitianId: user.id
          })
        }
      )

      if (response.ok) {
        toast.success('Diet plan created successfully!')
        setShowCreateDietPlan(false)
        setDietPlanData({ patientId: '', patientName: '', goal: '', duration: '', restrictions: '' })
      } else {
        toast.error('Failed to create diet plan')
      }
    } catch (error) {
      console.error('Create diet plan error:', error)
      toast.error('Failed to create diet plan')
    }
  }

  const generateRandomDietPlan = (data: DietPlanData) => {
    const breakfast = ['Oatmeal with berries', 'Quinoa porridge', 'Idli with sambar', 'Poha with vegetables']
    const lunch = ['Grilled chicken with quinoa', 'Dal with brown rice', 'Vegetable curry with roti', 'Fish with steamed vegetables']
    const dinner = ['Vegetable soup with salad', 'Khichdi with ghee', 'Grilled tofu with vegetables', 'Light curry with chapati']
    const snacks = ['Mixed nuts', 'Fresh fruits', 'Green tea', 'Yogurt with herbs']

    return {
      breakfast: breakfast[Math.floor(Math.random() * breakfast.length)],
      lunch: lunch[Math.floor(Math.random() * lunch.length)],
      dinner: dinner[Math.floor(Math.random() * dinner.length)],
      snacks: snacks[Math.floor(Math.random() * snacks.length)],
      instructions: `Follow this ${data.duration} plan focusing on ${data.goal}. Avoid ${data.restrictions || 'processed foods'}.`,
      calories: Math.floor(Math.random() * 500) + 1500
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    onNavigate('landing')
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    const name = user?.user_metadata?.name || 'Doctor'
    
    if (hour < 12) return `Good morning, Dr. ${name}!`
    if (hour < 17) return `Good afternoon, Dr. ${name}!`
    return `Good evening, Dr. ${name}!`
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
              <Badge variant="secondary" className="ml-2">Dietitian Portal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
            Manage your patients and provide personalized Ayurvedic wellness guidance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients || 0}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appointmentsToday || 0}</div>
              <p className="text-xs text-muted-foreground">3 confirmed, 1 pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Assessments</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedAssessments || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Diet Plans</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePlans || 0}</div>
              <p className="text-xs text-muted-foreground">Being followed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {appointment.patientName.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{appointment.patientName}</p>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{appointment.time}</p>
                          <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View All Appointments
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Patient Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Patient Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">Sarah completed Prakriti assessment</p>
                        <p className="text-sm text-gray-600">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">Mike logged progress update</p>
                        <p className="text-sm text-gray-600">4 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="font-medium">Emma booked follow-up appointment</p>
                        <p className="text-sm text-gray-600">6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setShowAddPatient(true)}
                  >
                    <PlusCircle className="w-6 h-6" />
                    <span>Add New Patient</span>
                  </Button>
                  
                  <Button 
                    className="h-20 flex-col space-y-2" 
                    variant="outline"
                    onClick={() => setShowScheduleAppointment(true)}
                  >
                    <Calendar className="w-6 h-6" />
                    <span>Schedule Appointment</span>
                  </Button>
                  
                  <Button 
                    className="h-20 flex-col space-y-2" 
                    variant="outline"
                    onClick={() => setShowCreateDietPlan(true)}
                  >
                    <FileText className="w-6 h-6" />
                    <span>Create Diet Plan</span>
                  </Button>
                  
                  <Button 
                    className="h-20 flex-col space-y-2" 
                    variant="outline"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span>View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Patient Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input placeholder="Search patients..." className="pl-10" />
                    </div>
                    <Button onClick={() => setShowAddPatient(true)}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Patient
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.map((patient, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {patient.name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patient.name || 'Patient'}</p>
                          <p className="text-sm text-gray-600">{patient.email || 'No email'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">Active</Badge>
                        <Button size="sm" variant="outline">View Profile</Button>
                      </div>
                    </div>
                  ))}
                  
                  {patients.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">No patients yet</h3>
                      <p className="text-gray-600 mb-4">Start by adding your first patient</p>
                      <Button onClick={() => setShowAddPatient(true)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add First Patient
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Appointment Management</CardTitle>
                  <Button onClick={() => setShowScheduleAppointment(true)}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {appointment.patientName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{appointment.time}</p>
                          <p className="text-sm text-gray-600">Today</p>
                        </div>
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                          {appointment.status}
                        </Badge>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6">
              {/* Weight Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient Weight Progress Tracking</CardTitle>
                  <CardDescription>Monthly weight changes for active patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.weightProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="patient1" 
                          stroke="#22c55e" 
                          name="Sarah Johnson"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="patient2" 
                          stroke="#3b82f6" 
                          name="Mike Chen"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="patient3" 
                          stroke="#a855f7" 
                          name="Emma Wilson"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Energy Levels Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Energy Levels</CardTitle>
                    <CardDescription>Average energy reported by patients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData.energyLevels}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="morning" 
                            stackId="1"
                            stroke="#f59e0b" 
                            fill="#fef3c7"
                            name="Morning"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="afternoon" 
                            stackId="1"
                            stroke="#3b82f6" 
                            fill="#dbeafe"
                            name="Afternoon"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="evening" 
                            stackId="1"
                            stroke="#8b5cf6" 
                            fill="#ede9fe"
                            name="Evening"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Compliance Rates</CardTitle>
                    <CardDescription>Average adherence to different protocols</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.compliance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value">
                          {analyticsData.compliance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Patient Modal */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                placeholder="Enter patient's full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                placeholder="Enter patient's email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                placeholder="Enter patient's phone number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                  placeholder="Age"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => setNewPatient({...newPatient, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddPatient(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPatient}>
                Add Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Modal */}
      <Dialog open={showScheduleAppointment} onOpenChange={setShowScheduleAppointment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patientSelect">Patient</Label>
              <Select onValueChange={(value) => {
                const patient = patients.find(p => p.id === value)
                setNewAppointment({
                  ...newAppointment, 
                  patientId: value,
                  patientName: patient?.name || ''
                })
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name || patient.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type">Appointment Type</Label>
              <Select onValueChange={(value) => setNewAppointment({...newAppointment, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial Consultation</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="diet-review">Diet Plan Review</SelectItem>
                  <SelectItem value="emergency">Emergency Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                placeholder="Any special notes for this appointment"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowScheduleAppointment(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleAppointment}>
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Diet Plan Modal */}
      <Dialog open={showCreateDietPlan} onOpenChange={setShowCreateDietPlan}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Diet Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="patientSelectDiet">Patient</Label>
              <Select onValueChange={(value) => {
                const patient = patients.find(p => p.id === value)
                setDietPlanData({
                  ...dietPlanData, 
                  patientId: value,
                  patientName: patient?.name || ''
                })
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name || patient.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goal">Goal</Label>
              <Select onValueChange={(value) => setDietPlanData({...dietPlanData, goal: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select health goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight-loss">Weight Loss</SelectItem>
                  <SelectItem value="weight-gain">Weight Gain</SelectItem>
                  <SelectItem value="maintenance">Weight Maintenance</SelectItem>
                  <SelectItem value="energy">Increase Energy</SelectItem>
                  <SelectItem value="digestive">Improve Digestion</SelectItem>
                  <SelectItem value="immunity">Boost Immunity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select onValueChange={(value) => setDietPlanData({...dietPlanData, duration: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="2-weeks">2 Weeks</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="restrictions">Dietary Restrictions</Label>
              <Textarea
                id="restrictions"
                value={dietPlanData.restrictions}
                onChange={(e) => setDietPlanData({...dietPlanData, restrictions: e.target.value})}
                placeholder="Any food allergies, preferences, or restrictions"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDietPlan(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDietPlan}>
                Generate Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chatbot Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        {showChatbot ? (
          <Card className="w-80 h-96 flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-sm">AyurNutri AI Assistant</CardTitle>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowChatbot(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-3">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 mb-3 overflow-y-auto">
                <div className="space-y-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <p className="text-sm">Hello! I'm your AyurNutri AI assistant. How can I help you today?</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg shadow-sm ml-6">
                    <p className="text-sm text-gray-600">AI features coming soon! This is a preview of the chatbot interface.</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Type your message..." 
                  disabled
                  className="flex-1"
                />
                <Button size="sm" disabled>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setShowChatbot(true)}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  )
}