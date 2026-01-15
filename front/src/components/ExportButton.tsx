// front/src/components/ExportButton.tsx
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

    const exportToCSV = () => {
        setExporting(true);
        try {
            const headers = columns.map(col => col.header).join(',');
            const rows = data.map(item => 
                columns.map(col => {
                    let value = item[col.accessorKey];
                    if (col.format) {
                        value = col.format(value);
                    }
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    return value || '';
                }).join(',')
            ).join('\n');
            
            const csvContent = headers + '\n' + rows;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
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
            const XLSX = await import('xlsx');
            
            const worksheetData = data.map(item => {
                const row: any = {};
                columns.forEach(col => {
                    let value = item[col.accessorKey];
                    if (col.format) {
                        value = col.format(value);
                    }
                    row[col.header] = value;
                });
                return row;
            });
            
            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, title);
            
            XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error("Ошибка экспорта в Excel:", error);
            alert("Ошибка при экспорте в Excel");
        } finally {
            setExporting(false);
        }
    };

    // ПРОСТОЙ PDF ЭКСПОРТ - ОДНА ТАБЛИЦА
    const exportToPDF = () => {
        if (data.length === 0) {
            alert("Нет данных для экспорта");
            return;
        }

        setExporting(true);
        
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Разрешите всплывающие окна для экспорта');
                setExporting(false);
                return;
            }

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <meta charset="UTF-8">
                    <style>
                        /* Печать */
                        @media print {
                            @page {
                                margin: 10mm;
                            }
                            body {
                                font-family: Arial, sans-serif;
                                font-size: 10pt;
                                margin: 0;
                                padding: 0;
                                color: black;
                            }
                            .no-print {
                                display: none !important;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                table-layout: fixed;
                            }
                            th, td {
                                border: 1px solid black;
                                padding: 4px 6px;
                                font-size: 9pt;
                                word-wrap: break-word;
                            }
                            th {
                                background-color: #f0f0f0;
                                font-weight: bold;
                            }
                        }
                        
                        /* Предпросмотр */
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            background: white;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 10px;
                            border-bottom: 2px solid #333;
                        }
                        h1 {
                            margin: 0 0 10px 0;
                            font-size: 18px;
                        }
                        .info {
                            margin-bottom: 15px;
                            font-size: 12px;
                            color: #666;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 10px;
                        }
                        th, td {
                            border: 1px solid #ccc;
                            padding: 6px 8px;
                            font-size: 11px;
                        }
                        th {
                            background-color: #f5f5f5;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        .controls {
                            position: fixed;
                            top: 10px;
                            right: 10px;
                            background: white;
                            padding: 10px;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            z-index: 1000;
                        }
                        button {
                            padding: 8px 15px;
                            margin: 5px;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        }
                        .print-btn {
                            background: #007bff;
                            color: white;
                        }
                        .close-btn {
                            background: #6c757d;
                            color: white;
                        }
                    </style>
                </head>
                <body>
                    <div class="controls no-print">
                        <button class="print-btn" onclick="window.print()">
                            🖨️ Печать
                        </button>
                        <button class="close-btn" onclick="window.close()">
                            ✕ Закрыть
                        </button>
                    </div>
                    
                    <div class="header">
                        <h1>${title}</h1>
                        <div class="info">
                            <div>Дата: ${new Date().toLocaleDateString('ru-RU')}</div>
                            <div>Всего записей: ${data.length}</div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                ${columns.map(col => `<th>${col.header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(item => `
                                <tr>
                                    ${columns.map(col => {
                                        let value = item[col.accessorKey];
                                        if (col.format) {
                                            value = col.format(value);
                                        }
                                        const text = String(value || '');
                                        // Обрезаем слишком длинный текст
                                        const displayText = text.length > 80 
                                            ? text.substring(0, 77) + '...' 
                                            : text;
                                        return `<td>${displayText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <script>
                        // Автоматически печатаем через 1 секунду
                        setTimeout(function() {
                            window.print();
                        }, 1000);
                        
                        // Закрываем окно после печати
                        window.onafterprint = function() {
                            setTimeout(function() {
                                window.close();
                            }, 500);
                        };
                    </script>
                </body>
                </html>
            `;

            printWindow.document.write(html);
            printWindow.document.close();
            
            setTimeout(() => {
                setExporting(false);
            }, 1000);
            
        } catch (error) {
            console.error("Ошибка экспорта:", error);
            alert("Ошибка при подготовке документа");
            setExporting(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exporting || data.length === 0}>
                    {exporting ? (
                        <Loader2 className=" mr-2 animate-spin" />
                    ) : (
                        <Download className="mr-2" />
                    )}
                    {exporting ? "Экспорт..." : "Экспорт"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToPDF} disabled={exporting || data.length === 0}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel} disabled={exporting || data.length === 0}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV} disabled={exporting || data.length === 0}>
                    <File className="h-4 w-4 mr-2" />
                    CSV
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}