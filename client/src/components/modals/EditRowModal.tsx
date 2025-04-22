import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  primary_key?: string;
}

interface EditRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  row: Record<string, any> | null;
  columns: ColumnInfo[];
  isSaving: boolean;
}

const EditRowModal: React.FC<EditRowModalProps> = ({
  isOpen,
  onClose,
  onSave,
  row,
  columns,
  isSaving
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Initialize form data when the row or columns change
  useEffect(() => {
    if (row) {
      // Editing existing row
      setFormData({ ...row });
    } else {
      // Adding new row, initialize with empty values
      const initialData: Record<string, any> = {};
      columns.forEach(column => {
        // Skip primary keys with auto-increment for new rows
        if (column.primary_key === 'PRIMARY KEY' && column.column_name.toLowerCase() === 'id') {
          return;
        }
        initialData[column.column_name] = '';
      });
      setFormData(initialData);
    }
  }, [row, columns]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert string values to appropriate types based on column data type
    const processedData: Record<string, any> = {};
    
    for (const key in formData) {
      const column = columns.find(col => col.column_name === key);
      if (!column) continue;
      
      const value = formData[key];
      
      // Skip empty values for nullable columns
      if (value === '' && column.is_nullable === 'YES') {
        processedData[key] = null;
        continue;
      }
      
      // Convert to appropriate type based on PostgreSQL data type
      if (column.data_type.includes('int') && value !== '') {
        processedData[key] = parseInt(value, 10);
      } else if (column.data_type.includes('float') || column.data_type.includes('numeric') || column.data_type.includes('decimal')) {
        processedData[key] = parseFloat(value);
      } else if (column.data_type.includes('bool')) {
        processedData[key] = value === 'true';
      } else {
        processedData[key] = value;
      }
    }
    
    onSave(processedData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => !isSaving && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{row ? 'Edit Row' : 'Add Row'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {columns.map(column => {
            const isPrimary = column.primary_key === 'PRIMARY KEY';
            // For new rows, skip primary key with auto-increment
            if (!row && isPrimary && column.column_name.toLowerCase() === 'id') return null;
            
            return (
              <div key={column.column_name}>
                <Label htmlFor={`edit-${column.column_name}`} className="block text-sm font-medium text-neutral-700">
                  {column.column_name}
                  {isPrimary && <span className="ml-1 text-xs text-primary">(Primary Key)</span>}
                </Label>
                <Input
                  type="text"
                  name={column.column_name}
                  id={`edit-${column.column_name}`}
                  value={formData[column.column_name] || ''}
                  onChange={handleInputChange}
                  disabled={isPrimary && row}
                  className={`mt-1 ${isPrimary && row ? 'bg-neutral-100' : ''}`}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {column.data_type} {column.is_nullable === 'YES' ? '(nullable)' : '(required)'}
                </p>
              </div>
            );
          })}
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRowModal;
