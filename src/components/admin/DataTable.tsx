import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | "actions";
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm text-white/70">
        <thead className="text-xs uppercase bg-white/[0.02] text-white/50 border-b border-white/5">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`px-6 py-4 font-medium tracking-wider ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-white/[0.02] transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${col.className || ""}`}>
                  {col.cell ? col.cell(row) : col.accessorKey === "actions" ? null : row[col.accessorKey as keyof T] as ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
