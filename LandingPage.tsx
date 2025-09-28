import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Leaf, Users, Brain, Heart, Calendar, TrendingUp } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface LandingPageProps {
  onNavigate: (page: string) => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">AyurNutri</span>
            </div>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => onNavigate('login')}>
                Login
              </Button>
              <Button onClick={() => onNavigate('register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Personalized Ayurvedic Nutrition for Modern Living
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Discover your unique body constitution (Prakriti) and receive AI-powered, 
                personalized diet plans based on ancient Ayurvedic wisdom combined with modern nutrition science.
              </p>
              <div className="space-x-4">
                <Button size="lg" variant="secondary" onClick={() => onNavigate('register')}>
                  Start Your Journey
                </Button>
                <Button size="lg" variant="outline" onClick={() => onNavigate('login')}>
                  I'm a Dietitian
                </Button>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1624351079933-060043b1453a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxheXVydmVkYSUyMGhlcmJzJTIwbWVkaXRhdGlvbiUyMG5hdHVyYWwlMjBoZWFsdGh8ZW58MXx8fHwxNzU5MDQzNzUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Ayurvedic herbs and natural health"
                className="rounded-lg shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Ayurvedic Wellness Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From Prakriti analysis to personalized meal plans, track your wellness journey with expert guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>AI-Powered Prakriti Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced assessment to determine your unique Ayurvedic constitution 
                  and dominant doshas (Vata, Pitta, Kapha).
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Personalized Diet Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Custom meal plans based on your Prakriti, health goals, and dietary preferences 
                  with Ayurvedic food combinations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Expert Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Book appointments with certified Ayurvedic dietitians for personalized 
                  consultations and plan adjustments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor your wellness journey with detailed analytics, progress reports, 
                  and health improvements over time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with like-minded individuals on similar wellness journeys 
                  and share experiences with the AyurNutri community.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Holistic Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive wellness approach combining nutrition, lifestyle recommendations, 
                  and mindfulness practices for optimal health.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How AyurNutri Works
            </h2>
            <p className="text-xl text-gray-600">
              Your personalized wellness journey in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Assessment</h3>
              <p className="text-gray-600">
                Take our comprehensive Prakriti assessment to understand your unique body constitution.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Plan</h3>
              <p className="text-gray-600">
                Receive a personalized diet plan tailored to your Prakriti and health goals.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your wellness journey with regular check-ins and progress tracking.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Connect with certified dietitians for personalized guidance and plan adjustments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands who have discovered the power of personalized Ayurvedic nutrition. 
            Start your wellness journey today.
          </p>
          <div className="space-x-4">
            <Button size="lg" variant="secondary" onClick={() => onNavigate('register')}>
              Start Free Assessment
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('login')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="w-6 h-6 text-green-500" />
                <span className="text-xl font-bold">AyurNutri</span>
              </div>
              <p className="text-gray-400">
                Personalized Ayurvedic wellness platform combining ancient wisdom with modern AI technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Prakriti Assessment</li>
                <li>Diet Plans</li>
                <li>Progress Tracking</li>
                <li>Expert Consultations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Our Approach</li>
                <li>Scientific Research</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AyurNutri. All rights reserved. | Prototype for demonstration purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}