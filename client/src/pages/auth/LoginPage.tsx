import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
      toast.success('Logged in successfully!')
    } catch (error: unknown) {
      const err = error as { message: string }
      toast.error(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAdmin = () => {
    setEmail('admin@demo.com')
    setPassword('demo123')
  }

  const fillDemoParent = () => {
    setEmail('parent@demo.com')
    setPassword('demo123')
  }

  const fillDemoCoach = () => {
    setEmail('coach@demo.com')
    setPassword('demo123')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-page">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">GymFlow</CardTitle>
          <CardDescription>Gymnastics Facility Management Platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-DEFAULT space-y-2">
            <p className="text-xs text-text-tertiary font-semibold">Demo Credentials</p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full text-xs"
                onClick={fillDemoAdmin}
              >
                Admin Demo
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full text-xs"
                onClick={fillDemoParent}
              >
                Parent Demo
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full text-xs"
                onClick={fillDemoCoach}
              >
                Coach Demo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
