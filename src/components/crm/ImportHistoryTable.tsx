import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { leadImportService } from "@/services/leadImportService";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export function ImportHistoryTable() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['import-history'],
    queryFn: () => leadImportService.getImportHistory(),
  });

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        טוען היסטוריית ייבואים...
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>עדיין לא בוצעו ייבואים</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      pending: 'secondary',
    };

    const labels: Record<string, string> = {
      completed: 'הושלם',
      failed: 'נכשל',
      processing: 'בעיבוד',
      pending: 'ממתין',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>תאריך</TableHead>
            <TableHead>שם קובץ</TableHead>
            <TableHead>סוג</TableHead>
            <TableHead className="text-center">סה"כ</TableHead>
            <TableHead className="text-center">יובאו</TableHead>
            <TableHead className="text-center">כפולים</TableHead>
            <TableHead className="text-center">שגיאות</TableHead>
            <TableHead>סטטוס</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="text-sm">
                {format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', {
                  locale: he,
                })}
              </TableCell>
              <TableCell className="font-medium">{record.file_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{record.file_type.toUpperCase()}</Badge>
              </TableCell>
              <TableCell className="text-center">{record.total_rows}</TableCell>
              <TableCell className="text-center text-green-600 font-medium">
                {record.imported_rows}
              </TableCell>
              <TableCell className="text-center text-yellow-600">
                {record.duplicate_rows}
              </TableCell>
              <TableCell className="text-center text-destructive">
                {record.error_rows}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(record.status)}
                  {getStatusBadge(record.status)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
