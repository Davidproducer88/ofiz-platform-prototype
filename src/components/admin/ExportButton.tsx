import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers: { key: string; label: string }[];
}

export const ExportButton = ({ data, filename, headers }: ExportButtonProps) => {
  const exportToCSV = () => {
    try {
      // Create CSV header
      const csvHeader = headers.map(h => h.label).join(',');
      
      // Create CSV rows
      const csvRows = data.map(item => {
        return headers.map(h => {
          const value = item[h.key];
          // Escape commas and quotes
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',');
      });

      // Combine header and rows
      const csvContent = [csvHeader, ...csvRows].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportación exitosa",
        description: `Se han exportado ${data.length} registros`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al exportar",
        description: "No se pudo exportar los datos",
      });
    }
  };

  return (
    <Button onClick={exportToCSV} variant="outline" size="sm">
      <Download className="w-4 h-4 mr-2" />
      Exportar CSV
    </Button>
  );
};