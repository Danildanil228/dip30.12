// front/src/services/exportService.ts
import { saveAs } from "file-saver";

export interface ExportColumn<T = any> {
    key: keyof T | string;
    header: string;
    format?: (value: any, row?: T) => string;
}

export class ExportService {
    static exportToCSV<T>(data: T[], columns: ExportColumn<T>[], filename: string): void {
        if (!data.length) return;

        const headers = columns.map((col) => this.escapeCSV(col.header)).join(",");
        const rows = data
            .map((row) => {
                return columns
                    .map((col) => {
                        let value = this.getNestedValue(row, col.key as string);
                        if (col.format) value = col.format(value, row);
                        return this.escapeCSV(value?.toString() ?? "");
                    })
                    .join(",");
            })
            .join("\n");

        const blob = new Blob(["\uFEFF" + headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `${filename}_${this.getDateString()}.csv`);
    }

    static async exportToExcel<T>(data: T[], columns: ExportColumn<T>[], filename: string): Promise<void> {
        if (!data.length) return;

        const XLSX = await import("xlsx");

        const worksheetData = [
            columns.map((col) => col.header),
            ...data.map((row) =>
                columns.map((col) => {
                    let value = this.getNestedValue(row, col.key as string);
                    if (col.format) value = col.format(value, row);
                    return value ?? "";
                }),
            ),
        ];

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Данные");
        XLSX.writeFile(wb, `${filename}_${this.getDateString()}.xlsx`);
    }

    static async exportToPDF<T>(data: T[], columns: ExportColumn<T>[], _filename: string, title: string): Promise<void> {
        if (!data.length) return;

        const html = this.generateHTML(data, columns, title);
        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            alert("Разрешите всплывающие окна для экспорта");
            return;
        }

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }

    private static generateHTML<T>(data: T[], columns: ExportColumn<T>[], title: string): string {
        const headers = columns.map((col) => col.header);
        const rows = data.map((row) =>
            columns.map((col) => {
                let value = this.getNestedValue(row, col.key as string);
                if (col.format) value = col.format(value, row);
                return value?.toString() ?? "";
            }),
        );

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
        }
        .header {
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>${title}</h2>
        <p>Дата: ${new Date().toLocaleDateString("ru-RU")}</p>
    </div>
    
    <table>
        <thead>
            <tr>${headers.map((h) => `<th>${this.escapeHtml(h)}</th>`).join("")}</tr>
        </thead>
        <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${this.escapeHtml(cell) || "-"}</td>`).join("")}</tr>`).join("")}
        </tbody>
    </table>
    
    <div class="footer">
        Всего записей: ${data.length}
    </div>
</body>
</html>`;
    }

    private static getNestedValue(obj: any, path: string): any {
        return path.split(".").reduce((current, key) => current?.[key], obj);
    }

    private static escapeCSV(value: string): string {
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    private static escapeHtml(str: string): string {
        if (!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    private static getDateString(): string {
        return new Date().toISOString().split("T")[0];
    }
}
