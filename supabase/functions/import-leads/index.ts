import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedLead {
  name?: string;
  phone?: string;
  contact_phone?: string;
  contact_email?: string;
  email?: string;
  source?: string;
  campaign?: string;
  secondary_phone?: string;
  whatsapp_phone?: string;
  channel?: string;
  stage?: string;
  form_name?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  data: Partial<ParsedLead>;
}

Deno.serve(async (req) => {
  console.log('=== IMPORT-LEADS FUNCTION STARTED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    console.log('Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('Service Role Key:', supabaseServiceKey ? 'SET' : 'NOT SET');
    
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    const supabaseClient = supabaseServiceKey 
      ? createClient(supabaseUrl, supabaseServiceKey)
      : authClient;

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fieldMappingRaw = formData.get('fieldMapping') as string || '{}';
    
    console.log('=== FILE RECEIVED ===');
    console.log('File received, size:', file?.size, 'bytes');
    console.log('File name:', file?.name);
    console.log('Field mapping raw:', fieldMappingRaw);
    
    let fieldMapping: Record<string, string> = {};
    try {
      fieldMapping = JSON.parse(fieldMappingRaw);
      console.log('Mapping:', JSON.stringify(fieldMapping));
    } catch (e) {
      console.error('Failed to parse fieldMapping:', e);
    }

    if (!file) {
      console.error('No file provided');
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
      return new Response(JSON.stringify({ error: 'Failed to create import record: ' + importError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Import record created:', importRecord.id);

    try {
      const fileContent = await file.text();
      console.log('File content length:', fileContent.length, 'characters');
      console.log('First 300 chars:', fileContent.slice(0, 300));
      
      let parsedLeads: ParsedLead[] = [];
      let totalDataRows = 0;
      let headers: string[] = [];

      if (fileType === 'csv') {
        const result = parseCSV(fileContent, fieldMapping);
        parsedLeads = result.leads;
        totalDataRows = result.totalDataRows;
        headers = result.headers;
      } else {
        const result = parseXML(fileContent, fieldMapping);
        parsedLeads = result.leads;
        totalDataRows = result.totalDataRows;
      }

      console.log('=== PARSING RESULTS ===');
      console.log('Parsed', parsedLeads.length, 'rows, headers:', JSON.stringify(headers));
      
      if (parsedLeads.length > 0) {
        console.log('First parsed lead:', JSON.stringify(parsedLeads[0]));
      }

      // Validate leads
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

      console.log('Valid leads found:', validLeads.length, 'out of', parsedLeads.length);

      // Check for duplicates
      const duplicates: string[] = [];
      const leadsToInsert: ParsedLead[] = [];

      for (const lead of validLeads) {
        const phoneToCheck = lead.phone || lead.contact_phone;
        const emailToCheck = lead.email || lead.contact_email;
        
        const conditions: string[] = [];
        if (phoneToCheck) {
          conditions.push(`contact_phone.eq.${phoneToCheck}`);
        }
        if (emailToCheck) {
          conditions.push(`contact_email.eq.${emailToCheck}`);
        }
        
        if (conditions.length === 0) {
          leadsToInsert.push(lead);
          continue;
        }

        const { data: existing } = await supabaseClient
          .from('leads')
          .select('id')
          .eq('supplier_id', user.id)
          .or(conditions.join(','))
          .limit(1);

        if (existing && existing.length > 0) {
          duplicates.push(phoneToCheck || emailToCheck || 'unknown');
        } else {
          leadsToInsert.push(lead);
        }
      }

      console.log('Duplicates found:', duplicates.length);
      console.log('Leads to insert:', leadsToInsert.length);

      // Insert leads one by one
      let insertedCount = 0;
      const insertErrors: string[] = [];
      
      for (let i = 0; i < leadsToInsert.length; i++) {
        const lead = leadsToInsert[i];
        console.log('Inserting lead #' + (i + 1));
        
        // Generate unique lead number
        let leadNumber: string;
        const { data: generatedNumber, error: leadNumError } = await supabaseClient.rpc('generate_lead_number');
        
        if (leadNumError || !generatedNumber) {
          leadNumber = `IMP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${i}`;
          console.warn('Using fallback lead number:', leadNumber);
        } else {
          leadNumber = generatedNumber;
        }
        
        const leadData = {
          supplier_id: user.id,
          lead_number: leadNumber,
          name: lead.name || null,
          contact_phone: lead.phone || lead.contact_phone || null,
          contact_email: lead.email || lead.contact_email || null,
          source: lead.source || 'import',
          campaign: lead.form_name || lead.campaign || null,
          secondary_phone: lead.secondary_phone || null,
          whatsapp_phone: lead.whatsapp_phone || null,
          channel: lead.channel || null,
          stage: lead.stage || 'new',
          form_name: lead.form_name || null,
          status: 'new',
          created_via: 'import',
        };

        const { error: insertError } = await supabaseClient
          .from('leads')
          .insert(leadData);

        if (insertError) {
          console.error(`Failed to insert lead ${i + 1}:`, insertError.message);
          insertErrors.push(`Row ${i + 1}: ${insertError.message}`);
        } else {
          insertedCount++;
        }
      }
      
      console.log('Inserted', insertedCount, 'leads successfully');

      const skippedInParsing = totalDataRows - parsedLeads.length;
      const totalErrorRows = skippedInParsing + errors.length + insertErrors.length;

      console.log('=== FINAL SUMMARY ===');
      console.log('Total rows:', totalDataRows);
      console.log('Inserted:', insertedCount);
      console.log('Duplicates:', duplicates.length);
      console.log('Errors:', totalErrorRows);

      // Update import record
      await supabaseClient
        .from('lead_imports')
        .update({
          status: 'completed',
          total_rows: totalDataRows,
          imported_rows: insertedCount,
          duplicate_rows: duplicates.length,
          error_rows: totalErrorRows,
          completed_at: new Date().toISOString(),
        })
        .eq('id', importRecord.id);

      return new Response(
        JSON.stringify({
          success: true,
          importId: importRecord.id,
          total_rows: totalDataRows,
          imported_rows: insertedCount,
          duplicate_rows: duplicates.length,
          error_rows: totalErrorRows,
          errors: errors.slice(0, 20),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (processingError) {
      console.error('=== PROCESSING ERROR ===', processingError);

      await supabaseClient
        .from('lead_imports')
        .update({
          status: 'failed',
          error_message: processingError.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', importRecord.id);

      return new Response(
        JSON.stringify({ success: false, error: processingError.message, importId: importRecord.id }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('=== IMPORT ERROR ===', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseCSV(content: string, userMapping: Record<string, string>): { leads: ParsedLead[], totalDataRows: number, headers: string[] } {
  console.log('=== PARSING CSV ===');
  
  const cleanContent = content.replace(/^\uFEFF/, '');
  const lines = cleanContent.trim().split(/\r?\n/).filter(line => line.trim());
  
  console.log('Total lines:', lines.length);
  
  if (lines.length < 2) {
    return { leads: [], totalDataRows: 0, headers: [] };
  }

  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const separator = semicolonCount > commaCount ? ';' : ',';
  
  console.log('Separator:', separator);

  const headers = parseCSVLine(firstLine, separator);
  console.log('Headers:', JSON.stringify(headers));

  const mapping = createFieldMapping(headers, userMapping);
  console.log('Field mapping:', JSON.stringify(mapping));

  const leads: ParsedLead[] = [];
  const totalDataRows = lines.length - 1;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line, separator);
    const lead: Partial<ParsedLead> = {};

    for (const [headerIndex, systemField] of Object.entries(mapping)) {
      const idx = parseInt(headerIndex);
      const value = values[idx]?.trim();
      if (value && systemField !== 'ignore') {
        if (systemField === 'phone') {
          lead.phone = value;
          lead.contact_phone = value;
        } else if (systemField === 'email') {
          lead.email = value;
          lead.contact_email = value;
        } else {
          lead[systemField as keyof ParsedLead] = value;
        }
      }
    }

    const hasName = !!(lead.name && lead.name.trim().length > 0);
    const hasPhone = !!(lead.phone || lead.contact_phone);
    const hasEmail = !!(lead.email || lead.contact_email);

    if (hasName || hasPhone || hasEmail) {
      leads.push(lead as ParsedLead);
    }
  }

  console.log('Parsed leads:', leads.length);
  return { leads, totalDataRows, headers };
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

function parseXML(content: string, userMapping: Record<string, string>): { leads: ParsedLead[], totalDataRows: number } {
  console.log('=== PARSING XML ===');
  
  const leads: ParsedLead[] = [];
  const leadMatches = [...content.matchAll(/<lead[^>]*>([\s\S]*?)<\/lead>/gi)];
  const totalDataRows = leadMatches.length;
  
  console.log('Total <lead> tags:', totalDataRows);

  for (const match of leadMatches) {
    const leadXml = match[1];
    const lead: Partial<ParsedLead> = {};

    const extractValue = (tag: string): string | undefined => {
      const regex = new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i');
      const m = leadXml.match(regex);
      return m ? m[1].trim() : undefined;
    };

    lead.name = extractValue('name') || extractValue('full_name') || extractValue('שם');
    lead.phone = extractValue('phone') || extractValue('telephone') || extractValue('טלפון');
    lead.contact_phone = lead.phone;
    lead.email = extractValue('email') || extractValue('mail') || extractValue('דוא"ל');
    lead.contact_email = lead.email;
    lead.source = extractValue('source') || extractValue('מקור');
    lead.form_name = extractValue('form_name') || extractValue('campaign') || extractValue('טופס');
    lead.secondary_phone = extractValue('secondary_phone');
    lead.whatsapp_phone = extractValue('whatsapp_phone');
    lead.channel = extractValue('channel');
    lead.stage = extractValue('stage');

    const hasName = !!(lead.name && lead.name.trim().length > 0);
    const hasPhone = !!(lead.phone || lead.contact_phone);
    const hasEmail = !!(lead.email || lead.contact_email);

    if (hasName || hasPhone || hasEmail) {
      leads.push(lead as ParsedLead);
    }
  }

  console.log('Parsed XML leads:', leads.length);
  return { leads, totalDataRows };
}

function normalizeIsraeliPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  if (cleaned.startsWith('+972')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('972')) {
    cleaned = '0' + cleaned.substring(3);
  }
  
  if (/^0[0-9]{8,9}$/.test(cleaned)) {
    return cleaned;
  }
  
  return phone;
}

function createFieldMapping(headers: string[], userMapping: Record<string, string>): Record<number, string> {
  const mapping: Record<number, string> = {};
  
  const autoDetect: Record<string, string[]> = {
    name: ['name', 'full_name', 'fullname', 'שם', 'שם מלא', 'שם הלקוח', 'שם לקוח'],
    phone: ['phone', 'telephone', 'mobile', 'tel', 'טלפון', 'מספר טלפון', 'נייד', 'פלאפון'],
    email: ['email', 'mail', 'e-mail', 'דואל', 'דוא"ל', 'אימייל', 'מייל'],
    source: ['source', 'מקור', 'מקור ליד'],
    campaign: ['campaign', 'קמפיין'],
    form_name: ['form_name', 'form', 'טופס', 'שם טופס'],
    secondary_phone: ['secondary_phone', 'phone2', 'מספר משני'],
    whatsapp_phone: ['whatsapp', 'whatsapp_phone', 'וואטסאפ'],
    channel: ['channel', 'ערוץ'],
    stage: ['stage', 'שלב'],
  };

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase().trim();
    
    // Check user mapping first
    if (userMapping[header]) {
      mapping[i] = userMapping[header];
      continue;
    }
    
    // Auto-detect
    for (const [field, patterns] of Object.entries(autoDetect)) {
      if (patterns.some(p => header.includes(p.toLowerCase()))) {
        mapping[i] = field;
        break;
      }
    }
  }

  return mapping;
}

function validateLead(lead: ParsedLead, rowNumber: number): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  const hasName = !!(lead.name && lead.name.trim().length > 0);
  const hasPhone = !!(lead.phone || lead.contact_phone);
  const hasEmail = !!(lead.email || lead.contact_email);

  if (!hasName && !hasPhone && !hasEmail) {
    errors.push({
      row: rowNumber,
      field: 'contact',
      message: 'חייב להיות לפחות שם, טלפון, או אימייל',
      data: lead,
    });
  }

  // Normalize phone if exists
  if (lead.phone) {
    lead.phone = normalizeIsraeliPhone(lead.phone);
    lead.contact_phone = lead.phone;
  }
  if (lead.contact_phone && !lead.phone) {
    lead.contact_phone = normalizeIsraeliPhone(lead.contact_phone);
    lead.phone = lead.contact_phone;
  }

  return { valid: errors.length === 0, errors };
}
