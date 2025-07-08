import React, { useState } from 'react';
import './AddColumnModal.css';

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (label: string, type: 'text' | 'number') => void;
  maxColumns: number;
  currentColumnCount: number;
}

const AddColumnModal: React.FC<AddColumnModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  maxColumns,
  currentColumnCount
}) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'text' | 'number'>('text');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!label.trim()) {
      setError('Column label is required');
      return;
    }

    if (label.trim().length > 50) {
      setError('Column label must be 50 characters or less');
      return;
    }

    if (currentColumnCount >= maxColumns) {
      setError(`Maximum of ${maxColumns} columns allowed`);
      return;
    }

    // Submit the new column
    onSubmit(label.trim(), type);
    
    // Reset form
    setLabel('');
    setType('text');
    setError('');
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setLabel('');
    setType('text');
    setError('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="modal-header">
          <h3>Add New Column</h3>
          <button 
            className="modal-close-button"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="column-label" className="form-label">
              Column Label *
            </label>
            <input
              id="column-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter column name"
              className={`form-input ${error ? 'form-input-error' : ''}`}
              maxLength={50}
              autoFocus
            />
            <div className="form-hint">
              {label.length}/50 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="column-type" className="form-label">
              Column Type
            </label>
            <select
              id="column-type"
              value={type}
              onChange={(e) => setType(e.target.value as 'text' | 'number')}
              className="form-select"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
            </select>
            <div className="form-hint">
              {type === 'text' 
                ? 'Accepts any text input' 
                : 'Accepts only numeric values and formulas'
              }
            </div>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="button button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={currentColumnCount >= maxColumns}
            >
              Add Column
            </button>
          </div>
        </form>

        <div className="modal-footer">
          <div className="table-info">
            Columns: {currentColumnCount}/{maxColumns}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddColumnModal;