import { saveAs } from "file-saver";

export interface ExportColumn<T = any> {
    key: keyof T | string;
    header: string;
    format?: (value: any, row?: T) => string;
}

export class ExportService {
    static exportToCSV<T>(data: T[], columns: ExportColumn<T>[], filename: string): void {
        if (!data.length) {
            console.warn("Нет данных для экспорта");
            return;
        }

        const headers = columns.map((col) => this.escapeCSV(col.header)).join(",");
        const rows = data
            .map((row) => {
                return columns
                    .map((col) => {
                        let value = this.getNestedValue(row, col.key as string);
                        if (col.format) {
                            value = col.format(value, row);
                        }
                        const stringValue = value?.toString() ?? "";
                        return this.escapeCSV(stringValue);
                    })
                    .join(",");
            })
            .join("\n");

        const csvContent = "\uFEFF" + headers + "\n" + rows;
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `${filename}_${this.getDateString()}.csv`);
    }

    static async exportToExcel<T>(data: T[], columns: ExportColumn<T>[], filename: string): Promise<void> {
        if (!data.length) {
            console.warn("Нет данных для экспорта");
            return;
        }

        try {
            const XLSX = await import("xlsx");

            const worksheetData = [
                columns.map((col) => col.header),
                ...data.map((row) =>
                    columns.map((col) => {
                        let value = this.getNestedValue(row, col.key as string);
                        if (col.format) {
                            value = col.format(value, row);
                        }
                        return value ?? "";
                    }),
                ),
            ];

            const ws = XLSX.utils.aoa_to_sheet(worksheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Данные");

            ws["!cols"] = columns.map(() => ({ wch: 20 }));

            XLSX.writeFile(wb, `${filename}_${this.getDateString()}.xlsx`);
        } catch (error) {
            console.error("Ошибка экспорта в Excel:", error);
            throw new Error("Не удалось экспортировать в Excel");
        }
    }

    static async exportToPDF<T>(data: T[], columns: ExportColumn<T>[], filename: string, title: string): Promise<void> {
        if (!data.length) {
            console.warn("Нет данных для экспорта");
            return;
        }

        try {
            const { jsPDF } = await import("jspdf");
            const autoTable = (await import("jspdf-autotable")).default;

            const doc = new jsPDF("landscape", "mm", "a4");

            doc.setFontSize(16);
            doc.text(title, 14, 15);

            doc.setFontSize(10);
            doc.text(`Дата формирования: ${new Date().toLocaleDateString("ru-RU")}`, 14, 25);
            doc.text(`Всего записей: ${data.length}`, 14, 32);

            const tableData = data.map((row) =>
                columns.map((col) => {
                    let value = this.getNestedValue(row, col.key as string);
                    if (col.format) {
                        value = col.format(value, row);
                    }
                    return value?.toString() ?? "";
                }),
            );

            autoTable(doc, {
                head: [columns.map((col) => col.header)],
                body: tableData,
                startY: 40,
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9, fontStyle: "bold" },
                alternateRowStyles: { fillColor: [240, 240, 240] },
                margin: { top: 40, left: 10, right: 10 },
            });

            doc.save(`${filename}_${this.getDateString()}.pdf`);
        } catch (error) {
            console.error("Ошибка экспорта в PDF:", error);
            throw new Error("Не удалось экспортировать в PDF");
        }
    }

    private static getNestedValue(obj: any, path: string): any {
        return path.split(".").reduce((current, key) => current?.[key], obj);
    }

    private static escapeCSV(value: string): string {
        if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    private static getDateString(): string {
        return new Date().toISOString().split("T")[0];
    }
}
