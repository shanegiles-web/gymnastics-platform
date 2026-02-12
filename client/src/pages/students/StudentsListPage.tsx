import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { useStudents } from '@/hooks/useStudents'
import { Plus } from 'lucide-react'

export function StudentsListPage() {
  const navigate = useNavigate()
  const { data: students, isLoading } = useStudents()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStudents = students?.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const columns: Column<typeof filteredStudents[0]>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (row) => row.name,
      sortable: true,
    },
    {
      id: 'age',
      header: 'Age',
      cell: (row) => row.age,
    },
    {
      id: 'skillLevel',
      header: 'Skill Level',
      cell: (row) => (
        <Badge variant={row.skillLevel === 'advanced' ? 'success' : row.skillLevel === 'intermediate' ? 'warning' : 'info'}>
          {row.skillLevel.charAt(0).toUpperCase() + row.skillLevel.slice(1)}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'error'} showDot>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: 'classes',
      header: 'Classes',
      cell: (row) => `${row.enrolledClasses?.length || 0} classes`,
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Students"
        subtitle="Manage all student enrollments and profiles"
        action={{
          label: 'Add Student',
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/students/new'),
        }}
      />

      <DataTable
        columns={columns}
        data={filteredStudents}
        loading={isLoading}
        searchPlaceholder="Search by name or ID..."
        onSearch={setSearchQuery}
        onRowClick={(student) => navigate(`/students/${student.id}`)}
        emptyMessage="No students found. Create your first student to get started."
      />
    </PageLayout>
  )
}
