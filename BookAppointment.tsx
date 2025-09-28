import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Calendar } from './ui/calendar'
import { 
  Calendar as CalendarIcon, ArrowLeft, Clock, User, Video, 
  MapPin, CheckCircle, Star, MessageSquare
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId } from '../utils/supabase/info'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface BookAppointmentProps {
  user: any
  token: string
  onNavigate: (page: string) => void
}

export const BookAppointment: React.FC<BookAppointmentProps> = ({ user, token, onNavigate }) => {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('')
  const [selectedDietitian, setSelectedDietitian] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  // Demo dietitians data
  const dietitians = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      specialization: 'Ayurvedic Nutrition & Weight Management',
      experience: '8 years',
      rating: 4.9,
      reviews: 124,
      languages: ['English', 'Hindi', 'Sanskrit'],
      consultationFee: '₹1,500',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBkb2N0b3IlMjB3b21hbnxlbnwxfHx8fDE3NTkwNDM3NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      id: '2',
      name: 'Dr. Rajesh Kumar',
      specialization: 'Panchakarma & Detox Therapy',
      experience: '12 years',
      rating: 4.8,
      reviews: 89,
      languages: ['English', 'Hindi', 'Tamil'],
      consultationFee: '₹2,000',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBkb2N0b3IlMjBtYW58ZW58MXx8fHwxNzU5MDQzNzUwfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      id: '3',
      name: 'Dr. Meera Patel',
      specialization: 'Women\'s Health & Fertility',
      experience: '6 years',
      rating: 4.7,
      reviews: 67,
      languages: ['English', 'Hindi', 'Gujarati'],
      consultationFee: '₹1,200',
      image: 'https://images.unsplash.com/photo-1594824671518-eadaf5f9ac6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBkb2N0b3IlMjB3b21hbiUyMGZlbWFsZXxlbnwxfHx8fDE3NTkwNDM3NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  ]

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM'
  ]

  const appointmentTypes = [
    {
      value: 'initial',
      label: 'Initial Consultation',
      description: 'Comprehensive assessment and Prakriti analysis',
      duration: '60 minutes'
    },
    {
      value: 'followup',
      label: 'Follow-up Consultation',
      description: 'Review progress and adjust recommendations',
      duration: '30 minutes'
    },
    {
      value: 'diet-review',
      label: 'Diet Plan Review',
      description: 'Discuss and modify your current diet plan',
      duration: '45 minutes'
    },
    {
      value: 'lifestyle',
      label: 'Lifestyle Counseling',
      description: 'Focus on lifestyle modifications and wellness practices',
      duration: '45 minutes'
    }
  ]

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !appointmentType || !selectedDietitian) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const appointmentData = {
        date: selectedDate.toISOString(),
        time: selectedTime,
        type: appointmentType,
        dietitianId: selectedDietitian,
        notes,
        status: 'pending'
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/appointments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(appointmentData)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to book appointment')
      }

      toast.success('Appointment booked successfully!')
      setStep(4) // Show confirmation
      
    } catch (error: any) {
      console.error('Appointment booking error:', error)
      toast.error(`Booking failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedDietitiannInfo = () => {
    return dietitians.find(d => d.id === selectedDietitian)
  }

  const getAppointmentTypeInfo = () => {
    return appointmentTypes.find(t => t.value === appointmentType)
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Appointment Booked Successfully!</CardTitle>
              <CardDescription>
                Your consultation has been scheduled. You'll receive a confirmation email shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Appointment Details</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Type:</strong> {getAppointmentTypeInfo()?.label}</p>
                  </div>
                  <div>
                    <p><strong>Dietitian:</strong> {getSelectedDietitiannInfo()?.name}</p>
                    <p><strong>Duration:</strong> {getAppointmentTypeInfo()?.duration}</p>
                    <p><strong>Status:</strong> <Badge variant="secondary">Pending Confirmation</Badge></p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  You will receive a meeting link 24 hours before your appointment.
                </p>
                <div className="space-x-4">
                  <Button onClick={() => onNavigate('patient-dashboard')}>
                    Back to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Book Another Appointment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => onNavigate('patient-dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Progress Steps */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  <span className={`ml-2 text-sm ${step >= stepNum ? 'text-green-600' : 'text-gray-600'}`}>
                    {stepNum === 1 ? 'Select Dietitian' : stepNum === 2 ? 'Choose Date & Time' : 'Confirm Details'}
                  </span>
                  {stepNum < 3 && (
                    <div className={`mx-4 h-0.5 w-16 ${step > stepNum ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Select a Dietitian
                </CardTitle>
                <CardDescription>
                  Choose from our certified Ayurvedic dietitians
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dietitians.map((dietitian) => (
                    <Card 
                      key={dietitian.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedDietitian === dietitian.id ? 'border-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => setSelectedDietitian(dietitian.id)}
                    >
                      <CardHeader className="text-center">
                        <ImageWithFallback
                          src={dietitian.image}
                          alt={dietitian.name}
                          className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                        />
                        <CardTitle className="text-lg">{dietitian.name}</CardTitle>
                        <CardDescription>{dietitian.specialization}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Experience</span>
                          <span className="font-medium">{dietitian.experience}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{dietitian.rating}</span>
                          <span className="text-sm text-gray-600">({dietitian.reviews} reviews)</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {dietitian.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Consultation Fee</span>
                            <span className="font-semibold text-green-600">{dietitian.consultationFee}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedDietitian}
                className="px-8"
              >
                Next: Choose Date & Time
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Slots & Appointment Type */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Available Time Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className="text-xs"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      Please select a date first
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consultation Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointmentTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          appointmentType === type.value ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setAppointmentType(type.value)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{type.label}</h4>
                          <Badge variant="outline">{type.duration}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any specific concerns or questions you'd like to discuss..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back: Select Dietitian
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={!selectedDate || !selectedTime || !appointmentType}
                  className="px-8"
                >
                  Next: Review & Confirm
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Appointment</CardTitle>
                <CardDescription>
                  Please review all details before confirming your appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dietitian Info */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <ImageWithFallback
                    src={getSelectedDietitiannInfo()?.image || ''}
                    alt={getSelectedDietitiannInfo()?.name || ''}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{getSelectedDietitiannInfo()?.name}</h4>
                    <p className="text-sm text-gray-600">{getSelectedDietitiannInfo()?.specialization}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span>Experience: {getSelectedDietitiannInfo()?.experience}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{getSelectedDietitiannInfo()?.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{getSelectedDietitiannInfo()?.consultationFee}</p>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Date & Time</h4>
                    <div className="space-y-1 text-sm">
                      <p><CalendarIcon className="w-4 h-4 inline mr-2" />{selectedDate?.toLocaleDateString()}</p>
                      <p><Clock className="w-4 h-4 inline mr-2" />{selectedTime}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Consultation Type</h4>
                    <div className="space-y-1 text-sm">
                      <p>{getAppointmentTypeInfo()?.label}</p>
                      <p className="text-gray-600">{getAppointmentTypeInfo()?.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Meeting Format */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Video Consultation</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    This will be conducted via secure video call. You'll receive the meeting link 24 hours before your appointment.
                  </p>
                </div>

                {notes && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Your Notes</h4>
                    <p className="text-sm text-gray-700">{notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back: Modify Appointment
              </Button>
              <Button 
                onClick={handleBookAppointment} 
                disabled={loading}
                className="px-8"
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}