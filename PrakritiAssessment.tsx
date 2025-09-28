import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Brain, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId } from '../utils/supabase/info'

interface PrakritiAssessmentProps {
  user: any
  token: string
  onNavigate: (page: string) => void
}

export const PrakritiAssessment: React.FC<PrakritiAssessmentProps> = ({
  user, token, onNavigate
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const questions = [
    {
      id: 1,
      category: 'Physical',
      question: 'How would you describe your body build?',
      options: [
        { text: 'Thin, light frame, prominent joints', type: 'vata', score: 3 },
        { text: 'Medium build, well-proportioned', type: 'pitta', score: 3 },
        { text: 'Large frame, heavy build, rounded features', type: 'kapha', score: 3 }
      ]
    },
    {
      id: 2,
      category: 'Physical',
      question: 'What is your skin type?',
      options: [
        { text: 'Dry, rough, cool to touch', type: 'vata', score: 3 },
        { text: 'Warm, oily, prone to redness/irritation', type: 'pitta', score: 3 },
        { text: 'Oily, smooth, cool, thick', type: 'kapha', score: 3 }
      ]
    },
    {
      id: 3,
      category: 'Physical',
      question: 'How is your hair naturally?',
      options: [
        { text: 'Dry, brittle, frizzy', type: 'vata', score: 3 },
        { text: 'Fine, straight, early graying/balding', type: 'pitta', score: 3 },
        { text: 'Thick, oily, wavy, lustrous', type: 'kapha', score: 3 }
      ]
    },
    {
      id: 4,
      category: 'Physical',
      question: 'How is your appetite generally?',
      options: [
        { text: 'Variable, sometimes forget to eat', type: 'vata', score: 3 },
        { text: 'Strong, regular, get irritable if hungry', type: 'pitta', score: 3 },
        { text: 'Low but steady, can skip meals easily', type: 'kapha', score: 3 }
      ]
    },
    {
      id: 5,
      category: 'Physical',
      question: 'How is your digestion?',
      options: [
        { text: 'Irregular, gas, bloating', type: 'vata', score: 3 },
        { text: 'Strong, quick, rarely have problems', type: 'pitta', score: 3 },
        { text: 'Slow, heavy feeling after meals', type: 'kapha', score: 3 }
      ]
    },
    {
      id: 6,
      category: 'Mental',
      question: 'How would you describe your thinking pattern?',
      options: [
        { text: 'Quick, creative, restless mind', type: 'vata', score: 3 },
        { text: 'Sharp, focused, analytical', type: 'pitta', score: 3 },
        { text: 'Slow, steady, methodical', type: 'kapha', score: 3 }
      ]
    },
    {
      id: 7,
      category: 'Mental',
      question: 'How do you handle stress?',
      options: [
        { text: 'Become anxious, worried, scattered', type: 'vata', score: 3 },
        { text: 'Become irritated, angry, impatient', type: 'pitta', score: 3 },
        { text: 'Become withdrawn, sluggish, depressed', type: 'kapha', score: 3 }
      ]
    },
    {
      id: 8,
      category: 'Mental',
      question: 'How is your memory?',
      options: [
        { text: 'Quick to learn, quick to forget', type: 'vata', score: 3 },
        { text: 'Sharp memory, good retention', type: 'pitta', score: 3 },
        { text: 'Slow to learn but excellent long-term memory', type: 'kapha', score: 3 }
      ]
    },
    {
      id: 9,
      category: 'Behavioral',
      question: 'How do you prefer to spend your free time?',
      options: [
        { text: 'Active, traveling, new experiences', type: 'vata', score: 3 },
        { text: 'Competitive activities, leadership roles', type: 'pitta', score: 3 },
        { text: 'Relaxing, reading, spending time with family', type: 'kapha', score: 3 }
      ]
    },
    {
      id: 10,
      category: 'Behavioral',
      question: 'How do you typically sleep?',
      options: [
        { text: 'Light sleeper, wake up easily, restless', type: 'vata', score: 3 },
        { text: 'Moderate sleep, wake up refreshed', type: 'pitta', score: 3 },
        { text: 'Deep sleeper, hard to wake up, need lots of sleep', type: 'kapha', score: 3 }
      ]
    }
  ]

  const handleAnswerSelect = (questionId: number, option: any) => {
    const newResponses = [...responses]
    newResponses[currentQuestion] = {
      questionId,
      selected: option,
      score: option.score
    }
    setResponses(newResponses)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitAssessment()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitAssessment = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/prakriti/assess`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ answers: responses })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to analyze assessment')
      }

      const analysis = await response.json()
      setResults(analysis)
      toast.success('Assessment completed successfully!')
      
    } catch (error: any) {
      console.error('Assessment error:', error)
      toast.error(`Assessment failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Your Prakriti Analysis Complete!</CardTitle>
              <CardDescription>
                Based on your responses, here's your unique Ayurvedic constitution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dosha Scores */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className={`${results.dominant === 'vata' ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">Vata</CardTitle>
                    <Badge variant={results.dominant === 'vata' ? 'default' : 'secondary'}>
                      {results.scores.vata} points
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <Progress value={(results.scores.vata / 30) * 100} className="mb-2" />
                    <p className="text-sm text-gray-600 text-center">
                      Air & Space • Movement & Change
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${results.dominant === 'pitta' ? 'border-red-500 bg-red-50' : ''}`}>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">Pitta</CardTitle>
                    <Badge variant={results.dominant === 'pitta' ? 'default' : 'secondary'}>
                      {results.scores.pitta} points
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <Progress value={(results.scores.pitta / 30) * 100} className="mb-2" />
                    <p className="text-sm text-gray-600 text-center">
                      Fire & Water • Transformation
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${results.dominant === 'kapha' ? 'border-green-500 bg-green-50' : ''}`}>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">Kapha</CardTitle>
                    <Badge variant={results.dominant === 'kapha' ? 'default' : 'secondary'}>
                      {results.scores.kapha} points
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <Progress value={(results.scores.kapha / 30) * 100} className="mb-2" />
                    <p className="text-sm text-gray-600 text-center">
                      Earth & Water • Structure & Stability
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Dominant Prakriti */}
              <Card className="bg-gradient-to-r from-green-100 to-blue-100">
                <CardHeader>
                  <CardTitle className="text-center">
                    Your Dominant Prakriti: {results.dominant.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Key Characteristics:</h4>
                      <ul className="space-y-2">
                        {results.characteristics.map((char: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Personalized Recommendations:</h4>
                      <ul className="space-y-2">
                        {results.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <Button onClick={() => onNavigate('patient-dashboard')} size="lg">
                  View My Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    // Generate diet plan based on prakriti
                    const generateDietPlan = async () => {
                      try {
                        const token = localStorage.getItem('access_token')
                        await fetch(
                          `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/diet-plan/generate`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              prakriti: results.dominant,
                              preferences: {},
                              health_goals: ['general_wellness']
                            })
                          }
                        )
                        toast.success('Diet plan generated!')
                        onNavigate('patient-dashboard')
                      } catch (error) {
                        console.error('Diet plan generation error:', error)
                        toast.error('Failed to generate diet plan')
                      }
                    }
                    generateDietPlan()
                  }}
                >
                  Generate My Diet Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => onNavigate('patient-dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-green-600" />
                <CardTitle>Prakriti Assessment</CardTitle>
              </div>
              <Badge variant="outline">
                {currentQuestion + 1} of {questions.length}
              </Badge>
            </div>
            <CardDescription>
              Answer these questions honestly to discover your unique Ayurvedic constitution
            </CardDescription>
            <Progress value={progress} className="mt-4" />
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-4">
                {questions[currentQuestion].category}
              </Badge>
              <h3 className="text-lg font-medium mb-6">
                {questions[currentQuestion].question}
              </h3>

              <RadioGroup
                value={responses[currentQuestion]?.selected?.text || ''}
                onValueChange={(value) => {
                  const option = questions[currentQuestion].options.find(opt => opt.text === value)
                  if (option) {
                    handleAnswerSelect(questions[currentQuestion].id, option)
                  }
                }}
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={option.text} id={`option-${index}`} className="mt-1" />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button 
                onClick={nextQuestion}
                disabled={!responses[currentQuestion] || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : currentQuestion === questions.length - 1 ? (
                  'Complete Assessment'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">About Prakriti Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Prakriti is your unique mind-body constitution determined at birth. Understanding your 
              Prakriti helps create personalized recommendations for diet, lifestyle, and wellness practices.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Vata</h4>
                <p className="text-blue-600">Air & Space elements. Governs movement, breathing, and nervous system.</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-1">Pitta</h4>
                <p className="text-red-600">Fire & Water elements. Governs digestion, metabolism, and transformation.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">Kapha</h4>
                <p className="text-green-600">Earth & Water elements. Governs structure, immunity, and stability.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}