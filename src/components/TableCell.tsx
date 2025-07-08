import React, { useState, useRef, useEffect } from 'react';
import './TableCell.css';

interface TableCellProps {
  value: string | number;
  displayValue: string | number;
  columnType: 'text' | 'number';
  cellId: string;
  isFormula: boolean;
  onValueChange: (newValue: string | number) => void;
}

const TableCell: React.FC<TableCellProps> = ({ value, displayValue, columnType, isFormula, onValueChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize edit value when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditValue(value.toString());
      setHasError(false);
      // Focus and select all text in the input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [isEditing, value]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setHasError(false); // Clear error when starting to edit
    }
  };

  const validateAndSave = () => {
    const trimmedValue = editValue.trim();
    
    // Handle formulas - they can be entered in any column type
    if (trimmedValue.startsWith('=')) {
      // Save the formula as-is, validation will happen in useFormula hook
      onValueChange(trimmedValue);
      setHasError(false);
      setIsEditing(false);
      return;
    }
    
    // Handle regular values based on column type
    if (columnType === 'number') {
      if (trimmedValue === '') {
        // Allow empty values
        onValueChange('');
        setIsEditing(false);
        setHasError(false);
        return;
      }
      
      const numValue = parseFloat(trimmedValue);
      if (isNaN(numValue)) {
        setHasError(true);
        return; // Don't save, stay in edit mode
      }
      
      onValueChange(numValue);
      setHasError(false); // Clear error on successful save
    } else {
      // Text column
      onValueChange(trimmedValue);
      setHasError(false);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value.toString());
    setHasError(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateAndSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    validateAndSave();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    // Clear error when user starts typing
    if (hasError) {
      setHasError(false);
    }
  };

  if (isEditing) {
    return (
      <div className="table-cell-editing">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`cell-input ${hasError ? 'cell-input-error' : ''}`}
        />
      </div>
    );
  }

  // Determine what to show in display mode
  const getDisplayContent = () => {
    if (!displayValue && displayValue !== 0) {
      return <span className="cell-empty">Click to edit</span>;
    }
    
    // Show error state if displayValue contains error
    if (typeof displayValue === 'string' && displayValue.startsWith('#ERROR:')) {
      return <span className="cell-error-display">{displayValue}</span>;
    }
    
    return displayValue;
  };

  // Determine CSS classes and tooltip based on display value
  const getCellClasses = () => {
    let classes = `table-cell-content ${columnType === 'number' ? 'cell-number' : 'cell-text'}`;
    
    if (typeof displayValue === 'string' && displayValue.startsWith('#ERROR:')) {
      classes += ' cell-error-state';
    }
    
    return classes;
  };
  
  const getTooltip = () => {
    if (typeof displayValue === 'string' && displayValue.startsWith('#ERROR:')) {
      return displayValue; // Show full error message
    }
    
    if (isFormula) {
      return `Formula: ${value}`;
    }
    
    return "Click to edit";
  };

  return (
    <div 
      className={getCellClasses()}
      onClick={handleClick}
      title={getTooltip()}
    >
      {getDisplayContent()}
    </div>
  );
};

export default TableCell;