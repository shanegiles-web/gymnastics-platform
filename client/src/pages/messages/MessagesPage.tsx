import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MessagesPage() {
  return (
    <PageLayout>
      <PageHeader title="Messages" subtitle="Communication with families and staff" />
      <Card>
        <CardContent className="pt-6">
          <p className="text-text-tertiary">Messages feature coming soon</p>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
