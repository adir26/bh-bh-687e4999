import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Copy, 
  FileText, 
  Share2,
  MoreVertical 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InspectionReport } from '@/hooks/useInspectionReports';
import { EmptyState } from '@/components/ui/empty-state';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface InspectionTableProps {
  reports: InspectionReport[];
  loading?: boolean;
}

const statusConfig = {
  draft: { label: 'טיוטה', variant: 'outline' as const },
  in_progress: { label: 'בתהליך', variant: 'blue' as const },
  final: { label: 'סופי', variant: 'green' as const },
  sent: { label: 'נשלח', variant: 'purple' as const },
};

const reportTypeLabels: Record<string, string> = {
  home_inspection: 'בדק בית',
  plumbing: 'אינסטלציה',
  supervision: 'פיקוח',
  leak_detection: 'איתור נזילות',
  qa: 'בקרת איכות',
  safety: 'בטיחות',
  consultants: 'יועצים',
  handover: 'מסירה',
  common_areas: 'שטחים משותפים',
};

export function InspectionTable({ reports, loading }: InspectionTableProps) {
  const navigate = useNavigate();

  if (!loading && reports.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="אין דוחות להצגה"
        description="התחל ביצירת דוח חדש כדי לעקוב אחר בדיקות ופרויקטים"
        action={{
          label: '+ דוח חדש',
          onClick: () => navigate('/inspection/new'),
        }}
      />
    );
  }

  const handleOpen = (reportId: string) => {
    navigate(`/inspection/${reportId}`);
  };

  const handleDuplicate = (reportId: string) => {
    console.log('Duplicate report:', reportId);
    // TODO: Implement in next phase
  };

  const handleViewPDF = (pdfUrl?: string) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleShare = (reportId: string) => {
    console.log('Share report:', reportId);
    // TODO: Implement in next phase
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">#דוח</TableHead>
            <TableHead className="text-right">סוג דוח</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
            <TableHead className="text-right">גרסה</TableHead>
            <TableHead className="text-right">ממצאים</TableHead>
            <TableHead className="text-right">עדכון אחרון</TableHead>
            <TableHead className="text-left">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-mono text-sm">
                {report.id.substring(0, 8)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {reportTypeLabels[report.report_type] || report.report_type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig[report.status].variant}>
                  {statusConfig[report.status].label}
                </Badge>
              </TableCell>
              <TableCell>{report.version}</TableCell>
              <TableCell className="text-muted-foreground">0</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(report.updated_at), 'dd/MM/yyyy HH:mm', { locale: he })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpen(report.id)}
                    title="פתח דוח"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDuplicate(report.id)}>
                        <Copy className="h-4 w-4 ml-2" />
                        שכפל דוח
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleViewPDF(report.pdf_url)}
                        disabled={!report.pdf_url}
                      >
                        <FileText className="h-4 w-4 ml-2" />
                        הצג PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShare(report.id)}
                        disabled={!report.pdf_url}
                      >
                        <Share2 className="h-4 w-4 ml-2" />
                        שתף דוח
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}