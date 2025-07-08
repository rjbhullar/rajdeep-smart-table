import { useMemo, useCallback } from 'react';
import type { TableData } from '../types/index';

export interface FormulaResult {
  value: number | string;
  isError: boolean;
  error?: string;
  dependencies?: string[];
}

export const useFormula = (tableData: TableData) => {
  
  /**
   * Checks if a string is a formula (starts with =)
   */
  const isFormula = useCallback((value: string | number): boolean => {
    return typeof value === 'string' && value.startsWith('=');
  }, []);

  /**
   * Extracts cell dependencies from a formula
   */
  const extractDependencies = useCallback((formula: string): string[] => {
    const cellReferencePattern = /\b([A-Z]+)(\d+)\b/g;
    const dependencies: string[] = [];
    let match;
    
    while ((match = cellReferencePattern.exec(formula)) !== null) {
      const cellId = `${match[1]}${match[2]}`;
      if (!dependencies.includes(cellId)) {
        dependencies.push(cellId);
      }
    }
    
    return dependencies;
  }, []);

  /**
   * Gets the value of a cell by column and row
   */
  const getCellValue = useCallback((column: string, row: number): string | number => {
    const columnData = tableData.data[column];
    if (!columnData || !(row in columnData)) {
      return '';
    }
    return columnData[row];
  }, [tableData]);

  /**
   * Safely evaluates a mathematical expression
   */
  const evaluateMathExpression = useCallback((expression: string): number => {
    // Remove any whitespace
    const cleanExpression = expression.replace(/\s+/g, '');
    
    // Check for empty expression
    if (cleanExpression === '') {
      throw new Error('Empty formula');
    }
    
    // Validate that expression contains only numbers, operators, and parentheses
    if (!/^[0-9+\-*/().]+$/.test(cleanExpression)) {
      throw new Error('Invalid characters in expression. Use only numbers and operators (+, -, *, /)');
    }
    
    // Check for division by zero
    if (/\/\s*0(?![0-9])/.test(cleanExpression)) {
      throw new Error('Division by zero');
    }
    
    // Check for invalid operator sequences
    if (/[\+\-\*\/]{2,}/.test(cleanExpression)) {
      throw new Error('Invalid operator sequence');
    }
    
    // Check for unmatched parentheses
    const openParens = (cleanExpression.match(/\(/g) || []).length;
    const closeParens = (cleanExpression.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      throw new Error('Unmatched parentheses');
    }
    
    // Use Function constructor for safe evaluation (more secure than eval)
    try {
      const result = new Function('"use strict"; return (' + cleanExpression + ')')();
      
      // Check for invalid results (NaN, Infinity, etc.)
      if (typeof result !== 'number') {
        throw new Error('Result is not a number');
      }
      
      if (!isFinite(result)) {
        throw new Error('Result is not finite (infinity or -infinity)');
      }
      
      if (isNaN(result)) {
        throw new Error('Result is not a valid number (NaN)');
      }
      
      // Round to 6 decimal places to avoid floating point precision issues
      return Math.round(result * 1000000) / 1000000;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid mathematical expression');
    }
  }, []);

  /**
   * Replaces cell references (A1, B2, etc.) with their actual values
   */
  const replaceCellReferences = useCallback((expression: string, calculationStack: Set<string>): string => {
    // Pattern to match cell references like A1, B2, C10, etc.
    const cellReferencePattern = /\b([A-Z]+)(\d+)\b/g;
    
    return expression.replace(cellReferencePattern, (_, column, row) => {
      const rowNumber = parseInt(row);
      const referencedCellId = `${column}${rowNumber}`;
      
      // Check for circular references
      if (calculationStack.has(referencedCellId)) {
        throw new Error(`Circular reference detected involving ${referencedCellId}`);
      }
      
      // Validate column exists
      if (!tableData.data[column]) {
        throw new Error(`Column '${column}' does not exist`);
      }
      
      // Validate row number
      if (rowNumber < 1 || rowNumber > tableData.rowCount) {
        throw new Error(`Invalid row number: ${rowNumber}. Must be between 1 and ${tableData.rowCount}`);
      }
      
      const cellValue = getCellValue(column, rowNumber);
      
      // Handle null/undefined values
      if (cellValue === undefined || cellValue === null) {
        throw new Error(`Invalid reference: ${referencedCellId}`);
      }
      
      // Convert to number if possible
      if (typeof cellValue === 'number') {
        return cellValue.toString();
      }
      
      if (typeof cellValue === 'string') {
        // If it's a formula, evaluate it recursively
        if (cellValue.startsWith('=')) {
          const newStack = new Set(calculationStack);
          newStack.add(referencedCellId);
          const result = evaluateFormula(cellValue, referencedCellId, newStack);
          if (result.isError) {
            throw new Error(`Error in cell ${referencedCellId}: ${result.error}`);
          }
          return typeof result.value === 'number' ? result.value.toString() : '0';
        }
        
        // Try to parse as number
        const numValue = parseFloat(cellValue);
        if (!isNaN(numValue) && isFinite(numValue)) {
          return numValue.toString();
        }
        
        // Empty string is treated as 0
        if (cellValue === '') {
          return '0';
        }
        
        // Non-numeric strings can't be used in calculations
        throw new Error(`Cell ${referencedCellId} contains non-numeric value: "${cellValue}"`);
      }
      
      // Empty or non-numeric cells are treated as 0
      return '0';
    });
  }, [getCellValue, tableData]);

  /**
   * Evaluates a formula and returns the result
   */
  const evaluateFormula = useCallback((formula: string, cellId: string, calculationStack: Set<string> = new Set()): FormulaResult => {
    try {
      // Validate input
      if (typeof formula !== 'string') {
        throw new Error('Formula must be a string');
      }
      
      // Remove leading "=" if present
      const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;
      
      // Check for empty formula
      if (!cleanFormula.trim()) {
        return {
          value: '',
          isError: true,
          error: 'Empty formula'
        };
      }

      // Check for circular references
      if (calculationStack.has(cellId)) {
        throw new Error(`Circular reference detected involving ${cellId}`);
      }
      
      const newStack = new Set(calculationStack);
      newStack.add(cellId);

      // Extract dependencies first for validation
      const dependencies = extractDependencies(cleanFormula);
      
      // Validate all dependencies exist
      for (const dep of dependencies) {
        const match = dep.match(/([A-Z]+)(\d+)/);
        if (!match) continue;
        
        const [, column, row] = match;
        const rowNumber = parseInt(row);
        
        if (!tableData.data[column]) {
          throw new Error(`Column '${column}' does not exist`);
        }
        
        if (rowNumber < 1 || rowNumber > tableData.rowCount) {
          throw new Error(`Invalid row number: ${rowNumber}. Must be between 1 and ${tableData.rowCount}`);
        }
      }

      // Replace cell references with actual values
      const processedExpression = replaceCellReferences(cleanFormula, newStack);
      
      // Evaluate the mathematical expression
      const result = evaluateMathExpression(processedExpression);
      
      return {
        value: result,
        isError: false,
        dependencies
      };
    } catch (error) {
      return {
        value: '',
        isError: true,
        error: error instanceof Error ? error.message : 'Invalid formula'
      };
    }
  }, [replaceCellReferences, evaluateMathExpression, extractDependencies, tableData]);

  /**
   * Gets all cells that depend on a specific cell
   */
  const getDependentCells = useCallback((changedCellId: string): string[] => {
    const dependents: string[] = [];
    
    // Check all cells in the table
    for (const columnId of Object.keys(tableData.data)) {
      const column = tableData.data[columnId];
      
      for (const rowId of Object.keys(column)) {
        const cellValue = column[parseInt(rowId)];
        
        if (isFormula(cellValue)) {
          const dependencies = extractDependencies(cellValue as string);
          if (dependencies.includes(changedCellId)) {
            dependents.push(`${columnId}${rowId}`);
          }
        }
      }
    }
    
    return dependents;
  }, [tableData, isFormula, extractDependencies]);

  /**
   * Resolves the display value for a cell (evaluates formulas)
   */
  const resolveCellValue = useCallback((value: string | number, cellId: string): string | number => {
    if (!isFormula(value)) {
      return value;
    }
    
    const result = evaluateFormula(value as string, cellId);
    return result.isError ? `#ERROR: ${result.error}` : result.value;
  }, [isFormula, evaluateFormula]);

  return useMemo(() => ({
    isFormula,
    evaluateFormula,
    getDependentCells,
    resolveCellValue,
    extractDependencies
  }), [isFormula, evaluateFormula, getDependentCells, resolveCellValue, extractDependencies]);
};