import React, { useState } from 'react';
import './SmartTable.css';
import type { TableData } from '../types/index';
import FilterIcon from '../assets/filter-icon.svg';
import SortIcon from '../assets/sort-icon.svg';
import TableCell from './TableCell';

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

  // Update cell value in the Excel-style data structure
  const updateCellValue = (columnId: string, rowIndex: number, newValue: string | number) => {
    setTableData(prevData => ({
      ...prevData,
      data: {
        ...prevData.data,
        [columnId]: {
          ...prevData.data[columnId],
          [rowIndex]: newValue
        }
      }
    }));
  };

  return (
    <div className="smart-table-container">
      <table className="smart-table">
        <thead>
          <tr>
            {tableData.columns.map((column, index) => (
              <th key={column.id} className="table-header">
                {column.label}
                {column.type === 'number' && (
                  <img src={SortIcon} alt="sort" className="header-icon" />
                )}
                {column.type === 'text' && (
                  <img src={FilterIcon} alt="filter" className="header-icon" />
                )}
                {index < tableData.columns.length - 1 && <div className="header-separator">|</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: tableData.rowCount }, (_, rowIndex) => (
            <tr key={rowIndex + 1} className="table-row">
              {tableData.columns.map((column) => (
                <td key={`${column.id}-${rowIndex + 1}`} className="table-cell">
                  <TableCell
                    value={tableData.data[column.id][rowIndex + 1] || ''}
                    columnType={column.type}
                    onValueChange={(newValue) => updateCellValue(column.id, rowIndex + 1, newValue)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SmartTable;