import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateStudent } from '@/hooks/useStudents'
import { useFamilies } from '@/hooks/useFamilies'
import { ArrowLeft } from 'lucide-react'

export function StudentFormPage() {
  const navigate = useNavigate()
  const createStudent = useCreateStudent()
  const { data: families } = useFamilies()

  const [formData, setFormData] = useState({
    name: '',
    familyId: '',
    skillLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    dateOfBirth: '',
    gender: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    if (!formData.familyId) {
      setError('Family is required')
      return
    }

    try {
      await createStudent.mutateAsync({
        name: formData.name,
        familyId: formData.familyId,
        skillLevel: formData.skillLevel,
        age: 0,
        status: 'active',
      })
      navigate('/students')
    } catch (err: any) {
      setError(err.message || 'Failed to create student')
    }
  }

  return (
    <PageLayout>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/students')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter student's full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family">Family</Label>
              <select
                id="family"
                value={formData.familyId}
                onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-border-DEFAULT bg-surface-card text-text-primary"
              >
                <option value="">Select a family</option>
                {families?.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-border-DEFAULT bg-surface-card text-text-primary"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level</Label>
              <select
                id="skillLevel"
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value as any })}
                className="w-full h-10 px-3 rounded-md border border-border-DEFAULT bg-surface-card text-text-primary"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={createStudent.isPending}>
                {createStudent.isPending ? 'Creating...' : 'Create Student'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/students')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
