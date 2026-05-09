import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, File, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useExport } from "@/hooks/useExport";
import type { ExportColumn } from "@/services/exportService";

interface ExportDropdownProps<T> {
    data: T[];
    columns: ExportColumn<T>[];
    filename: string;
    title: string;
}

export function ExportDropdown<T>({ data, columns, filename, title }: ExportDropdownProps<T>) {
    const { exporting, exportToCSV, exportToExcel, exportToPDF } = useExport({
        data,
        columns,
        filename,
        title,
    });

    if (!data.length) {
        return (
            <Button variant="outline" disabled className="bg-background z-10">
                <Download className="mr-2 h-4 w-4" />
                Нет данных
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="z-10 bg-background!">
                <Button variant="outline" disabled={exporting}>
                    {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {exporting ? "Экспорт..." : "Экспорт"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                    <File className="mr-2 h-4 w-4" />
                    CSV
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
