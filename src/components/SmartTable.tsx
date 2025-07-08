import React, { useState } from 'react';
import './SmartTable.css';
import type { TableData } from '../types/index';
import FilterIcon from '../assets/filter-icon.svg';
import SortIcon from '../assets/sort-icon.svg';
import TableCell from './TableCell';
import AddColumnModal from './AddColumnModal';
import { useFormula } from '../hooks/useFormula';
import { useTableActions } from '../hooks/useTableActions';

const SmartTable: React.FC = () => {
  // State management for table data
  const [tableData, setTableData] = useState<TableData>({
    data: {
      A: { 1: 'John Brown', 2: 'Jim Green', 3: 'Joe Black' },
      B: { 1: 32, 2: 42, 3: 32 },
      C: { 1: 'New York No. 1 Lake Park', 2: 'London No. 1 Lake Park', 3: 'Sydney No. 1 Lake Park' },
      D: { 1: 55000, 2: 60000, 3: 58000 } 
    },
    columns: [
      { id: 'A', label: 'Name', type: 'text' },
      { id: 'B', label: 'Age', type: 'number' },
      { id: 'C', label: 'Address', type: 'text' },
      { id: 'D', label: 'Salary', type: 'number' }
    ],
    rowCount: 3
  });

  // Initialize hooks
  const { isFormula, resolveCellValue } = useFormula(tableData);
  const tableActions = useTableActions(tableData, setTableData);
  
  // Modal state
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [mobileActiveColumn, setMobileActiveColumn] = useState<string | null>(null);

  // Constants
  const MAX_ROWS = 10;
  const MAX_COLUMNS = 10;

  // Update cell value in the Excel-style data structure
  const updateCellValue = (columnId: string, rowIndex: number, newValue: string | number) => {
    setTableData(prevData => {
      const newData = {
        ...prevData,
        data: {
          ...prevData.data,
          [columnId]: {
            ...prevData.data[columnId],
            [rowIndex]: newValue
          }
        }
      };
      
      // For formulas, we need to trigger recalculation of dependent cells
      // This will be handled by the useFormula hook automatically
      return newData;
    });
  };

  const handleAddColumn = (label: string, type: 'text' | 'number') => {
    tableActions.addColumn(label, type);
    setIsAddColumnModalOpen(false);
  };

  const handleEditColumn = (columnId: string) => {
    const column = tableData.columns.find(col => col.id === columnId);
    if (column) {
      setEditingColumnId(columnId);
      setEditingLabel(column.label);
    }
  };

  const handleSaveColumnEdit = () => {
    if (editingColumnId && editingLabel.trim()) {
      tableActions.updateColumn(editingColumnId, { label: editingLabel.trim() });
    }
    setEditingColumnId(null);
    setEditingLabel('');
  };

  const handleCancelColumnEdit = () => {
    setEditingColumnId(null);
    setEditingLabel('');
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = tableData.columns.find(col => col.id === columnId);
    const columnLabel = column ? column.label : 'this column';
    
    if (window.confirm(`Are you sure you want to delete "${columnLabel}"? This action cannot be undone.`)) {
      tableActions.removeSpecificColumn(columnId);
    }
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (window.confirm(`Are you sure you want to delete row ${rowIndex}? This action cannot be undone.`)) {
      tableActions.removeSpecificRow(rowIndex);
    }
  };

  const handleColumnHeaderClick = (columnId: string, event: React.MouseEvent) => {
    // Check if this is a mobile device (no hover support)
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      // On mobile, first click shows buttons, second click within 2 seconds allows interaction
      if (mobileActiveColumn === columnId) {
        // Column is already active, allow normal interaction
        return;
      } else {
        // Show buttons for this column
        event.preventDefault();
        setMobileActiveColumn(columnId);
        // Hide after 3 seconds
        setTimeout(() => setMobileActiveColumn(null), 3000);
      }
    }
  };

  return (
    <div className="smart-table-container">
      {/* Table controls - always show on top */}
      <div className="table-controls">
        {tableData.rowCount < MAX_ROWS && (
          <button
            className="table-control-btn"
            onClick={tableActions.addRow}
            title="Add new row"
          >
            Add Row
          </button>
        )}
        {tableData.columns.length < MAX_COLUMNS && (
          <button
            className="table-control-btn"
            onClick={() => setIsAddColumnModalOpen(true)}
            title="Add new column"
          >
            Add Column
          </button>
        )}
      </div>

      <div className="table-with-controls">
        <table className="smart-table">
        <thead>
          <tr>
            {/* Row number header */}
            <th className="row-number-header">#</th>
            
            {tableData.columns.map((column, index) => (
              <th 
                key={column.id} 
                className={`table-header ${mobileActiveColumn === column.id ? 'mobile-active' : ''}`}
                onClick={(e) => handleColumnHeaderClick(column.id, e)}
              >
                <div className="header-content">
                  {editingColumnId === column.id ? (
                    <div className="header-edit-mode">
                      <input
                        className="header-label-input"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveColumnEdit();
                          if (e.key === 'Escape') handleCancelColumnEdit();
                        }}
                        autoFocus
                      />
                      <button
                        className="save-column-btn"
                        onClick={handleSaveColumnEdit}
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        className="cancel-column-btn"
                        onClick={handleCancelColumnEdit}
                        title="Cancel"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="header-label">{column.label}</span>
                      
                      {/* Edit column button - shows on header hover */}
                      <button
                        className="edit-column-btn-inline"
                        onClick={() => handleEditColumn(column.id)}
                        title="Edit column name"
                      >
                        ✎
                      </button>
                      
                      {/* Delete column button - shows on header hover */}
                      {tableData.columns.length > 1 && (
                        <button
                          className="delete-column-btn-inline"
                          onClick={() => handleDeleteColumn(column.id)}
                          title="Delete this column"
                        >
                          ×
                        </button>
                      )}
                      
                      {/* Column type icon */}
                      {column.type === 'number' && (
                        <img src={SortIcon} alt="sort" className="header-icon" />
                      )}
                      {column.type === 'text' && (
                        <img src={FilterIcon} alt="filter" className="header-icon" />
                      )}
                    </>
                  )}
                </div>
                
                {index < tableData.columns.length - 1 && <div className="header-separator">|</div>}
              </th>
            ))}
            
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: tableData.rowCount }, (_, rowIndex) => (
            <tr 
              key={rowIndex + 1} 
              className="table-row" 
              data-row-index={rowIndex + 1}
            >
              {/* Row number cell with delete button */}
              <td className="row-number-cell">
                <span className="row-number">{rowIndex + 1}</span>
                {tableData.rowCount > 1 && (
                  <button
                    className="delete-row-btn-hover"
                    onClick={() => handleDeleteRow(rowIndex + 1)}
                    title="Delete this row"
                  >
                    ×
                  </button>
                )}
              </td>
              
              {tableData.columns.map((column) => {
                const cellId = `${column.id}${rowIndex + 1}`;
                const rawValue = tableData.data[column.id][rowIndex + 1] || '';
                const displayValue = resolveCellValue(rawValue, cellId);
                
                return (
                  <td key={cellId} className="table-cell">
                    <TableCell
                      value={rawValue}
                      displayValue={displayValue}
                      columnType={column.type}
                      cellId={cellId}
                      isFormula={isFormula(rawValue)}
                      onValueChange={(newValue) => updateCellValue(column.id, rowIndex + 1, newValue)}
                    />
                  </td>
                );
              })}
              
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      

      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onSubmit={handleAddColumn}
        maxColumns={MAX_COLUMNS}
        currentColumnCount={tableData.columns.length}
      />
    </div>
  );
};

export default SmartTable;