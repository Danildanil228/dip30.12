import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, File, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
    data: any[];
    columns: Array<{
        accessorKey: string;
        header: string;
        format?: (value: any) => string;
    }>;
    filename: string;
    title: string;
}

export default function ExportButton({ data, columns, filename, title }: ExportButtonProps) {
    const [exporting, setExporting] = useState(false);

    if (!data || data.length === 0) {
        return (
            <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Нет данных
            </Button>
        );
    }

    const formatCellValue = (value: any, formatFn?: (value: any) => string): string => {
        if (value === null || value === undefined) return "";
        if (formatFn) {
            try {
                const result = formatFn(value);
                return result || "";
            } catch {
                return String(value);
            }
        }
        return String(value);
    };

    const exportToCSV = () => {
        setExporting(true);
        try {
            const headers = columns.map((col) => col.header).join(",");

            const rows = data
                .map((item) => {
                    return columns
                        .map((col) => {
                            let value = item[col.header];
                            const formattedValue = formatCellValue(value, col.format);
                            if (formattedValue.includes(",") || formattedValue.includes('"') || formattedValue.includes("\n")) {
                                return `"${formattedValue.replace(/"/g, '""')}"`;
                            }
                            return formattedValue;
                        })
                        .join(",");
                })
                .join("\n");

            const csvContent = headers + "\n" + rows;
            const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Ошибка экспорта в CSV:", error);
            alert("Ошибка при экспорте в CSV");
        } finally {
            setExporting(false);
        }
    };

    const exportToExcel = async () => {
        setExporting(true);
        try {
            const XLSX = await import("xlsx");

            const worksheetData = data.map((item) => {
                const row: any = {};
                columns.forEach((col) => {
                    let value = item[col.header];
                    row[col.header] = formatCellValue(value, col.format);
                });
                return row;
            });

            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, title.substring(0, 31));

            XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
        } catch (error) {
            console.error("Ошибка экспорта в Excel:", error);
            alert("Ошибка при экспорте в Excel");
        } finally {
            setExporting(false);
        }
    };

    const exportToPDF = () => {
        setExporting(true);

        try {
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                alert("Разрешите всплывающие окна для экспорта");
                setExporting(false);
                return;
            }

            const formattedData = data.map((item) => {
                const row: any = {};
                columns.forEach((col) => {
                    let value = item[col.header];
                    row[col.header] = formatCellValue(value, col.format);
                });
                return row;
            });

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <meta charset="UTF-8">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        @media print {
                            @page { margin: 10mm; }
                            .controls { display: none !important; }
                            tr { page-break-inside: avoid; }
                        }
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: white; }
                        .controls { position: fixed; top: 10px; right: 10px; background: white; padding: 10px; border: 1px solid #ccc; border-radius: 4px; z-index: 1000; }
                        button { padding: 6px 12px; margin: 0 5px; border: none; border-radius: 4px; cursor: pointer; }
                        .print-btn { background: #007bff; color: white; }
                        .close-btn { background: #6c757d; color: white; }
                        .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #333; }
                        h1 { font-size: 18px; margin-bottom: 8px; }
                        .info { font-size: 11px; color: #666; margin-top: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #999; }
                    </style>
                </head>
                <body>
                    <div class="controls">
                        <button class="print-btn" onclick="window.print()">🖨️ Печать</button>
                        <button class="close-btn" onclick="window.close()">✕ Закрыть</button>
                    </div>
                    <div class="header">
                        <h1>${title}</h1>
                        <div class="info">
                            Дата формирования: ${new Date().toLocaleDateString("ru-RU")}<br>
                            Всего записей: ${data.length}
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>${columns.map((col) => `<th>${col.header}</th>`).join("")}</tr>
                        </thead>
                        <tbody>
                            ${formattedData
                                .map(
                                    (row) => `
                                <tr>
                                    ${columns
                                        .map((col) => {
                                            let value = row[col.header];
                                            const displayText = String(value || "-");
                                            return `<td>${displayText.substring(0, 100)}</td>`;
                                        })
                                        .join("")}
                                </tr>
                            `,
                                )
                                .join("")}
                        </tbody>
                    </table>
                    <div class="footer">Сгенерировано в системе Material House</div>
                    <script>setTimeout(() => window.print(), 500);</script>
                </body>
                </html>
            `;

            printWindow.document.write(html);
            printWindow.document.close();
        } catch (error) {
            console.error("Ошибка экспорта:", error);
            alert("Ошибка при подготовке документа");
        } finally {
            setExporting(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exporting}>
                    {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {exporting ? "Экспорт..." : "Экспорт"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToPDF} disabled={exporting}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel} disabled={exporting}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV} disabled={exporting}>
                    <File className="h-4 w-4 mr-2" />
                    CSV
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
