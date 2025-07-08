export interface TableData {
  data: Record<string, Record<number, string | number>>;
  columns: ColumnConfig[];
  rowCount: number;
}

export interface ColumnConfig {
  id: string;
  label: string;
  type: 'text' | 'number';
}