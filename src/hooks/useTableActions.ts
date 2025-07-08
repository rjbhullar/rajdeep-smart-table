import { useCallback } from 'react';
import type { TableData, ColumnConfig } from '../types/index';

export interface TableActions {
  addRow: () => void;
  removeRow: () => void;
  removeSpecificRow: (rowIndex: number) => void;
  addColumn: (label: string, type: 'text' | 'number') => void;
  removeColumn: () => void;
  removeSpecificColumn: (columnId: string) => void;
  updateColumn: (columnId: string, updates: Partial<Pick<ColumnConfig, 'label' | 'type'>>) => void;
  canAddRow: boolean;
  canRemoveRow: boolean;
  canAddColumn: boolean;
  canRemoveColumn: boolean;
}

export const useTableActions = (
  tableData: TableData,
  setTableData: React.Dispatch<React.SetStateAction<TableData>>
): TableActions => {

  // Constants for table size limits
  const MAX_ROWS = 10;
  const MAX_COLUMNS = 10;
  const MIN_ROWS = 1;
  const MIN_COLUMNS = 1;

  /**
   * Generates the next column ID (A, B, C, ... Z, AA, AB, etc.)
   */
  const getNextColumnId = useCallback((existingColumns: ColumnConfig[]): string => {
    const existingIds = existingColumns.map(col => col.id);
    
    // Generate column IDs: A, B, C, ..., Z, AA, AB, etc.
    const generateColumnId = (index: number): string => {
      let result = '';
      while (index >= 0) {
        result = String.fromCharCode(65 + (index % 26)) + result;
        index = Math.floor(index / 26) - 1;
      }
      return result;
    };

    // Find the first available column ID
    for (let i = 0; i < MAX_COLUMNS; i++) {
      const id = generateColumnId(i);
      if (!existingIds.includes(id)) {
        return id;
      }
    }
    
    throw new Error('Maximum number of columns reached');
  }, []);

  /**
   * Updates formula references when columns are removed
   */
  const updateFormulasForColumnRemoval = useCallback((data: Record<string, Record<number, string | number>>, removedColumnId: string): Record<string, Record<number, string | number>> => {
    const updatedData = { ...data };
    
    // Remove the column itself
    delete updatedData[removedColumnId];
    
    // Update formulas in remaining columns to remove references to deleted column
    Object.keys(updatedData).forEach(columnId => {
      Object.keys(updatedData[columnId]).forEach(rowKey => {
        const rowIndex = parseInt(rowKey);
        const cellValue = updatedData[columnId][rowIndex];
        
        if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
          // Check if formula references the removed column
          const columnPattern = new RegExp(`\\b${removedColumnId}\\d+\\b`, 'g');
          if (columnPattern.test(cellValue)) {
            // Replace with error or remove the reference
            updatedData[columnId][rowIndex] = `#ERROR: Reference to deleted column ${removedColumnId}`;
          }
        }
      });
    });
    
    return updatedData;
  }, []);

  /**
   * Updates formula references when rows are removed
   */
  const updateFormulasForRowRemoval = useCallback((data: Record<string, Record<number, string | number>>, removedRowIndex: number): Record<string, Record<number, string | number>> => {
    const updatedData = { ...data };
    
    // Remove the row from all columns and shift higher rows down
    Object.keys(updatedData).forEach(columnId => {
      const column = { ...updatedData[columnId] };
      
      // Remove the specific row
      delete column[removedRowIndex];
      
      // Shift all higher-numbered rows down by 1
      const newColumn: Record<number, string | number> = {};
      Object.keys(column).forEach(rowKey => {
        const rowIndex = parseInt(rowKey);
        if (rowIndex > removedRowIndex) {
          newColumn[rowIndex - 1] = column[rowIndex];
        } else {
          newColumn[rowIndex] = column[rowIndex];
        }
      });
      
      updatedData[columnId] = newColumn;
    });
    
    // Update formulas to reflect new row numbers
    Object.keys(updatedData).forEach(columnId => {
      Object.keys(updatedData[columnId]).forEach(rowKey => {
        const rowIndex = parseInt(rowKey);
        const cellValue = updatedData[columnId][rowIndex];
        
        if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
          // Update row references in formulas
          const updatedFormula = cellValue.replace(/([A-Z]+)(\d+)/g, (match, col, row) => {
            const rowNum = parseInt(row);
            if (rowNum > removedRowIndex) {
              return `${col}${rowNum - 1}`;
            }
            if (rowNum === removedRowIndex) {
              return `#ERROR: Reference to deleted row`;
            }
            return match;
          });
          
          updatedData[columnId][rowIndex] = updatedFormula;
        }
      });
    });
    
    return updatedData;
  }, []);

  /**
   * Add a new row to the table
   */
  const addRow = useCallback(() => {
    setTableData(prevData => {
      if (prevData.rowCount >= MAX_ROWS) {
        console.warn(`Cannot add row: Maximum of ${MAX_ROWS} rows allowed`);
        return prevData;
      }

      const newRowCount = prevData.rowCount + 1;
      
      // Initialize new row with empty values for all columns
      const updatedData = { ...prevData.data };
      prevData.columns.forEach(column => {
        if (!updatedData[column.id]) {
          updatedData[column.id] = {};
        }
        updatedData[column.id] = { ...updatedData[column.id] };
        updatedData[column.id][newRowCount] = '';
      });

      return {
        ...prevData,
        data: updatedData,
        rowCount: newRowCount
      };
    });
  }, [setTableData]);

  /**
   * Remove the last row from the table
   */
  const removeRow = useCallback(() => {
    setTableData(prevData => {
      if (prevData.rowCount <= MIN_ROWS) {
        console.warn(`Cannot remove row: Minimum of ${MIN_ROWS} row required`);
        return prevData;
      }

      const rowToRemove = prevData.rowCount;
      const newRowCount = prevData.rowCount - 1;
      
      // Update data with formula adjustments
      const updatedData = updateFormulasForRowRemoval(prevData.data, rowToRemove);

      return {
        ...prevData,
        data: updatedData,
        rowCount: newRowCount
      };
    });
  }, [setTableData, updateFormulasForRowRemoval]);

  /**
   * Add a new column to the table
   */
  const addColumn = useCallback((label: string, type: 'text' | 'number') => {
    setTableData(prevData => {
      if (prevData.columns.length >= MAX_COLUMNS) {
        console.warn(`Cannot add column: Maximum of ${MAX_COLUMNS} columns allowed`);
        return prevData;
      }

      try {
        const newColumnId = getNextColumnId(prevData.columns);
        
        // Create new column configuration
        const newColumn: ColumnConfig = {
          id: newColumnId,
          label: label.trim() || `Column ${newColumnId}`,
          type
        };

        // Initialize new column with empty values for all rows
        const updatedData = { ...prevData.data };
        updatedData[newColumnId] = {};
        for (let i = 1; i <= prevData.rowCount; i++) {
          updatedData[newColumnId][i] = '';
        }

        return {
          ...prevData,
          data: updatedData,
          columns: [...prevData.columns, newColumn]
        };
      } catch (error) {
        console.error('Failed to add column:', error);
        return prevData;
      }
    });
  }, [setTableData, getNextColumnId]);

  /**
   * Remove the last column from the table
   */
  const removeColumn = useCallback(() => {
    setTableData(prevData => {
      if (prevData.columns.length <= MIN_COLUMNS) {
        console.warn(`Cannot remove column: Minimum of ${MIN_COLUMNS} column required`);
        return prevData;
      }

      const columnToRemove = prevData.columns[prevData.columns.length - 1];
      const updatedColumns = prevData.columns.slice(0, -1);
      
      // Update data with formula adjustments
      const updatedData = updateFormulasForColumnRemoval(prevData.data, columnToRemove.id);

      return {
        ...prevData,
        data: updatedData,
        columns: updatedColumns
      };
    });
  }, [setTableData, updateFormulasForColumnRemoval]);

  // Calculate what actions are currently possible
  const canAddRow = tableData.rowCount < MAX_ROWS;
  const canRemoveRow = tableData.rowCount > MIN_ROWS;
  const canAddColumn = tableData.columns.length < MAX_COLUMNS;
  const canRemoveColumn = tableData.columns.length > MIN_COLUMNS;

  /**
   * Remove a specific row from the table
   */
  const removeSpecificRow = useCallback((rowIndex: number) => {
    setTableData(prevData => {
      if (prevData.rowCount <= MIN_ROWS) {
        console.warn(`Cannot remove row: Minimum of ${MIN_ROWS} row required`);
        return prevData;
      }

      const newRowCount = prevData.rowCount - 1;
      
      // Update data with formula adjustments
      const updatedData = updateFormulasForRowRemoval(prevData.data, rowIndex);

      return {
        ...prevData,
        data: updatedData,
        rowCount: newRowCount
      };
    });
  }, [setTableData, updateFormulasForRowRemoval]);

  /**
   * Remove a specific column from the table
   */
  const removeSpecificColumn = useCallback((columnId: string) => {
    setTableData(prevData => {
      if (prevData.columns.length <= MIN_COLUMNS) {
        console.warn(`Cannot remove column: Minimum of ${MIN_COLUMNS} column required`);
        return prevData;
      }

      const updatedColumns = prevData.columns.filter(col => col.id !== columnId);
      
      // Update data with formula adjustments
      const updatedData = updateFormulasForColumnRemoval(prevData.data, columnId);

      return {
        ...prevData,
        data: updatedData,
        columns: updatedColumns
      };
    });
  }, [setTableData, updateFormulasForColumnRemoval]);

  /**
   * Update column configuration (label, type, etc.)
   */
  const updateColumn = useCallback((columnId: string, updates: Partial<Pick<ColumnConfig, 'label' | 'type'>>) => {
    setTableData(prevData => {
      const updatedColumns = prevData.columns.map(column => 
        column.id === columnId 
          ? { ...column, ...updates }
          : column
      );

      return {
        ...prevData,
        columns: updatedColumns
      };
    });
  }, [setTableData]);

  return {
    addRow,
    removeRow,
    removeSpecificRow,
    addColumn,
    removeColumn,
    removeSpecificColumn,
    updateColumn,
    canAddRow,
    canRemoveRow,
    canAddColumn,
    canRemoveColumn
  };
};