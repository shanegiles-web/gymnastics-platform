import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { useClasses } from '@/hooks/useClasses'
import { Plus } from 'lucide-react'

const classTypeColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  recreational: 'info',
  team: 'success',
  private: 'warning',
  camp: 'error',
}

export function ClassesListPage() {
  const navigate = useNavigate()
  const { data: classes, isLoading } = useClasses()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredClasses = classes?.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const columns: Column<typeof filteredClasses[0]>[] = [
    {
      id: 'name',
      header: 'Class Name',
      cell: (row) => row.name,
      sortable: true,
    },
    {
      id: 'type',
      header: 'Type',
      cell: (row) => (
        <Badge variant={classTypeColors[row.type] || 'default'}>
          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
        </Badge>
      ),
    },
    {
      id: 'instructor',
      header: 'Instructor',
      cell: (row) => row.instructor,
    },
    {
      id: 'capacity',
      header: 'Enrollment',
      cell: (row) => `${row.enrolled}/${row.capacity}`,
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
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Classes"
        subtitle="Manage all classes and schedules"
        action={{
          label: 'New Class',
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/classes/new'),
        }}
      />

      <DataTable
        columns={columns}
        data={filteredClasses}
        loading={isLoading}
        searchPlaceholder="Search classes..."
        onSearch={setSearchQuery}
        onRowClick={(cls) => navigate(`/classes/${cls.id}`)}
        emptyMessage="No classes found. Create your first class to get started."
      />
    </PageLayout>
  )
}
