import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column {
    key: string;
    header: string;
    width?: string;
    format?: (value: any, row?: any) => React.ReactNode;
}

interface ReportTableProps {
    columns: Column[];
    data: any[];
    onRowClick?: (row: any) => void;
    itemsPerPage?: number;
}

export function ReportTable({ columns, data, onRowClick, itemsPerPage = 10 }: ReportTableProps) {
    const [currentPage, setCurrentPage] = useState(0);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

    if (data.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">Нет данных для отображения</div>;
    }

    return (
        <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.key} style={{ width: col.width }}>
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((row, idx) => (
                            <TableRow key={idx} className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""} onClick={() => onRowClick?.(row)}>
                                {columns.map((col) => (
                                    <TableCell key={col.key}>{col.format ? col.format(row[col.key], row) : (row[col.key] ?? "-")}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Показано {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} из {data.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))} disabled={currentPage === 0}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                            {currentPage + 1} / {totalPages}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))} disabled={currentPage === totalPages - 1}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
