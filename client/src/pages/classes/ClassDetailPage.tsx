import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useClass } from '@/hooks/useClasses'
import { ArrowLeft } from 'lucide-react'

export function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: classData, isLoading } = useClass(id || '')

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

  if (!classData) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-text-tertiary">Class not found</p>
        </div>
      </PageLayout>
    )
  }

  const classTypeColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    recreational: 'info',
    team: 'success',
    private: 'warning',
    camp: 'error',
  }

  return (
    <PageLayout>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/classes')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{classData.name}</CardTitle>
              <CardDescription>Class Details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Type</p>
                  <div className="mt-1">
                    <Badge variant={classTypeColors[classData.type] || 'default'}>
                      {classData.type.charAt(0).toUpperCase() + classData.type.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Status</p>
                  <div className="mt-1">
                    <Badge variant={classData.status === 'active' ? 'success' : 'error'} showDot>
                      {classData.status.charAt(0).toUpperCase() + classData.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Instructor</p>
                  <p className="text-lg font-medium text-text-primary mt-1">{classData.instructor}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Schedule</p>
                  <p className="text-lg font-medium text-text-primary mt-1">{classData.schedule}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Capacity</span>
                <span className="text-2xl font-bold text-brand-500">
                  {classData.enrolled}/{classData.capacity}
                </span>
              </div>
              <div className="w-full bg-surface-input rounded-full h-2">
                <div
                  className="bg-brand-500 h-2 rounded-full"
                  style={{ width: `${(classData.enrolled / classData.capacity) * 100}%` }}
                />
              </div>
              <p className="text-xs text-text-tertiary">
                {Math.round((classData.enrolled / classData.capacity) * 100)}% full
              </p>
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
                Edit Class
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                View Roster
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                View Attendance
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
