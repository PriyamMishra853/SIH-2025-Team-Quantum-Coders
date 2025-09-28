import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Leaf, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { useAuth } from './AuthContext'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface LoginFormProps {
  onAuth: (user: any, token: string, role: string) => void
  onNavigate: (page: string) => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onAuth, onNavigate }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const { signIn } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn(email, password)
      
      if (result && result.user) {
        toast.success('Login successful!')
        onAuth(result.user, result.session.access_token, result.user.role)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.message || 'Login failed'
      if (errorMessage.includes('Invalid credentials')) {
        toast.error('Invalid email or password. Please check your credentials and try again.')
      } else {
        toast.error(`Login failed: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSeedDemoUsers = async () => {
    setSeeding(true)
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f1154d58/seed-demo-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success('Demo users created successfully! You can now log in with the demo accounts.')
      } else {
        toast.error(`Failed to create demo users: ${result.error}`)
      }
    } catch (error: any) {
      console.error('Seed demo users error:', error)
      toast.error('Failed to create demo users')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => onNavigate('landing')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Leaf className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">AyurNutri</span>
            </div>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue your wellness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate('register')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2 font-medium">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-gray-500 mb-3">
                <p><strong>Patient:</strong> patient@demo.com / demo123</p>
                <p><strong>Dietitian:</strong> dietitian@demo.com / demo123</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSeedDemoUsers}
                disabled={seeding}
                className="w-full"
              >
                {seeding ? 'Creating Demo Users...' : 'Create Demo Users in Database'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Click above if demo accounts don't work - this creates them in the database.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}