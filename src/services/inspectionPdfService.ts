import { createPdfBlob, openPdfBlob, downloadPdfBlob } from '@/utils/pdf';
import { supabase } from '@/integrations/supabase/client';

export async function previewInspectionPdf(
  reportId: string, 
  template: 'classic' | 'modern' | 'elegant' | 'premium' = 'classic', 
  includeSignature = false
) {
  const { data, error } = await supabase.functions.invoke('generate-inspection-pdf', {
    body: { reportId, template, includeSignature },
  });
  
  if (error) throw new Error(error.message);
  
  const blob = createPdfBlob(data as ArrayBuffer);
  openPdfBlob(blob, `inspection-${reportId}.pdf`);
}

export async function downloadInspectionPdf(
  reportId: string,
  template: 'classic' | 'modern' | 'elegant' | 'premium' = 'classic',
  includeSignature = false
) {
  const { data, error } = await supabase.functions.invoke('generate-inspection-pdf', {
    body: { reportId, template, includeSignature },
  });
  
  if (error) throw new Error(error.message);
  
  const blob = createPdfBlob(data as ArrayBuffer);
  downloadPdfBlob(blob, `inspection-${reportId}.pdf`);
}

export async function finalizeInspectionPdf(reportId: string) {
  const { data, error } = await supabase.functions.invoke('generate-inspection-pdf', {
    body: { reportId, upload: true },
  });
  
  if (error) throw new Error(error.message);
  
  return data as { ok: boolean; url?: string };
}

export async function emailInspectionPdf(
  reportId: string,
  to: string,
  subject?: string,
  message?: string
) {
  const { data, error } = await supabase.functions.invoke('send-inspection-report-email', {
    body: { reportId, to, subject, message },
  });
  
  if (error) throw new Error(error.message);
  
  return data as { ok: boolean };
}
