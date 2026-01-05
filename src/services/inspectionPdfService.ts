import { createAndValidatePdfBlob, openPdfBlob, downloadPdfBlob } from '@/utils/pdf';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_FUNCTIONS_BASE_URL = 'https://yislkmhnitznvbxfpcxd.supabase.co/functions/v1';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpc2xrbWhuaXR6bnZieGZwY3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTc0ODEsImV4cCI6MjA2OTI5MzQ4MX0.yt9-ethxGb1ztiLT7mXYZyVqGu0P1a37BG6Ju2NnUHk';

async function fetchInspectionPdfArrayBuffer(body: unknown): Promise<ArrayBuffer> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  const res = await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/generate-inspection-pdf`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`PDF generation failed (${res.status}). ${errText.slice(0, 200)}`);
  }

  // Upload mode returns JSON
  if (contentType.includes('application/json')) {
    const json = await res.json();
    throw new Error(json?.error || 'PDF function returned JSON instead of PDF');
  }

  return await res.arrayBuffer();
}

export async function previewInspectionPdf(
  reportId: string,
  template: 'classic' | 'modern' | 'elegant' | 'premium' = 'classic',
  includeSignature = false
) {
  const bytes = await fetchInspectionPdfArrayBuffer({ reportId, template, includeSignature });
  const blob = await createAndValidatePdfBlob(bytes);
  openPdfBlob(blob, `inspection-${reportId}.pdf`);
}

export async function downloadInspectionPdf(
  reportId: string,
  template: 'classic' | 'modern' | 'elegant' | 'premium' = 'classic',
  includeSignature = false
) {
  const bytes = await fetchInspectionPdfArrayBuffer({ reportId, template, includeSignature });
  const blob = await createAndValidatePdfBlob(bytes);
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
