import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAttendance } from '@/hooks/useAttendance'
import { formatDate } from 'date-fns'

export function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState(formatDate(new Date(), 'yyyy-MM-01'))
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'))

  const { data: records, isLoading } = useAttendance({ startDate, endDate })

  const filteredRecords = records?.filter(record =>
    record.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.classId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const columns: Column<typeof filteredRecords[0]>[] = [
    {
      id: 'date',
      header: 'Date',
      cell: (row) => formatDate(new Date(row.date), 'MMM dd, yyyy'),
    },
    {
      id: 'studentId',
      header: 'Student ID',
      cell: (row) => row.studentId,
    },
    {
      id: 'classId',
      header: 'Class',
      cell: (row) => row.classId,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge
          variant={
            row.status === 'present'
              ? 'success'
              : row.status === 'absent'
              ? 'error'
              : 'warning'
          }
          showDot
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Attendance"
        subtitle="Track student attendance and class participation"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filter by Date Range</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            label="Start Date"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            label="End Date"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Student attendance history</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredRecords}
            loading={isLoading}
            searchPlaceholder="Search student or class..."
            onSearch={setSearchQuery}
            emptyMessage="No attendance records found for this period"
          />
        </CardContent>
      </Card>
    </PageLayout>
  )
}
