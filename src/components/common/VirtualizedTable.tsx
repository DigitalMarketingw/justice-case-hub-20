
import { memo, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useVirtualization } from "@/hooks/useVirtualization";
import { Card, CardContent } from "@/components/ui/card";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  width?: string;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}

export const VirtualizedTable = memo(function VirtualizedTable<T>({
  data,
  columns,
  itemHeight = 60,
  containerHeight = 400,
  className
}: VirtualizedTableProps<T>) {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  } = useVirtualization({
    itemHeight,
    containerHeight,
    items: data
  });

  const tableContent = useMemo(() => (
    <div
      style={{
        height: totalHeight,
        position: 'relative'
      }}
    >
      <div
        style={{
          transform: `translateY(${offsetY}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }}
      >
        {visibleItems.map((item, index) => (
          <TableRow
            key={index}
            style={{ height: itemHeight }}
            className="border-b"
          >
            {columns.map((column) => (
              <TableCell
                key={column.key}
                style={{ width: column.width }}
                className="py-2"
              >
                {column.render(item)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </div>
    </div>
  ), [visibleItems, columns, itemHeight, totalHeight, offsetY]);

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div
          style={{ height: containerHeight }}
          className="overflow-auto"
          onScroll={handleScroll}
        >
          <Table>
            <TableBody>
              {tableContent}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
