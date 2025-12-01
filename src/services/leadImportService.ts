import { supabase } from "@/integrations/supabase/client";

export interface ImportResult {
  success: boolean;
  importId: string;
  total_rows: number;
  imported_rows: number;
  duplicate_rows: number;
  error_rows: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
    data: any;
  }>;
  error?: string;
}

export interface ImportHistory {
  id: string;
  file_name: string;
  file_type: string;
  total_rows: number;
  imported_rows: number;
  duplicate_rows: number;
  error_rows: number;
  status: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export const leadImportService = {
  async importFile(file: File, fieldMapping: Record<string, string>): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldMapping', JSON.stringify(fieldMapping));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      'https://yislkmhnitznvbxfpcxd.supabase.co/functions/v1/import-leads',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Import failed');
    }

    return await response.json();
  },

  async getImportHistory(): Promise<ImportHistory[]> {
    const { data, error } = await supabase
      .from('lead_imports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async parseFilePreview(file: File): Promise<{
    headers: string[];
    preview: string[][];
    totalRows: number;
  }> {
    const content = await file.text();
    const fileType = file.name.endsWith('.xml') ? 'xml' : 'csv';

    if (fileType === 'csv') {
      return parseCSVPreview(content);
    } else {
      return parseXMLPreview(content);
    }
  },
};

function parseCSVPreview(content: string): {
  headers: string[];
  preview: string[][];
  totalRows: number;
} {
  const lines = content.trim().split('\n');
  if (lines.length === 0) {
    return { headers: [], preview: [], totalRows: 0 };
  }

  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0]
    .split(separator)
    .map((h) => h.trim().replace(/^["']|["']$/g, ''));

  const preview: string[][] = [];
  for (let i = 1; i < Math.min(6, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line, separator);
    preview.push(values);
  }

  return {
    headers,
    preview,
    totalRows: lines.length - 1,
  };
}

function parseCSVLine(line: string, separator: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values.map((v) => v.replace(/^["']|["']$/g, ''));
}

function parseXMLPreview(content: string): {
  headers: string[];
  preview: string[][];
  totalRows: number;
} {
  const leadMatches = [...content.matchAll(/<lead[^>]*>([\s\S]*?)<\/lead>/gi)];
  const totalRows = leadMatches.length;

  if (totalRows === 0) {
    return { headers: [], preview: [], totalRows: 0 };
  }

  // Extract common fields from first lead
  const firstLead = leadMatches[0][1];
  const tagMatches = [...firstLead.matchAll(/<(\w+)[^>]*>[^<]*<\/\1>/gi)];
  const headers = tagMatches.map((m) => m[1]);

  const preview: string[][] = [];
  for (let i = 0; i < Math.min(5, leadMatches.length); i++) {
    const leadXml = leadMatches[i][1];
    const row: string[] = [];

    headers.forEach((header) => {
      const regex = new RegExp(`<${header}[^>]*>([^<]*)<\/${header}>`, 'i');
      const match = leadXml.match(regex);
      row.push(match ? match[1].trim() : '');
    });

    preview.push(row);
  }

  return {
    headers,
    preview,
    totalRows,
  };
}
