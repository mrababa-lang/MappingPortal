import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ADPMapping } from '../types';

export const ExportService = {
  /**
   * Export raw data to CSV, Excel, or PDF
   */
  exportData: (data: any[], fileName: string, format: 'csv' | 'xlsx' | 'pdf') => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }

    if (format === 'xlsx') {
       const ws = XLSX.utils.json_to_sheet(data);
       const wb = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, "Data");
       XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else if (format === 'csv') {
       const ws = XLSX.utils.json_to_sheet(data);
       const csv = XLSX.utils.sheet_to_csv(ws);
       const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
       const link = document.createElement("a");
       link.href = URL.createObjectURL(blob);
       link.download = `${fileName}.csv`;
       link.click();
    } else if (format === 'pdf') {
       const doc = new jsPDF('l'); // Landscape
       const keys = Object.keys(data[0] || {});
       // Filter keys to fit in PDF better if too many, currently taking all
       const rows = data.map(obj => keys.map(k => String(obj[k] || '')));
       
       doc.setFontSize(10);
       doc.text(`Data Export: ${fileName}`, 14, 10);
       
       autoTable(doc, { 
         head: [keys], 
         body: rows,
         startY: 15,
         theme: 'grid',
         styles: { fontSize: 8 }
       });
       doc.save(`${fileName}.pdf`);
    }
  },

  /**
   * Generate a Monthly/Weekly Summary Report PDF
   */
  generateSummaryReport: (mappings: ADPMapping[], type: 'monthly' | 'weekly', fileName: string) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${type === 'monthly' ? 'Monthly' : 'Weekly'} Mapping Summary Report`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // 1. Aggregate Data by Time Period
    const stats: Record<string, { total: number, mapped: number, issues: number }> = {};
    
    mappings.forEach(m => {
        if (!m.updatedAt) return;
        const date = new Date(m.updatedAt);
        
        let key = '';
        if (type === 'monthly') {
             // YYYY-MM
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else {
             // YYYY-Www
             const startOfYear = new Date(date.getFullYear(), 0, 1);
             const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
             const week = Math.ceil((days + 1) / 7);
             key = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
        }
        
        if (!stats[key]) stats[key] = { total: 0, mapped: 0, issues: 0 };
        
        stats[key].total++;
        if (!m.status || m.status === 'MAPPED') stats[key].mapped++;
        else stats[key].issues++;
    });

    // 2. Sort Keys (descending time)
    const sortedKeys = Object.keys(stats).sort().reverse();
    
    const rows = sortedKeys.map(key => [
        key,
        stats[key].total,
        stats[key].mapped,
        stats[key].issues,
        `${((stats[key].mapped / stats[key].total) * 100).toFixed(1)}%`
    ]);

    // 3. Render Table
    autoTable(doc, {
        startY: 40,
        head: [[type === 'monthly' ? 'Month' : 'Week', 'Total Updates', 'Mapped', 'Flagged Issues', 'Success Rate']],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] } // Indigo-600
    });

    // 4. Add Summary Footer
    const totalMapped = sortedKeys.reduce((acc, key) => acc + stats[key].mapped, 0);
    const totalIssues = sortedKeys.reduce((acc, key) => acc + stats[key].issues, 0);
    
    doc.text(`Total Mapped (Historical): ${totalMapped}`, 14, (doc as any).lastAutoTable.finalY + 10);
    doc.text(`Total Issues (Historical): ${totalIssues}`, 14, (doc as any).lastAutoTable.finalY + 16);

    doc.save(`${fileName}.pdf`);
  }
};