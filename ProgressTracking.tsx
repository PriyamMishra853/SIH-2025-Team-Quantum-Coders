import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { 
  TrendingUp, ArrowLeft, Plus, Calendar, Weight, Battery, 
  Moon, Heart, Target, Award, ChevronDown, ChevronUp
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId } from '../utils/supabase/info'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface ProgressTrackingProps {
  user: any
  token: string
  onNavigate: (page: string) => void
}

export const ProgressTracking: React.FC<ProgressTrackingProps> = ({ user, token, onNavigate }) => {
  const [progressData, setProgressData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    weight: '',
    energyLevel: '',
    sleepQuality: '',
    stressLevel: '',
    digestiveHealth: '',
    notes: ''
  })

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/progress`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (response.ok) {
        const { progress } = await response.json()
        setProgressData(progress || [])
      }
    } catch (error) {
      console.error('Progress data loading error:', error)
      toast.error('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProgress = async () => {
    if (!newEntry.weight || !newEntry.energyLevel) {
      toast.error('Please fill in required fields (weight and energy level)')
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            weight: parseFloat(newEntry.weight),
            energyLevel: parseInt(newEntry.energyLevel),
            sleepQuality: parseInt(newEntry.sleepQuality || '5'),
            stressLevel: parseInt(newEntry.stressLevel || '5'),
            digestiveHealth: parseInt(newEntry.digestiveHealth || '5'),
            notes: newEntry.notes
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add progress entry')
      }

      toast.success('Progress entry added successfully!')
      setShowAddForm(false)
      setNewEntry({
        weight: '',
        energyLevel: '',
        sleepQuality: '',
        stressLevel: '',
        digestiveHealth: '',
        notes: ''
      })
      loadProgressData()
      
    } catch (error: any) {
      console.error('Progress add error:', error)
      toast.error(`Failed to add progress: ${error.message}`)
    }
  }

  const getProgressTrend = (metric: string) => {
    if (progressData.length < 2) return null
    
    const sortedData = [...progressData].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    const latest = sortedData[sortedData.length - 1]
    const previous = sortedData[sortedData.length - 2]
    
    if (!latest[metric] || !previous[metric]) return null
    
    const change = latest[metric] - previous[metric]
    return {
      change,
      isPositive: metric === 'weight' ? change < 0 : change > 0, // Weight loss is positive
      percentage: Math.abs((change / previous[metric]) * 100).toFixed(1)
    }
  }

  const getWeightChartData = () => {
    return progressData
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((entry, index) => ({
        day: `Day ${index + 1}`,
        weight: entry.weight,
        date: new Date(entry.timestamp).toLocaleDateString()
      }))
  }

  const getWellnessChartData = () => {
    return progressData
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((entry, index) => ({
        day: `Day ${index + 1}`,
        energy: entry.energyLevel || 0,
        sleep: entry.sleepQuality || 0,
        stress: 10 - (entry.stressLevel || 5), // Invert stress for better visualization
        digestion: entry.digestiveHealth || 0,
        date: new Date(entry.timestamp).toLocaleDateString()
      }))
  }

  const getLatestEntry = () => {
    if (progressData.length === 0) return null
    return progressData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading your progress data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-2xl">
                  <TrendingUp className="w-8 h-8 mr-3 text-green-600" />
                  Progress Tracking
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Monitor your wellness journey and track improvements over time
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="w-4 h-4 mr-2" />
                {showAddForm ? 'Cancel' : 'Add Entry'}
              </Button>
            </div>
          </CardHeader>
          
          {/* Add New Entry Form */}
          {showAddForm && (
            <CardContent className="border-t">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 65.5"
                    value={newEntry.weight}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="energy">Energy Level (1-10) *</Label>
                  <Select value={newEntry.energyLevel} onValueChange={(value) => setNewEntry(prev => ({ ...prev, energyLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} - {num <= 3 ? 'Low' : num <= 7 ? 'Moderate' : 'High'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleep">Sleep Quality (1-10)</Label>
                  <Select value={newEntry.sleepQuality} onValueChange={(value) => setNewEntry(prev => ({ ...prev, sleepQuality: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} - {num <= 3 ? 'Poor' : num <= 7 ? 'Good' : 'Excellent'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stress">Stress Level (1-10)</Label>
                  <Select value={newEntry.stressLevel} onValueChange={(value) => setNewEntry(prev => ({ ...prev, stressLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} - {num <= 3 ? 'Low' : num <= 7 ? 'Moderate' : 'High'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="digestion">Digestive Health (1-10)</Label>
                  <Select value={newEntry.digestiveHealth} onValueChange={(value) => setNewEntry(prev => ({ ...prev, digestiveHealth: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select health" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} - {num <= 3 ? 'Poor' : num <= 7 ? 'Good' : 'Excellent'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="How are you feeling today?"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProgress}>
                  Add Progress Entry
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {progressData.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <CardTitle>Start Tracking Your Progress</CardTitle>
              <CardDescription>
                Add your first progress entry to begin monitoring your wellness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="weight">Weight Tracking</TabsTrigger>
              <TabsTrigger value="wellness">Wellness Metrics</TabsTrigger>
              <TabsTrigger value="history">Entry History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
                    <Weight className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getLatestEntry()?.weight || 0} kg</div>
                    {getProgressTrend('weight') && (
                      <p className={`text-xs ${getProgressTrend('weight')?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {getProgressTrend('weight')?.isPositive ? <ChevronDown className="w-3 h-3 inline" /> : <ChevronUp className="w-3 h-3 inline" />}
                        {Math.abs(getProgressTrend('weight')?.change || 0)} kg from last entry
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Energy Level</CardTitle>
                    <Battery className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getLatestEntry()?.energyLevel || 0}/10</div>
                    {getProgressTrend('energyLevel') && (
                      <p className={`text-xs ${getProgressTrend('energyLevel')?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {getProgressTrend('energyLevel')?.isPositive ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
                        {getProgressTrend('energyLevel')?.percentage}% from last entry
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
                    <Moon className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getLatestEntry()?.sleepQuality || 0}/10</div>
                    {getProgressTrend('sleepQuality') && (
                      <p className={`text-xs ${getProgressTrend('sleepQuality')?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {getProgressTrend('sleepQuality')?.isPositive ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
                        {getProgressTrend('sleepQuality')?.percentage}% from last entry
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                    <Calendar className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Tracking since {progressData.length > 0 ? new Date(Math.min(...progressData.map(p => new Date(p.timestamp).getTime()))).toLocaleDateString() : 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weight Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={getWeightChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip labelFormatter={(label, payload) => {
                          const data = payload?.[0]?.payload
                          return data?.date || label
                        }} />
                        <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Wellness Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={getWellnessChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip labelFormatter={(label, payload) => {
                          const data = payload?.[0]?.payload
                          return data?.date || label
                        }} />
                        <Bar dataKey="energy" fill="#fbbf24" name="Energy" />
                        <Bar dataKey="sleep" fill="#8b5cf6" name="Sleep" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Goals and Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Goals & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Current Goals</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Weight Goal Progress</span>
                            <span className="text-sm text-green-600">65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Energy Level Improvement</span>
                            <span className="text-sm text-blue-600">80%</span>
                          </div>
                          <Progress value={80} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Recent Achievements</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span>7-day tracking streak!</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Award className="w-4 h-4 text-green-500" />
                          <span>Energy level increased by 25%</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Award className="w-4 h-4 text-blue-500" />
                          <span>Sleep quality improved consistently</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weight" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weight Tracking Over Time</CardTitle>
                  <CardDescription>
                    Monitor your weight changes and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getWeightChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip labelFormatter={(label, payload) => {
                        const data = payload?.[0]?.payload
                        return data?.date || label
                      }} />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: '#3b82f6' }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wellness" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wellness Metrics Over Time</CardTitle>
                  <CardDescription>
                    Track your energy, sleep, stress, and digestive health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getWellnessChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip labelFormatter={(label, payload) => {
                        const data = payload?.[0]?.payload
                        return data?.date || label
                      }} />
                      <Line type="monotone" dataKey="energy" stroke="#fbbf24" strokeWidth={2} name="Energy Level" />
                      <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} name="Sleep Quality" />
                      <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} name="Stress (Inverted)" />
                      <Line type="monotone" dataKey="digestion" stroke="#10b981" strokeWidth={2} name="Digestive Health" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Entry History</CardTitle>
                  <CardDescription>
                    View all your recorded progress entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((entry, index) => (
                      <div key={entry.id || index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Weight:</span>
                            <p className="font-medium">{entry.weight} kg</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Energy:</span>
                            <p className="font-medium">{entry.energyLevel}/10</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Sleep:</span>
                            <p className="font-medium">{entry.sleepQuality || 'N/A'}/10</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Stress:</span>
                            <p className="font-medium">{entry.stressLevel || 'N/A'}/10</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Digestion:</span>
                            <p className="font-medium">{entry.digestiveHealth || 'N/A'}/10</p>
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded">
                            <span className="text-gray-600 text-sm">Notes:</span>
                            <p className="text-sm mt-1">{entry.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}