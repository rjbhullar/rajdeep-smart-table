import React, { useState } from 'react';
import AddColumnModal from './AddColumnModal';
import type { TableActions } from '../hooks/useTableActions';
import './TableControls.css';

interface TableControlsProps {
  tableActions: TableActions;
  currentRows: number;
  currentColumns: number;
  maxRows: number;
  maxColumns: number;
}

const TableControls: React.FC<TableControlsProps> = ({
  tableActions,
  currentRows,
  currentColumns,
  maxRows,
  maxColumns
}) => {
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);

  const handleAddColumn = (label: string, type: 'text' | 'number') => {
    tableActions.addColumn(label, type);
    setIsAddColumnModalOpen(false);
  };

  return (
    <>
      <div className="table-controls">
        <div className="controls-section">
          <h3 className="controls-title">Table Management</h3>
          
          <div className="controls-grid">
            {/* Row Controls */}
            <div className="control-group">
              <h4 className="control-group-title">Rows ({currentRows}/{maxRows})</h4>
              <div className="control-buttons">
                <button
                  onClick={tableActions.addRow}
                  disabled={!tableActions.canAddRow}
                  className="control-button control-button-primary"
                  title={tableActions.canAddRow ? 'Add new row' : `Maximum ${maxRows} rows allowed`}
                >
                  + Add Row
                </button>
                <button
                  onClick={tableActions.removeRow}
                  disabled={!tableActions.canRemoveRow}
                  className="control-button control-button-secondary"
                  title={tableActions.canRemoveRow ? 'Remove last row' : 'At least 1 row required'}
                >
                  - Remove Row
                </button>
              </div>
            </div>

            {/* Column Controls */}
            <div className="control-group">
              <h4 className="control-group-title">Columns ({currentColumns}/{maxColumns})</h4>
              <div className="control-buttons">
                <button
                  onClick={() => setIsAddColumnModalOpen(true)}
                  disabled={!tableActions.canAddColumn}
                  className="control-button control-button-primary"
                  title={tableActions.canAddColumn ? 'Add new column' : `Maximum ${maxColumns} columns allowed`}
                >
                  + Add Column
                </button>
                <button
                  onClick={tableActions.removeColumn}
                  disabled={!tableActions.canRemoveColumn}
                  className="control-button control-button-secondary"
                  title={tableActions.canRemoveColumn ? 'Remove last column' : 'At least 1 column required'}
                >
                  - Remove Column
                </button>
              </div>
            </div>
          </div>

          {/* Table Info */}
          <div className="table-info-section">
            <div className="info-item">
              <span className="info-label">Table Size:</span>
              <span className="info-value">{currentColumns} × {currentRows}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Maximum:</span>
              <span className="info-value">{maxColumns} × {maxRows}</span>
            </div>
          </div>
        </div>
      </div>

      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onSubmit={handleAddColumn}
        maxColumns={maxColumns}
        currentColumnCount={currentColumns}
      />
    </>
  );
};

export default TableControls;