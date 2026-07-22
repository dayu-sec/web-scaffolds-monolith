import { Spin } from 'antd';
import type { ReactNode } from 'react';

import styles from './DenseStateTable.module.css';

type RowTone = 'danger' | 'disabled' | 'neutral' | 'warning';

export interface DenseStateTableColumn {
  key: string;
  title: string;
  width?: string;
}

export interface DenseStateTableRow {
  key: string;
  tone?: RowTone;
  values: Record<string, ReactNode>;
}

interface DenseStateTableProps {
  columns: DenseStateTableColumn[];
  rows: DenseStateTableRow[];
  emptyText: string;
  loading?: boolean;
  errorText?: string;
}

/** 展示日志类记录和中英混排字段的紧凑状态表格。 */
export default function DenseStateTable({
  columns,
  rows,
  emptyText,
  loading = false,
  errorText,
}: DenseStateTableProps) {
  if (loading) {
    return (
      <div className={styles.state} role="status">
        <Spin size="small" />
        <span>Loading rows</span>
      </div>
    );
  }

  if (errorText) {
    return (
      <div className={styles.state} role="alert">
        {errorText}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={styles.state} role="status">
        {emptyText}
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ width: column.width }}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className={getRowClass(row.tone)} key={row.key}>
              {columns.map((column) => (
                <td className={styles.cell} key={column.key}>
                  {row.values[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getRowClass(tone: RowTone = 'neutral') {
  if (tone === 'warning') {
    return styles.rowWarning;
  }
  if (tone === 'danger') {
    return styles.rowDanger;
  }
  if (tone === 'disabled') {
    return styles.rowDisabled;
  }
  return undefined;
}
