import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStudent } from '@/hooks/useStudents'
import { ArrowLeft } from 'lucide-react'

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: student, isLoading } = useStudent(id || '')

  if (isLoading) {
    return (
      <PageLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-input rounded w-1/4"></div>
          <div className="h-64 bg-surface-input rounded"></div>
        </div>
      </PageLayout>
    )
  }

  if (!student) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-text-tertiary">Student not found</p>
        </div>
      </PageLayout>
    )
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{student.name}</CardTitle>
              <CardDescription>Student Profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Age</p>
                  <p className="text-lg font-medium text-text-primary mt-1">{student.age}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Status</p>
                  <div className="mt-1">
                    <Badge variant={student.status === 'active' ? 'success' : 'error'} showDot>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Skill Level</p>
                  <div className="mt-1">
                    <Badge variant={student.skillLevel === 'advanced' ? 'success' : 'warning'}>
                      {student.skillLevel.charAt(0).toUpperCase() + student.skillLevel.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Enrolled Classes</p>
                  <p className="text-lg font-medium text-text-primary mt-1">{student.enrolledClasses?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enrolled Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {student.enrolledClasses && student.enrolledClasses.length > 0 ? (
                <div className="space-y-2">
                  {student.enrolledClasses.map((classId) => (
                    <div key={classId} className="flex items-center justify-between p-3 bg-surface-page rounded-md">
                      <span className="text-sm font-medium">{classId}</span>
                      <Badge variant="info">Active</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary">No classes enrolled</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" className="w-full justify-start">
                Edit Profile
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                View Attendance
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                Payment History
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                Deactivate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
