import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboardMetrics, useDashboardActivity } from '@/hooks/useDashboard'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function AdminDashboard() {
  const { data: metrics, isLoading } = useDashboardMetrics()
  const { data: activities } = useDashboardActivity()

  const chartData = [
    { month: 'Jan', revenue: 4000, students: 240 },
    { month: 'Feb', revenue: 3000, students: 221 },
    { month: 'Mar', revenue: 2000, students: 229 },
    { month: 'Apr', revenue: 2780, students: 200 },
    { month: 'May', revenue: 1890, students: 229 },
    { month: 'Jun', revenue: 2390, students: 200 },
  ]

  return (
    <PageLayout>
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's your facility overview." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Revenue</span>
              <DollarSign className="h-4 w-4 text-status-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-text-primary">
              ${isLoading ? '-' : metrics?.revenue.toLocaleString()}
            </p>
            <p className="text-xs text-text-tertiary mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Active Students</span>
              <Users className="h-4 w-4 text-status-info" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-text-primary">
              {isLoading ? '-' : metrics?.activeStudents}
            </p>
            <p className="text-xs text-text-tertiary mt-1">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Attendance Rate</span>
              <TrendingUp className="h-4 w-4 text-status-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-text-primary">
              {isLoading ? '-' : `${metrics?.attendanceRate}%`}
            </p>
            <p className="text-xs text-text-tertiary mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Upcoming Events</span>
              <Calendar className="h-4 w-4 text-brand-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-text-primary">
              {isLoading ? '-' : metrics?.upcomingEvents}
            </p>
            <p className="text-xs text-text-tertiary mt-1">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue and student enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#5E6AD2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left px-3 py-2 hover:bg-surface-page rounded-md text-sm font-medium">
              + New Student
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-surface-page rounded-md text-sm font-medium">
              + New Class
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-surface-page rounded-md text-sm font-medium">
              + Send Message
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-surface-page rounded-md text-sm font-medium">
              View Reports
            </button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest facility updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!activities || activities.length === 0 ? (
              <p className="text-sm text-text-tertiary">No recent activity</p>
            ) : (
              activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start justify-between pb-4 border-b border-border-DEFAULT last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{activity.message}</p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="default">{activity.type}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
