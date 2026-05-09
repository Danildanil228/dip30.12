import { ExportService, type ExportColumn } from "@/services/exportService";
import { useState } from "react";

export function useExport<T>(options: { data: T[]; columns: ExportColumn<T>[]; filename: string; title: string }) {
    const [exporting, setExporting] = useState(false);

    const exportToCSV = async () => {
        setExporting(true);
        try {
            ExportService.exportToCSV(options.data, options.columns, options.filename);
        } finally {
            setExporting(false);
        }
    };

    const exportToExcel = async () => {
        setExporting(true);
        try {
            await ExportService.exportToExcel(options.data, options.columns, options.filename);
        } finally {
            setExporting(false);
        }
    };

    const exportToPDF = async () => {
        setExporting(true);
        try {
            await ExportService.exportToPDF(options.data, options.columns, options.filename, options.title);
        } finally {
            setExporting(false);
        }
    };

    return { exporting, exportToCSV, exportToExcel, exportToPDF };
}
