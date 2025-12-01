import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedLead {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  campaign?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  data: Partial<ParsedLead>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fieldMapping = JSON.parse(formData.get('fieldMapping') as string || '{}');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fileName = file.name;
    const fileType = fileName.endsWith('.xml') ? 'xml' : 'csv';

    console.log(`Processing ${fileType} file: ${fileName} for supplier: ${user.id}`);

    // Create import record
    const { data: importRecord, error: importError } = await supabaseClient
      .from('lead_imports')
      .insert({
        supplier_id: user.id,
        file_name: fileName,
        file_type: fileType,
        status: 'processing',
      })
      .select()
      .single();

    if (importError) {
      console.error('Failed to create import record:', importError);
      return new Response(JSON.stringify({ error: 'Failed to create import record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const fileContent = await file.text();
      let parsedLeads: ParsedLead[] = [];

      // Parse file based on type
      if (fileType === 'csv') {
        parsedLeads = parseCSV(fileContent, fieldMapping);
      } else {
        parsedLeads = parseXML(fileContent, fieldMapping);
      }

      console.log(`Parsed ${parsedLeads.length} leads from file`);

      // Validate and categorize leads
      const validLeads: ParsedLead[] = [];
      const errors: ValidationError[] = [];

      for (let i = 0; i < parsedLeads.length; i++) {
        const lead = parsedLeads[i];
        const validation = validateLead(lead, i + 1);

        if (validation.valid) {
          validLeads.push(lead);
        } else {
          errors.push(...validation.errors);
        }
      }

      console.log(`Valid leads: ${validLeads.length}, Errors: ${errors.length}`);

      // Check for duplicates
      const duplicates: string[] = [];
      const leadsToInsert: ParsedLead[] = [];

      for (const lead of validLeads) {
        const { data: existing } = await supabaseClient
          .from('leads')
          .select('id')
          .eq('supplier_id', user.id)
          .or(`contact_phone.eq.${lead.phone}${lead.email ? `,contact_email.eq.${lead.email}` : ''}`)
          .limit(1);

        if (existing && existing.length > 0) {
          duplicates.push(lead.phone);
        } else {
          leadsToInsert.push(lead);
        }
      }

      console.log(`Duplicates: ${duplicates.length}, To insert: ${leadsToInsert.length}`);

      // Insert leads
      let insertedCount = 0;
      if (leadsToInsert.length > 0) {
        const leadsData = leadsToInsert.map((lead) => ({
          supplier_id: user.id,
          name: lead.name,
          contact_phone: lead.phone,
          contact_email: lead.email || null,
          source: lead.source || 'import',
          campaign: lead.campaign || null,
          status: 'new',
          created_via: 'import',
        }));

        const { error: insertError, count } = await supabaseClient
          .from('leads')
          .insert(leadsData)
          .select('id', { count: 'exact' });

        if (insertError) {
          throw new Error(`Failed to insert leads: ${insertError.message}`);
        }

        insertedCount = count || leadsToInsert.length;
      }

      // Update import record
      await supabaseClient
        .from('lead_imports')
        .update({
          status: 'completed',
          total_rows: parsedLeads.length,
          imported_rows: insertedCount,
          duplicate_rows: duplicates.length,
          error_rows: errors.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', importRecord.id);

      return new Response(
        JSON.stringify({
          success: true,
          importId: importRecord.id,
          total_rows: parsedLeads.length,
          imported_rows: insertedCount,
          duplicate_rows: duplicates.length,
          error_rows: errors.length,
          errors: errors.slice(0, 20), // Return first 20 errors
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (processingError) {
      console.error('Processing error:', processingError);

      // Update import record with error
      await supabaseClient
        .from('lead_imports')
        .update({
          status: 'failed',
          error_message: processingError.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', importRecord.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: processingError.message,
          importId: importRecord.id,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseCSV(content: string, fieldMapping: Record<string, string>): ParsedLead[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  // Detect separator
  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  // Parse headers
  const headers = firstLine.split(separator).map((h) => h.trim().replace(/^["']|["']$/g, ''));

  // Create mapping
  const mapping = createFieldMapping(headers, fieldMapping);

  const leads: ParsedLead[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line, separator);
    const lead: Partial<ParsedLead> = {};

    for (const [headerIndex, systemField] of Object.entries(mapping)) {
      const value = values[parseInt(headerIndex)]?.trim();
      if (value) {
        lead[systemField as keyof ParsedLead] = value;
      }
    }

    if (lead.name && lead.phone) {
      leads.push(lead as ParsedLead);
    }
  }

  return leads;
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

function parseXML(content: string, fieldMapping: Record<string, string>): ParsedLead[] {
  const leads: ParsedLead[] = [];
  
  // Simple XML parsing for <lead> tags
  const leadMatches = content.matchAll(/<lead[^>]*>([\s\S]*?)<\/lead>/gi);

  for (const match of leadMatches) {
    const leadXml = match[1];
    const lead: Partial<ParsedLead> = {};

    // Extract values
    const extractValue = (tag: string): string | undefined => {
      const regex = new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i');
      const match = leadXml.match(regex);
      return match ? match[1].trim() : undefined;
    };

    lead.name = extractValue('name') || extractValue('full_name') || extractValue('fullname');
    lead.phone = extractValue('phone') || extractValue('telephone') || extractValue('mobile');
    lead.email = extractValue('email') || extractValue('mail');
    lead.source = extractValue('source');
    lead.campaign = extractValue('campaign');

    if (lead.name && lead.phone) {
      leads.push(lead as ParsedLead);
    }
  }

  return leads;
}

function createFieldMapping(headers: string[], userMapping: Record<string, string>): Record<number, string> {
  const mapping: Record<number, string> = {};

  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().trim();

    // Check user mapping first
    if (userMapping[header]) {
      mapping[index] = userMapping[header];
      return;
    }

    // Auto-detect common variations
    if (
      normalizedHeader.includes('name') ||
      normalizedHeader.includes('שם') ||
      normalizedHeader === 'full_name' ||
      normalizedHeader === 'שם מלא'
    ) {
      mapping[index] = 'name';
    } else if (
      normalizedHeader.includes('phone') ||
      normalizedHeader.includes('tel') ||
      normalizedHeader.includes('טלפון') ||
      normalizedHeader.includes('נייד')
    ) {
      mapping[index] = 'phone';
    } else if (
      normalizedHeader.includes('email') ||
      normalizedHeader.includes('mail') ||
      normalizedHeader.includes('מייל')
    ) {
      mapping[index] = 'email';
    } else if (normalizedHeader.includes('source') || normalizedHeader.includes('מקור')) {
      mapping[index] = 'source';
    } else if (normalizedHeader.includes('campaign') || normalizedHeader.includes('קמפיין')) {
      mapping[index] = 'campaign';
    }
  });

  return mapping;
}

function validateLead(
  lead: ParsedLead,
  rowNumber: number
): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Required: name
  if (!lead.name || lead.name.trim().length === 0) {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'שם חובה',
      data: lead,
    });
  }

  // Required: phone
  if (!lead.phone || lead.phone.trim().length === 0) {
    errors.push({
      row: rowNumber,
      field: 'phone',
      message: 'טלפון חובה',
      data: lead,
    });
  } else {
    // Clean and validate phone
    const cleanPhone = lead.phone.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 15) {
      errors.push({
        row: rowNumber,
        field: 'phone',
        message: 'מספר טלפון לא תקין',
        data: lead,
      });
    } else {
      lead.phone = cleanPhone;
    }
  }

  // Optional: email validation
  if (lead.email && lead.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lead.email)) {
      errors.push({
        row: rowNumber,
        field: 'email',
        message: 'כתובת מייל לא תקינה',
        data: lead,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
