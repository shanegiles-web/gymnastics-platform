import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ReportsPage() {
  return (
    <PageLayout>
      <PageHeader title="Reports" subtitle="Analytics and business intelligence" />
      <Card>
        <CardContent className="pt-6">
          <p className="text-text-tertiary">Reports feature coming soon</p>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
