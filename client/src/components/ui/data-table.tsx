import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

export interface Column<T> {
  id: keyof T | string
  header: string
  cell: (row: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  pageSize?: number
  emptyMessage?: string
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  onRowClick,
  searchPlaceholder = 'Search...',
  onSearch,
  pageSize = 10,
  emptyMessage = 'No results found',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(0)
    onSearch?.(value)
  }

  const totalPages = Math.ceil(data.length / pageSize)
  const paginatedData = data.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {onSearch && (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-text-tertiary" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border-DEFAULT">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.id)} className={column.width}>
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && <span className="text-xs text-text-tertiary">↕</span>}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <TableRow
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.id)}>
                      {column.cell(row, idx)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-text-tertiary">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-tertiary">
            Page {currentPage + 1} of {totalPages} ({data.length} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
