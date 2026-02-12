import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFamily } from '@/hooks/useFamilies'
import { ArrowLeft } from 'lucide-react'

export function FamilyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: family, isLoading } = useFamily(id || '')

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

  if (!family) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-text-tertiary">Family not found</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/families')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{family.name}</CardTitle>
              <CardDescription>Family Information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Primary Contact</p>
                  <p className="text-lg font-medium text-text-primary mt-1">{family.primaryContact}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Status</p>
                  <div className="mt-1">
                    <Badge variant={family.status === 'active' ? 'success' : 'error'} showDot>
                      {family.status.charAt(0).toUpperCase() + family.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-border-DEFAULT">
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Email</p>
                  <p className="text-sm text-text-primary mt-1">{family.email}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-semibold uppercase">Phone</p>
                  <p className="text-sm text-text-primary mt-1">{family.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children</CardTitle>
            </CardHeader>
            <CardContent>
              {family.children && family.children.length > 0 ? (
                <div className="space-y-2">
                  {family.children.map((childId) => (
                    <div key={childId} className="flex items-center justify-between p-3 bg-surface-page rounded-md">
                      <span className="text-sm font-medium">{childId}</span>
                      <Badge variant="info">Enrolled</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary">No children enrolled</p>
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
                View Billing
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                Send Message
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
