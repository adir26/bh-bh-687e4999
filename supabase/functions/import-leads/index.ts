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
    
    console.log('Field mapping received from frontend:', JSON.stringify(fieldMapping));

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
      console.log(`File content length: ${fileContent.length} characters`);
      
      let parsedLeads: ParsedLead[] = [];

      // Parse file based on type
      if (fileType === 'csv') {
        parsedLeads = parseCSV(fileContent, fieldMapping);
      } else {
        parsedLeads = parseXML(fileContent, fieldMapping);
      }

      console.log(`Parsed ${parsedLeads.length} leads from file`);
      if (parsedLeads.length > 0) {
        console.log('First parsed lead (sample):', JSON.stringify(parsedLeads[0]));
      }

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
        // Check for duplicates using normalized phone
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
        console.log('Generating lead numbers...');
        
        // Generate lead numbers for all leads
        const leadNumbers: string[] = [];
        for (let i = 0; i < leadsToInsert.length; i++) {
          const { data: leadNumber, error: leadNumError } = await supabaseClient.rpc('generate_lead_number');
          if (leadNumError) {
            console.warn('Failed to generate lead number, using fallback:', leadNumError);
            leadNumbers.push(`IMP-${Date.now()}-${i}`);
          } else {
            leadNumbers.push(leadNumber);
          }
        }
        console.log(`Generated ${leadNumbers.length} lead numbers`);
        
        const leadsData = leadsToInsert.map((lead, index) => ({
          supplier_id: user.id,
          lead_number: leadNumbers[index],
          name: lead.name,
          contact_phone: lead.phone,
          contact_email: lead.email || null,
          source: lead.source || 'facebook',
          campaign: lead.form_name || lead.campaign || null,
          secondary_phone: lead.secondary_phone || null,
          whatsapp_phone: lead.whatsapp_phone || null,
          channel: lead.channel || null,
          stage: lead.stage || 'new',
          form_name: lead.form_name || null,
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
        console.log(`Successfully inserted ${insertedCount} leads`);
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
  // Remove BOM if exists
  let cleanContent = content.replace(/^\uFEFF/, '');
  const lines = cleanContent.trim().split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length < 2) {
    console.log('CSV file has less than 2 lines');
    return [];
  }

  // Detect separator
  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const separator = semicolonCount > commaCount ? ';' : ',';
  
  console.log(`CSV separator detected: "${separator}"`);

  // Parse headers
  const headers = parseCSVLine(firstLine, separator);
  console.log('CSV headers detected:', headers);

  // Create mapping
  const mapping = createFieldMapping(headers, fieldMapping);
  console.log('Field mapping created:', JSON.stringify(mapping));

  const leads: ParsedLead[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line, separator);
    const lead: Partial<ParsedLead> = {};

    for (const [headerIndex, systemField] of Object.entries(mapping)) {
      const value = values[parseInt(headerIndex)]?.trim();
      if (value && systemField !== 'ignore') {
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

    lead.name = extractValue('name') || extractValue('full_name') || extractValue('fullname') || extractValue('שם');
    lead.phone = extractValue('phone') || extractValue('telephone') || extractValue('mobile') || extractValue('טלפון');
    lead.email = extractValue('email') || extractValue('mail') || extractValue('דוא"ל');
    lead.source = extractValue('source') || extractValue('מקור');
    lead.form_name = extractValue('form_name') || extractValue('campaign') || extractValue('טופס');
    lead.secondary_phone = extractValue('secondary_phone') || extractValue('מספר הטלפון המשני');
    lead.whatsapp_phone = extractValue('whatsapp_phone') || extractValue('מספר הטלפון ב-whatsapp');
    lead.channel = extractValue('channel') || extractValue('ערוץ');
    lead.stage = extractValue('stage') || extractValue('שלב');

    if (lead.name && lead.phone) {
      leads.push(lead as ParsedLead);
    }
  }

  return leads;
}

function normalizeIsraeliPhone(phone: string): string | null {
  // Clean phone: remove spaces, hyphens, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove leading + or 00
  cleaned = cleaned.replace(/^(\+|00)/, '');
  
  // Ensure it starts with 972
  if (cleaned.startsWith('05')) {
    // Convert 05X to 9725X
    cleaned = '972' + cleaned.substring(1);
  } else if (!cleaned.startsWith('972')) {
    // Try to add 972 prefix if it looks like Israeli number
    if (cleaned.length === 9 || cleaned.length === 10) {
      cleaned = '972' + cleaned;
    }
  }
  
  // Validate length (should be 12 digits: 972 + 9 digits)
  if (cleaned.length < 11 || cleaned.length > 13) {
    return null;
  }
  
  // Validate it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return null;
  }
  
  return cleaned;
}

function createFieldMapping(headers: string[], userMapping: Record<string, string>): Record<number, string> {
  const mapping: Record<number, string> = {};

  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().trim();

    // Check user mapping first (index-based from frontend)
    if (userMapping[index.toString()]) {
      mapping[index] = userMapping[index.toString()];
      console.log(`User mapping applied for index ${index}: ${mapping[index]}`);
      return;
    }

    // Facebook Hebrew field mapping (exact matches first)
    // שם - Name
    if (
      normalizedHeader === 'שם' ||
      normalizedHeader === 'שם מלא' ||
      normalizedHeader.includes('name') ||
      normalizedHeader === 'full_name'
    ) {
      mapping[index] = 'name';
    }
    // טלפון - Primary phone
    else if (
      normalizedHeader === 'טלפון' ||
      normalizedHeader === 'מספר הטלפון' ||
      normalizedHeader === 'phone' ||
      normalizedHeader === 'telephone' ||
      normalizedHeader.includes('נייד')
    ) {
      mapping[index] = 'phone';
    }
    // מספר הטלפון המשני - Secondary phone
    else if (
      normalizedHeader === 'מספר הטלפון המשני' ||
      normalizedHeader === 'טלפון משני' ||
      normalizedHeader === 'secondary phone' ||
      normalizedHeader === 'secondary_phone'
    ) {
      mapping[index] = 'secondary_phone';
    }
    // מספר הטלפון ב-WhatsApp - WhatsApp phone
    else if (
      normalizedHeader === 'מספר הטלפון ב-whatsapp' ||
      normalizedHeader === 'whatsapp' ||
      normalizedHeader === 'whatsapp phone' ||
      normalizedHeader === 'whatsapp_phone'
    ) {
      mapping[index] = 'whatsapp_phone';
    }
    // דוא"ל - Email
    else if (
      normalizedHeader === 'דוא"ל' ||
      normalizedHeader === 'אימייל' ||
      normalizedHeader.includes('email') ||
      normalizedHeader.includes('mail') ||
      normalizedHeader.includes('מייל')
    ) {
      mapping[index] = 'email';
    }
    // מקור - Source
    else if (
      normalizedHeader === 'מקור' ||
      normalizedHeader === 'source'
    ) {
      mapping[index] = 'source';
    }
    // טופס - Form name (use as campaign)
    else if (
      normalizedHeader === 'טופס' ||
      normalizedHeader === 'form' ||
      normalizedHeader === 'form_name' ||
      normalizedHeader === 'campaign' ||
      normalizedHeader === 'קמפיין'
    ) {
      mapping[index] = 'form_name';
    }
    // ערוץ - Channel
    else if (
      normalizedHeader === 'ערוץ' ||
      normalizedHeader === 'channel'
    ) {
      mapping[index] = 'channel';
    }
    // שלב - Stage
    else if (
      normalizedHeader === 'שלב' ||
      normalizedHeader === 'stage'
    ) {
      mapping[index] = 'stage';
    }
    // Ignore Facebook internal fields
    else if (
      normalizedHeader === 'נוצר' ||
      normalizedHeader === 'בעלים' ||
      normalizedHeader === 'תוויות' ||
      normalizedHeader === 'created' ||
      normalizedHeader === 'owner' ||
      normalizedHeader === 'tags'
    ) {
      mapping[index] = 'ignore';
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

  // Required: phone with Israeli normalization
  if (!lead.phone || lead.phone.trim().length === 0) {
    errors.push({
      row: rowNumber,
      field: 'phone',
      message: 'טלפון חובה',
      data: lead,
    });
  } else {
    // Normalize Israeli phone
    const normalized = normalizeIsraeliPhone(lead.phone);
    if (!normalized) {
      errors.push({
        row: rowNumber,
        field: 'phone',
        message: 'מספר טלפון לא תקין (נדרש פורמט ישראלי)',
        data: lead,
      });
    } else {
      lead.phone = normalized;
    }
  }
  
  // Optional: normalize secondary phone
  if (lead.secondary_phone) {
    const normalized = normalizeIsraeliPhone(lead.secondary_phone);
    if (normalized) {
      lead.secondary_phone = normalized;
    } else {
      // Invalid secondary phone - clear it
      lead.secondary_phone = undefined;
    }
  }
  
  // Optional: normalize WhatsApp phone
  if (lead.whatsapp_phone) {
    const normalized = normalizeIsraeliPhone(lead.whatsapp_phone);
    if (normalized) {
      lead.whatsapp_phone = normalized;
    } else {
      // Invalid WhatsApp phone - clear it
      lead.whatsapp_phone = undefined;
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
