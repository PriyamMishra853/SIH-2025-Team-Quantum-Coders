import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { 
  Heart, ArrowLeft, Clock, Utensils, Coffee, Sun, Moon,
  CheckCircle, Download, Share2, Calendar, Bell
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId } from '../utils/supabase/info'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface DietPlanProps {
  user: any
  token: string
  onNavigate: (page: string) => void
}

export const DietPlan: React.FC<DietPlanProps> = ({ user, token, onNavigate }) => {
  const [dietPlan, setDietPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(0)
  const [completedMeals, setCompletedMeals] = useState<string[]>([])

  useEffect(() => {
    loadDietPlan()
  }, [])

  const loadDietPlan = async () => {
    if (!token || !user) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/diet-plan/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (response.ok) {
        const planData = await response.json()
        if (planData) {
          setDietPlan(planData)
        } else {
          // Generate a sample diet plan for demo
          const samplePlan = generateSampleDietPlan()
          setDietPlan(samplePlan)
        }
        
        // Load completed meals from localStorage for demo
        const completed = localStorage.getItem('completed_meals')
        if (completed) {
          setCompletedMeals(JSON.parse(completed))
        }
      } else {
        // Generate a sample diet plan for demo
        const samplePlan = generateSampleDietPlan()
        setDietPlan(samplePlan)
      }
    } catch (error) {
      console.error('Diet plan loading error:', error)
      // Generate a sample diet plan for demo
      const samplePlan = generateSampleDietPlan()
      setDietPlan(samplePlan)
    } finally {
      setLoading(false)
    }
  }

  const generateSampleDietPlan = () => {
    return {
      user_id: user?.id,
      prakriti: 'vata',
      duration: '4 weeks',
      weeklyPlan: {
        breakfast: [
          'Warm oatmeal with almonds and ghee',
          'Spiced quinoa porridge with dates',
          'Kitchari with vegetables',
          'Warm milk with turmeric and honey',
          'Rice pudding with cardamom',
          'Warm smoothie with banana and almonds',
          'Cooked apples with cinnamon'
        ],
        lunch: [
          'Kitchari with ghee and vegetables',
          'Rice with dal and steamed greens',
          'Vegetable curry with quinoa',
          'Lentil soup with bread',
          'Spiced vegetables with rice',
          'Chickpea curry with flatbread',
          'Warming vegetable stew'
        ],
        dinner: [
          'Light dal with steamed vegetables',
          'Vegetable soup with rice',
          'Gentle spiced vegetables',
          'Warm milk with almonds',
          'Light kitchari',
          'Herbal tea with crackers',
          'Digestive tea with light snack'
        ]
      },
      principles: [
        'Eat warm, cooked foods',
        'Have regular meal times',
        'Avoid cold and raw foods',
        'Use digestive spices',
        'Eat in a calm environment'
      ],
      supplements: ['Triphala', 'Ashwagandha', 'Brahmi'],
      lifestyle: [
        'Regular sleep schedule',
        'Oil massage',
        'Gentle yoga',
        'Meditation'
      ]
    }
  }

  const markMealComplete = (mealKey: string) => {
    const updated = [...completedMeals, mealKey]
    setCompletedMeals(updated)
    localStorage.setItem('completed_meals', JSON.stringify(updated))
    toast.success('Meal marked as completed!')
  }

  const getDayName = (index: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[index] || `Day ${index + 1}`
  }

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="w-5 h-5" />
      case 'lunch': return <Sun className="w-5 h-5" />
      case 'dinner': return <Moon className="w-5 h-5" />
      default: return <Utensils className="w-5 h-5" />
    }
  }

  const getPrakritiColor = (prakriti: string) => {
    switch (prakriti?.toLowerCase()) {
      case 'vata': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'pitta': return 'bg-red-50 border-red-200 text-red-800'
      case 'kapha': return 'bg-green-50 border-green-200 text-green-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading your personalized diet plan...</p>
        </div>
      </div>
    )
  }

  if (!dietPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <Button variant="ghost" className="mb-4" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Card>
            <CardHeader>
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <CardTitle>No Diet Plan Available</CardTitle>
              <CardDescription>
                Complete your Prakriti assessment first to get a personalized diet plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onBack} className="mr-4">
                Take Prakriti Assessment
              </Button>
              <Button variant="outline" onClick={onBack}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
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
                  <Heart className="w-8 h-8 mr-3 text-green-600" />
                  Your Personalized Diet Plan
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Customized for your {dietPlan.prakriti?.toUpperCase()} constitution
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${getPrakritiColor(dietPlan.prakriti)}`}>
                <h4 className="font-semibold mb-2">Constitutional Type</h4>
                <p className="text-2xl font-bold">{dietPlan.prakriti?.toUpperCase()}</p>
              </div>
              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-800">Duration</h4>
                <p className="text-2xl font-bold text-blue-800">{dietPlan.duration}</p>
              </div>
              <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
                <h4 className="font-semibold mb-2 text-purple-800">Progress</h4>
                <p className="text-2xl font-bold text-purple-800">Week {currentWeek + 1}/4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="weekly-plan" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weekly-plan">Weekly Plan</TabsTrigger>
            <TabsTrigger value="principles">Principles</TabsTrigger>
            <TabsTrigger value="supplements">Supplements</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly-plan" className="space-y-6">
            {/* Week Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((week) => (
                    <Button
                      key={week}
                      variant={currentWeek === week ? 'default' : 'outline'}
                      onClick={() => setCurrentWeek(week)}
                      className="flex items-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Week {week + 1}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Meal Plans */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <Card key={dayIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">{getDayName(dayIndex)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Breakfast */}
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getMealIcon('breakfast')}
                          <span className="font-medium text-orange-800">Breakfast</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markMealComplete(`breakfast-${dayIndex}`)}
                          disabled={completedMeals.includes(`breakfast-${dayIndex}`)}
                        >
                          {completedMeals.includes(`breakfast-${dayIndex}`) ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-orange-700">
                        {dietPlan.weeklyPlan?.breakfast?.[dayIndex] || 'Warm oatmeal with almonds and ghee'}
                      </p>
                    </div>

                    {/* Lunch */}
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getMealIcon('lunch')}
                          <span className="font-medium text-yellow-800">Lunch</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markMealComplete(`lunch-${dayIndex}`)}
                          disabled={completedMeals.includes(`lunch-${dayIndex}`)}
                        >
                          {completedMeals.includes(`lunch-${dayIndex}`) ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-yellow-700">
                        {dietPlan.weeklyPlan?.lunch?.[dayIndex] || 'Kitchari with vegetables and ghee'}
                      </p>
                    </div>

                    {/* Dinner */}
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getMealIcon('dinner')}
                          <span className="font-medium text-purple-800">Dinner</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markMealComplete(`dinner-${dayIndex}`)}
                          disabled={completedMeals.includes(`dinner-${dayIndex}`)}
                        >
                          {completedMeals.includes(`dinner-${dayIndex}`) ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-purple-700">
                        {dietPlan.weeklyPlan?.dinner?.[dayIndex] || 'Light dal with steamed vegetables'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Daily Progress */}
            <Card>
              <CardHeader>
                <CardTitle>This Week's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Meals Completed This Week</span>
                    <span className="font-medium">{completedMeals.length}/21</span>
                  </div>
                  <Progress value={(completedMeals.length / 21) * 100} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Keep up the great work!</span>
                    <span>{Math.round((completedMeals.length / 21) * 100)}% complete</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="principles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dietary Principles for {dietPlan.prakriti?.toUpperCase()}</CardTitle>
                <CardDescription>
                  Follow these fundamental guidelines to balance your constitution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4 text-green-800">Core Principles</h4>
                    <div className="space-y-3">
                      {dietPlan.principles?.map((principle: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800">{principle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4 text-blue-800">Recommended Foods</h4>
                    <div className="space-y-2">
                      {dietPlan.prakriti === 'vata' && (
                        <>
                          <Badge variant="outline" className="mr-2 mb-2">Warm foods</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Cooked grains</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Healthy fats</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Sweet fruits</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Nuts & seeds</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Dairy</Badge>
                        </>
                      )}
                      {dietPlan.prakriti === 'pitta' && (
                        <>
                          <Badge variant="outline" className="mr-2 mb-2">Cooling foods</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Sweet fruits</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Fresh vegetables</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Coconut</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Cilantro</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Mint</Badge>
                        </>
                      )}
                      {dietPlan.prakriti === 'kapha' && (
                        <>
                          <Badge variant="outline" className="mr-2 mb-2">Spicy foods</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Light grains</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Legumes</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Bitter greens</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Ginger</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Turmeric</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supplements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Supplements</CardTitle>
                <CardDescription>
                  Ayurvedic herbs and supplements to support your constitution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {dietPlan.supplements?.map((supplement: string, index: number) => (
                    <Card key={index} className="border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-green-800">{supplement}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="text-sm">Take as directed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Bell className="w-4 h-4 text-gray-600" />
                            <span className="text-sm">With meals</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Consult with your healthcare provider before starting any new supplements. 
                    These recommendations are based on traditional Ayurvedic practices and your constitutional assessment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lifestyle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle Recommendations</CardTitle>
                <CardDescription>
                  Daily practices to support your {dietPlan.prakriti?.toUpperCase()} constitution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {dietPlan.lifestyle?.map((recommendation: string, index: number) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium mb-1">{recommendation}</p>
                          <p className="text-sm text-gray-600">
                            {getLifestyleDescription(recommendation)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Routine Card */}
            <Card>
              <CardHeader>
                <CardTitle>Suggested Daily Routine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Morning (6-10 AM)</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Wake up early (before sunrise)</li>
                        <li>• Drink warm water with lemon</li>
                        <li>• Morning meditation or pranayama</li>
                        <li>• Light exercise or yoga</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Midday (10 AM-6 PM)</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Largest meal of the day</li>
                        <li>• Stay hydrated</li>
                        <li>• Take short breaks from work</li>
                        <li>• Avoid heavy physical activity</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Evening (6-10 PM)</h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Light dinner before sunset</li>
                        <li>• Gentle walk after meals</li>
                        <li>• Wind down activities</li>
                        <li>• Avoid screens before bed</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Night (10 PM-6 AM)</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Sleep by 10 PM</li>
                        <li>• Keep bedroom cool and dark</li>
                        <li>• Avoid eating 3 hours before bed</li>
                        <li>• Practice gratitude or journaling</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function getLifestyleDescription(recommendation: string): string {
  const descriptions: { [key: string]: string } = {
    'Regular sleep schedule': 'Maintain consistent bedtime and wake-up times to support your natural circadian rhythm',
    'Oil massage': 'Daily self-massage with warm sesame oil to calm the nervous system and nourish the skin',
    'Gentle yoga': 'Practice calming, grounding yoga poses to balance Vata energy',
    'Meditation': 'Regular meditation practice to calm the mind and reduce stress',
    'Avoid excessive heat': 'Stay cool and avoid prolonged sun exposure to prevent Pitta aggravation',
    'Swimming': 'Cooling water activities that help balance Pitta constitution',
    'Moonlight walks': 'Evening walks in cool, calm environments to soothe Pitta energy',
    'Cooling pranayama': 'Breathing practices like Sheetali and Sheetkari to cool the body',
    'Regular vigorous exercise': 'Daily physical activity to stimulate metabolism and reduce Kapha',
    'Early rising': 'Wake up before 6 AM to avoid morning Kapha heaviness',
    'Dry brushing': 'Daily dry skin brushing to stimulate circulation and lymphatic drainage',
    'Stimulating activities': 'Engage in energizing, motivating activities to counter Kapha lethargy'
  }
  
  return descriptions[recommendation] || 'Follow this practice regularly for optimal health'
}