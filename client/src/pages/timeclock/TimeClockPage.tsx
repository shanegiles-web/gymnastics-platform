import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useClockIn, useClockOut, useTimeRecords } from '@/hooks/useTimeclock'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Clock, Play, Square } from 'lucide-react'
import { formatDate } from 'date-fns'

export function TimeClockPage() {
  const { data: records } = useTimeRecords()
  const { mutate: clockIn, isPending: clocking } = useClockIn()
  const { mutate: clockOut, isPending: clockingOut } = useClockOut()

  const handleClockIn = () => {
    clockIn(undefined, {
      onSuccess: () => {
        toast.success('Clocked in!')
      },
      onError: () => {
        toast.error('Failed to clock in')
      },
    })
  }

  const handleClockOut = () => {
    clockOut(undefined, {
      onSuccess: () => {
        toast.success('Clocked out!')
      },
      onError: () => {
        toast.error('Failed to clock out')
      },
    })
  }

  const latestRecord = records?.[0]
  const isClocked = latestRecord?.status === 'clocked_in'

  return (
    <PageLayout>
      <PageHeader
        title="Time Clock"
        subtitle="Staff time tracking and attendance"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12">
              <div className="text-6xl font-bold text-brand-500 mb-4">
                {new Date().toLocaleTimeString()}
              </div>
              <Badge variant={isClocked ? 'success' : 'error'} className="text-lg px-4 py-2">
                {isClocked ? 'CLOCKED IN' : 'CLOCKED OUT'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleClockIn}
                disabled={clocking || isClocked}
                className="h-16 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Clock In
              </Button>
              <Button
                onClick={handleClockOut}
                variant="secondary"
                disabled={clockingOut || !isClocked}
                className="h-16 text-lg"
              >
                <Square className="h-5 w-5 mr-2" />
                Clock Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestRecord ? (
              <>
                <div>
                  <p className="text-xs text-text-tertiary font-semibold">CLOCK IN</p>
                  <p className="text-lg font-medium">
                    {formatDate(new Date(latestRecord.clockInTime), 'HH:mm:ss')}
                  </p>
                </div>
                {latestRecord.clockOutTime && (
                  <div>
                    <p className="text-xs text-text-tertiary font-semibold">CLOCK OUT</p>
                    <p className="text-lg font-medium">
                      {formatDate(new Date(latestRecord.clockOutTime), 'HH:mm:ss')}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-text-tertiary">No time records yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {records && records.length > 0 ? (
              records.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border border-border-DEFAULT rounded-md">
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(new Date(record.clockInTime), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {formatDate(new Date(record.clockInTime), 'HH:mm')} - {record.clockOutTime ? formatDate(new Date(record.clockOutTime), 'HH:mm') : 'Still clocked in'}
                    </p>
                  </div>
                  <Badge variant={record.status === 'clocked_in' ? 'success' : 'default'}>
                    {record.status === 'clocked_in' ? 'Active' : 'Completed'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-tertiary text-center py-4">No time records</p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
