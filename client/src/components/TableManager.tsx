import React, { useState, useEffect } from 'react';
import { useTableManager } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Search, SortAsc, SortDesc, Edit, Trash2, MoreVertical } from 'lucide-react';
import EditRowModal from './modals/EditRowModal';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';
import { useToast } from '@/hooks/use-toast';

interface TableManagerProps {
  connectionId: number;
}

const TableManager: React.FC<TableManagerProps> = ({ connectionId }) => {
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedColumnFilter, setSelectedColumnFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [primaryKeyInfo, setPrimaryKeyInfo] = useState<{ key: string; value: any } | null>(null);

  // Table manager hook
  const {
    tables,
    columns,
    tableData,
    isLoadingTables,
    isLoadingColumns,
    isLoadingTableData,
    tablesError,
    columnsError,
    tableDataError,
    page,
    pageSize,
    sortColumn,
    sortDirection,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    insertRow,
    updateRow,
    deleteRow,
    isInsertingRow,
    isUpdatingRow,
    isDeletingRow,
  } = useTableManager(connectionId, selectedTable || undefined);

  // Handle table selection
  const handleTableSelect = (tableName: string) => {
    console.log('Table selected:', tableName);
    setSelectedTable(tableName);
    setSelectedColumnFilter(null);
    setSearchQuery('');
  };

  // Handle search query change
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle column filter change
  const handleColumnFilterChange = (value: string) => {
    // If 'all_columns' is selected, set to null to indicate all columns
    setSelectedColumnFilter(value === 'all_columns' ? null : value);
  };

  // Handle add row button click
  const handleAddRow = () => {
    setSelectedRow(null);
    setIsEditModalOpen(true);
  };

  // Handle edit row button click
  const handleEditRow = (row: any) => {
    setSelectedRow(row);
    
    // Find primary key column
    if (columns && columns.length > 0) {
      const primaryKeyColumn = columns.find(col => col.primary_key === 'PRIMARY KEY');
      if (primaryKeyColumn) {
        setPrimaryKeyInfo({
          key: primaryKeyColumn.column_name,
          value: row[primaryKeyColumn.column_name]
        });
      }
    }
    
    setIsEditModalOpen(true);
  };

  // Handle delete row button click
  const handleDeleteRow = (row: any) => {
    setSelectedRow(row);
    
    // Find primary key column
    if (columns && columns.length > 0) {
      const primaryKeyColumn = columns.find(col => col.primary_key === 'PRIMARY KEY');
      if (primaryKeyColumn) {
        setPrimaryKeyInfo({
          key: primaryKeyColumn.column_name,
          value: row[primaryKeyColumn.column_name]
        });
      }
    }
    
    setIsDeleteModalOpen(true);
  };

  // Handle save row
  const handleSaveRow = (data: any) => {
    console.log('Saving row:', data);
    
    if (!selectedRow) {
      // Insert new row
      insertRow(data);
    } else if (primaryKeyInfo) {
      // Update existing row
      updateRow({
        primaryKey: primaryKeyInfo.key,
        primaryKeyValue: primaryKeyInfo.value,
        data
      });
    }
    
    setIsEditModalOpen(false);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    console.log('Deleting row:', selectedRow);
    
    if (primaryKeyInfo) {
      deleteRow({
        primaryKey: primaryKeyInfo.key,
        primaryKeyValue: primaryKeyInfo.value
      });
    }
    
    setIsDeleteModalOpen(false);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  // Display error toasts
  useEffect(() => {
    if (tablesError) {
      toast({
        title: 'Failed to load tables',
        description: (tablesError as Error).message,
        variant: 'destructive',
      });
    }
    
    if (columnsError) {
      toast({
        title: 'Failed to load columns',
        description: (columnsError as Error).message,
        variant: 'destructive',
      });
    }
    
    if (tableDataError) {
      toast({
        title: 'Failed to load table data',
        description: (tableDataError as Error).message,
        variant: 'destructive',
      });
    }
  }, [tablesError, columnsError, tableDataError, toast]);

  // Find primary key and set it when columns change
  useEffect(() => {
    if (columns && columns.length > 0) {
      const primaryKeyColumn = columns.find(col => col.primary_key === 'PRIMARY KEY');
      if (primaryKeyColumn) {
        console.log('Primary key column found:', primaryKeyColumn.column_name);
      }
    }
  }, [columns]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Table header */}
      <div className="px-4 py-5 sm:px-6 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-neutral-700">
              {selectedTable ? `${selectedTable} Table` : 'Select a Table'}
            </h3>
            {tableData && (
              <p className="mt-1 text-sm text-neutral-500">
                {columns?.length || 0} columns · {tableData.pagination?.total || 0} rows
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleAddRow} 
              disabled={!selectedTable || isLoadingTableData}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              disabled={!selectedTable}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table Filters */}
      <div className="px-4 py-3 bg-white border-b border-neutral-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full sm:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <Input
                placeholder="Search table..."
                value={searchQuery}
                onChange={handleSearchQueryChange}
                className="pl-10"
                disabled={!selectedTable || isLoadingTableData}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-700">Column:</span>
            <Select 
              disabled={!selectedTable || isLoadingColumns}
              value={selectedColumnFilter || 'all_columns'}
              onValueChange={handleColumnFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All columns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_columns">All columns</SelectItem>
                {columns && columns.map((column) => (
                  <SelectItem 
                    key={column.column_name} 
                    value={column.column_name}
                  >
                    {column.column_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-white">
        {isLoadingTableData ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Loading table data...</span>
          </div>
        ) : !selectedTable ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-neutral-500">Please select a table from the sidebar</p>
          </div>
        ) : !tableData || !tableData.data || tableData.data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-neutral-500">No data found in this table</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns && columns.map((column) => (
                  <TableHead 
                    key={column.column_name}
                    className="cursor-pointer hover:bg-neutral-200"
                    onClick={() => handleSort(column.column_name)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.column_name}</span>
                      {sortColumn === column.column_name && (
                        sortDirection === 'asc' ? (
                          <SortAsc className="h-4 w-4 text-neutral-700" />
                        ) : (
                          <SortDesc className="h-4 w-4 text-neutral-700" />
                        )
                      )}
                    </div>
                    <div className="text-xs font-normal text-neutral-400 normal-case">{column.data_type}</div>
                  </TableHead>
                ))}
                <TableHead className="relative">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.data.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-neutral-50">
                  {columns && columns.map((column) => (
                    <TableCell key={column.column_name}>
                      {row[column.column_name] !== null ? String(row[column.column_name]) : 'NULL'}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditRow(row)}
                      className="text-primary hover:text-primary-dark h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRow(row)}
                      className="text-error hover:text-red-700 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {tableData && tableData.pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Showing <span className="font-medium">{(tableData.pagination.page - 1) * tableData.pagination.pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(tableData.pagination.page * tableData.pagination.pageSize, tableData.pagination.total)}
                </span>{' '}
                of <span className="font-medium">{tableData.pagination.total}</span> results
              </p>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1} 
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, tableData.pagination.totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={page === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {tableData.pagination.totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <span className="px-4 py-2">...</span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(tableData.pagination.totalPages)}
                        isActive={page === tableData.pagination.totalPages}
                      >
                        {tableData.pagination.totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(tableData.pagination.totalPages, page + 1))}
                    disabled={page === tableData.pagination.totalPages} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditRowModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRow}
        row={selectedRow}
        columns={columns || []}
        isSaving={isInsertingRow || isUpdatingRow}
      />
      
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingRow}
        tableName={selectedTable || ''}
      />
    </div>
  );
};

export default TableManager;
