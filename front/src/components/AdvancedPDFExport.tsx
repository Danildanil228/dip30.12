// front/src/components/AdvancedPDFExport.tsx
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface AdvancedPDFExportProps {
    data: any[];
    columns: Array<{
        accessorKey: string;
        header: string;
        width?: number;
        format?: (value: any) => string;
    }>;
    filename: string;
    title: string;
    subtitle?: string;
}

export default function AdvancedPDFExport({ data, columns, filename, title, subtitle }: AdvancedPDFExportProps) {
    const handleExportPDF = async () => {
        try {
            const { jsPDF } = await import('jspdf');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 10;
            let yPos = margin;
            
            // Заголовок
            pdf.setFontSize(16);
            pdf.text(title, pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            
            // Подзаголовок
            if (subtitle) {
                pdf.setFontSize(10);
                pdf.text(subtitle, pageWidth / 2, yPos, { align: 'center' });
                yPos += 5;
            }
            
            // Информация
            pdf.setFontSize(10);
            pdf.text(`Дата экспорта: ${new Date().toLocaleDateString()}`, margin, yPos);
            pdf.text(`Количество записей: ${data.length}`, pageWidth - margin, yPos, { align: 'right' });
            yPos += 10;
            
            // Рассчитываем ширины колонок
            const colWidths = columns.map(col => col.width || 30);
            const totalWidth = colWidths.reduce((a, b) => a + b, 0);
            const scale = (pageWidth - margin * 2) / totalWidth;
            const scaledWidths = colWidths.map(w => w * scale);
            
            // Заголовки таблицы
            pdf.setFontSize(11);
            pdf.setFillColor(240, 240, 240);
            columns.forEach((col, i) => {
                const x = margin + scaledWidths.slice(0, i).reduce((a, b) => a + b, 0);
                pdf.rect(x, yPos, scaledWidths[i], 8, 'F');
                pdf.text(col.header, x + 2, yPos + 6);
            });
            yPos += 8;
            
            // Данные
            pdf.setFontSize(10);
            data.forEach((item, rowIndex) => {
                // Проверяем, нужно ли новую страницу
                if (yPos > pdf.internal.pageSize.getHeight() - 20) {
                    pdf.addPage();
                    yPos = margin;
                    
                    // Повторяем заголовки на новой странице
                    pdf.setFontSize(11);
                    pdf.setFillColor(240, 240, 240);
                    columns.forEach((col, i) => {
                        const x = margin + scaledWidths.slice(0, i).reduce((a, b) => a + b, 0);
                        pdf.rect(x, yPos, scaledWidths[i], 8, 'F');
                        pdf.text(col.header, x + 2, yPos + 6);
                    });
                    yPos += 8;
                    pdf.setFontSize(10);
                }
                
                // Данные строки
                columns.forEach((col, i) => {
                    const x = margin + scaledWidths.slice(0, i).reduce((a, b) => a + b, 0);
                    let value = item[col.accessorKey];
                    if (col.format) {
                        value = col.format(value);
                    }
                    
                    // Обрезаем текст если слишком длинный
                    const text = String(value || '');
                    pdf.text(text.substring(0, 50), x + 2, yPos + 4);
                });
                yPos += 6;
            });
            
            // Футер
            pdf.setFontSize(8);
            pdf.text(`Страница 1 из 1 • Сгенерировано ${new Date().toLocaleString()}`, 
                    pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
            
            pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Ошибка экспорта в PDF:", error);
            alert("Ошибка при экспорте в PDF");
        }
    };

    return (
        <Button variant="outline" onClick={handleExportPDF} disabled={data.length === 0}>
            <FileText className="h-4 w-4 mr-2" />
            PDF (расширенный)
        </Button>
    );
}