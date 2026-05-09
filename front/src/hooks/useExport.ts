import { ExportService, type ExportColumn } from "@/services/exportService";
import { useState } from "react";

interface UseExportOptions<T> {
    data: T[];
    columns: ExportColumn<T>[];
    filename: string;
    title: string;
}

export function useExport<T>(options: UseExportOptions<T>) {
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const exportToCSV = async () => {
        setExporting(true);
        setError(null);
        try {
            ExportService.exportToCSV(options.data, options.columns, options.filename);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setExporting(false);
        }
    };

    const exportToExcel = async () => {
        setExporting(true);
        setError(null);
        try {
            await ExportService.exportToExcel(options.data, options.columns, options.filename);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setExporting(false);
        }
    };

    const exportToPDF = async () => {
        setExporting(true);
        setError(null);
        try {
            await ExportService.exportToPDF(options.data, options.columns, options.filename, options.title);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setExporting(false);
        }
    };

    return {
        exporting,
        error,
        exportToCSV,
        exportToExcel,
        exportToPDF,
    };
}
