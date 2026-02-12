import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SchedulePage() {
  const upcomingClasses = [
    { name: 'Beginner Gymnastics', time: '9:00 AM - 10:00 AM', instructor: 'Sarah', type: 'recreational' },
    { name: 'Advanced Tumbling', time: '10:30 AM - 11:30 AM', instructor: 'John', type: 'team' },
    { name: 'Private Coaching', time: '2:00 PM - 3:00 PM', instructor: 'Mike', type: 'private' },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Schedule"
        subtitle="View and manage class schedule and events"
      />

      <div className="grid grid-cols-1 gap-6">
        <Tabs defaultValue="week" className="w-full">
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>This Week's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingClasses.map((cls, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-l-4 ${
                        cls.type === 'recreational'
                          ? 'border-l-status-info bg-blue-50'
                          : cls.type === 'team'
                          ? 'border-l-status-success bg-green-50'
                          : cls.type === 'private'
                          ? 'border-l-status-warning bg-amber-50'
                          : 'border-l-status-error bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-text-primary">{cls.name}</p>
                          <p className="text-sm text-text-secondary">{cls.time}</p>
                          <p className="text-xs text-text-tertiary mt-1">Instructor: {cls.instructor}</p>
                        </div>
                        <span className="text-xs font-medium capitalize px-2 py-1 bg-white rounded">
                          {cls.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Calendar View</CardTitle>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center bg-surface-page rounded">
                <p className="text-text-tertiary">FullCalendar integration goes here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="day">
            <Card>
              <CardContent className="pt-6">
                <p className="text-text-tertiary">Day view coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="month">
            <Card>
              <CardContent className="pt-6">
                <p className="text-text-tertiary">Month view coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}
