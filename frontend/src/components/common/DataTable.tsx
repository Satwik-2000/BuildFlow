import { Table, Input, Space, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableProps, ColumnType } from "antd/es/table";
import { motion } from "framer-motion";
import "./DataTable.css";

export interface DataTableProps<T> extends Omit<TableProps<T>, "columns"> {
  columns: ColumnType<T>[];
  searchPlaceholder?: string;
  onSearch?: (v: string) => void;
  loading?: boolean;
}

export default function DataTable<T extends object>({
  columns,
  searchPlaceholder = "Search...",
  onSearch,
  loading,
  ...props
}: DataTableProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="data-table-wrapper"
    >
      {onSearch && (
        <div className="data-table-toolbar">
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ maxWidth: 320 }}
            size="large"
          />
        </div>
      )}
      <Table<T>
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        className="data-table"
        {...props}
      />
    </motion.div>
  );
}
