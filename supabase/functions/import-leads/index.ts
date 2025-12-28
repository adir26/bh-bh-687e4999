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
    // Use service role for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    console.log('Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('Service Role Key:', supabaseServiceKey ? 'SET' : 'NOT SET');
    
    // Create client with user auth for getting the user
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    // Use service role client for DB operations (bypasses RLS)
    const supabaseClient = supabaseServiceKey 
      ? createClient(supabaseUrl, supabaseServiceKey)
      : authClient;

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fieldMappingRaw = formData.get('fieldMapping') as string || '{}';
    
    console.log('=== FORM DATA RECEIVED ===');
    console.log('File exists:', file != null);
    console.log('File name:', file?.name);
    console.log('File size:', file?.size);
    console.log('Field mapping raw:', fieldMappingRaw);
    
    let fieldMapping: Record<string, string> = {};
    try {
      fieldMapping = JSON.parse(fieldMappingRaw);
      console.log('Field mapping parsed:', JSON.stringify(fieldMapping));
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
      console.log('=== FILE CONTENT ===');
      console.log('File content length:', fileContent.length, 'characters');
      console.log('First 500 characters:', fileContent.slice(0, 500));
      
      let parsedLeads: ParsedLead[] = [];
      let totalDataRows = 0;

      // Parse file based on type
      if (fileType === 'csv') {
        const result = parseCSV(fileContent, fieldMapping);
        parsedLeads = result.leads;
        totalDataRows = result.totalDataRows;
      } else {
        const result = parseXML(fileContent, fieldMapping);
        parsedLeads = result.leads;
        totalDataRows = result.totalDataRows;
      }

      console.log('=== PARSING RESULTS ===');
      console.log('Total data rows in file:', totalDataRows);
      console.log('Parsed leads (passed filter):', parsedLeads.length);
      
      if (parsedLeads.length > 0) {
        console.log('First parsed lead (sample):', JSON.stringify(parsedLeads[0]));
      } else {
        console.log('WARNING: No leads passed the minimal filter!');
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

      console.log('=== VALIDATION RESULTS ===');
      console.log('Valid leads:', validLeads.length);
      console.log('Validation errors:', errors.length);
      if (errors.length > 0) {
        console.log('Sample errors:', JSON.stringify(errors.slice(0, 3)));
      }

      // Check for duplicates
      const duplicates: string[] = [];
      const leadsToInsert: ParsedLead[] = [];

      for (const lead of validLeads) {
        const phoneToCheck = lead.phone || lead.contact_phone;
        const emailToCheck = lead.email || lead.contact_email;
        
        // Build OR condition for duplicates
        const conditions: string[] = [];
        if (phoneToCheck) {
          conditions.push(`contact_phone.eq.${phoneToCheck}`);
        }
        if (emailToCheck) {
          conditions.push(`contact_email.eq.${emailToCheck}`);
        }
        
        if (conditions.length === 0) {
          // No phone or email to check for duplicates, just add it
          leadsToInsert.push(lead);
          continue;
        }

        // Check for duplicates using normalized phone or email
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

      console.log('=== DUPLICATE CHECK ===');
      console.log('Duplicates found:', duplicates.length);
      console.log('Leads to insert:', leadsToInsert.length);

      // Insert leads
      let insertedCount = 0;
      // Insert leads one by one with unique lead numbers
      let insertedCount = 0;
      const insertErrors: string[] = [];
      
      for (let i = 0; i < leadsToInsert.length; i++) {
        const lead = leadsToInsert[i];
        
        // Generate unique lead number using RPC or fallback
        let leadNumber: string;
        const { data: generatedNumber, error: leadNumError } = await supabaseClient.rpc('generate_lead_number');
        
        if (leadNumError || !generatedNumber) {
          // Fallback: use timestamp + random + index to ensure uniqueness
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
          console.error(`Failed to insert lead ${i}:`, insertError.message);
          insertErrors.push(`Row ${i + 1}: ${insertError.message}`);
        } else {
          insertedCount++;
        }
      }
      
      console.log('Successfully inserted', insertedCount, 'leads');
      if (insertErrors.length > 0) {
        console.log('Insert errors:', insertErrors.length);
      }

      // Calculate error rows (rows that didn't pass parsing + validation errors)
      const skippedInParsing = totalDataRows - parsedLeads.length;
      const totalErrorRows = skippedInParsing + errors.length + insertErrors.length;

      console.log('=== FINAL COUNTS ===');
      console.log('Total data rows:', totalDataRows);
      console.log('Skipped in parsing:', skippedInParsing);
      console.log('Validation errors:', errors.length);
      console.log('Total error rows:', totalErrorRows);
      console.log('Duplicates:', duplicates.length);
      console.log('Inserted:', insertedCount);

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

      console.log('Import record updated successfully');

      return new Response(
        JSON.stringify({
          success: true,
          importId: importRecord.id,
          total_rows: totalDataRows,
          imported_rows: insertedCount,
          duplicate_rows: duplicates.length,
          error_rows: totalErrorRows,
          errors: errors.slice(0, 20), // Return first 20 errors
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (processingError) {
      console.error('=== PROCESSING ERROR ===');
      console.error('Error:', processingError);

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
    console.error('=== IMPORT ERROR ===');
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseCSV(content: string, userMapping: Record<string, string>): { leads: ParsedLead[], totalDataRows: number } {
  console.log('=== PARSING CSV ===');
  
  // Remove BOM if exists
  let cleanContent = content.replace(/^\uFEFF/, '');
  const lines = cleanContent.trim().split(/\r?\n/).filter(line => line.trim());
  
  console.log('Total lines in file:', lines.length);
  
  if (lines.length < 2) {
    console.log('CSV file has less than 2 lines (no data rows)');
    return { leads: [], totalDataRows: 0 };
  }

  // Detect separator
  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const separator = semicolonCount > commaCount ? ';' : ',';
  
  console.log('Separator detected:', separator);
  console.log('Comma count:', commaCount, 'Semicolon count:', semicolonCount);

  // Parse headers
  const headers = parseCSVLine(firstLine, separator);
  console.log('Headers detected:', headers);
  console.log('Number of headers:', headers.length);

  // Create mapping - user mapping takes priority
  const mapping = createFieldMapping(headers, userMapping);
  console.log('Final field mapping:', JSON.stringify(mapping));

  const leads: ParsedLead[] = [];
  const totalDataRows = lines.length - 1; // Exclude header row
  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      skippedRows++;
      continue;
    }

    const values = parseCSVLine(line, separator);
    const lead: Partial<ParsedLead> = {};

    for (const [headerIndex, systemField] of Object.entries(mapping)) {
      const idx = parseInt(headerIndex);
      const value = values[idx]?.trim();
      if (value && systemField !== 'ignore') {
        // Map to the correct field names
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

    // RELAXED FILTER: Accept if has at least one of: name, phone, or email
    const hasName = !!(lead.name && lead.name.trim().length > 0);
    const hasPhone = !!(lead.phone || lead.contact_phone);
    const hasEmail = !!(lead.email || lead.contact_email);

    if (hasName || hasPhone || hasEmail) {
      leads.push(lead as ParsedLead);
    } else {
      skippedRows++;
      if (i <= 5) {
        console.log(`Row ${i} skipped - no name/phone/email. Values:`, values);
      }
    }
  }

  console.log('Leads parsed:', leads.length);
  console.log('Rows skipped (missing data):', skippedRows);

  return { leads, totalDataRows };
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
  
  // Simple XML parsing for <lead> tags
  const leadMatches = [...content.matchAll(/<lead[^>]*>([\s\S]*?)<\/lead>/gi)];
  const totalDataRows = leadMatches.length;
  
  console.log('Total <lead> tags found:', totalDataRows);

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
    lead.contact_phone = lead.phone;
    lead.email = extractValue('email') || extractValue('mail') || extractValue('דוא"ל');
    lead.contact_email = lead.email;
    lead.source = extractValue('source') || extractValue('מקור');
    lead.form_name = extractValue('form_name') || extractValue('campaign') || extractValue('טופס');
    lead.secondary_phone = extractValue('secondary_phone') || extractValue('מספר הטלפון המשני');
    lead.whatsapp_phone = extractValue('whatsapp_phone') || extractValue('מספר הטלפון ב-whatsapp');
    lead.channel = extractValue('channel') || extractValue('ערוץ');
    lead.stage = extractValue('stage') || extractValue('שלב');

    // RELAXED FILTER: Accept if has at least one of: name, phone, or email
    const hasName = !!(lead.name && lead.name.trim().length > 0);
    const hasPhone = !!(lead.phone || lead.contact_phone);
    const hasEmail = !!(lead.email || lead.contact_email);

    if (hasName || hasPhone || hasEmail) {
      leads.push(lead as ParsedLead);
    }
  }

  console.log('Leads parsed from XML:', leads.length);

  return { leads, totalDataRows };
}

function normalizeIsraeliPhone(phone: string): string | null {
  if (!phone) return null;
  
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
  console.log('=== CREATING FIELD MAPPING ===');
  console.log('Headers:', headers);
  console.log('User mapping from frontend:', JSON.stringify(userMapping));
  
  const mapping: Record<number, string> = {};

  // STEP 1: Apply user mapping FIRST (takes absolute priority)
  for (const [indexStr, systemField] of Object.entries(userMapping)) {
    const index = parseInt(indexStr);
    if (!isNaN(index) && index >= 0 && index < headers.length && systemField) {
      mapping[index] = systemField;
      console.log(`User mapping applied: index ${index} (${headers[index]}) -> ${systemField}`);
    }
  }

  // STEP 2: Auto-detect for columns NOT already mapped by user
  headers.forEach((header, index) => {
    // Skip if user already mapped this column
    if (mapping[index] !== undefined) {
      return;
    }
    
    const normalizedHeader = header.toLowerCase().trim();

    // Facebook Hebrew field mapping (exact matches first)
    // שם - Name
    if (
      normalizedHeader === 'שם' ||
      normalizedHeader === 'שם מלא' ||
      normalizedHeader.includes('name') ||
      normalizedHeader === 'full_name' ||
      normalizedHeader === 'fullname'
    ) {
      mapping[index] = 'name';
    }
    // טלפון - Primary phone
    else if (
      normalizedHeader === 'טלפון' ||
      normalizedHeader === 'מספר הטלפון' ||
      normalizedHeader === 'phone' ||
      normalizedHeader === 'telephone' ||
      normalizedHeader === 'mobile' ||
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
      normalizedHeader === 'tags' ||
      normalizedHeader === 'id'
    ) {
      mapping[index] = 'ignore';
    }
    // Default: ignore unmapped columns
    else {
      mapping[index] = 'ignore';
      console.log(`Column ${index} (${header}) not recognized, set to ignore`);
    }
  });

  console.log('Final mapping:', JSON.stringify(mapping));
  return mapping;
}

function validateLead(
  lead: ParsedLead,
  rowNumber: number
): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  const hasName = !!(lead.name && lead.name.trim().length > 0);
  const hasPhone = !!(lead.phone || lead.contact_phone);
  const hasEmail = !!(lead.email || lead.contact_email);

  // Must have at least one contact method (relaxed validation)
  if (!hasName && !hasPhone && !hasEmail) {
    errors.push({
      row: rowNumber,
      field: 'contact',
      message: 'חסר מידע מזהה (שם, טלפון או מייל)',
      data: lead,
    });
    return { valid: false, errors };
  }

  // Normalize phone if present
  if (hasPhone) {
    const phoneToNormalize = lead.phone || lead.contact_phone || '';
    const normalized = normalizeIsraeliPhone(phoneToNormalize);
    if (normalized) {
      lead.phone = normalized;
      lead.contact_phone = normalized;
    } else if (phoneToNormalize.length > 0) {
      // Phone exists but invalid - log warning but don't reject
      console.warn(`Row ${rowNumber}: Phone ${phoneToNormalize} could not be normalized, keeping as-is`);
    }
  }
  
  // Optional: normalize secondary phone
  if (lead.secondary_phone) {
    const normalized = normalizeIsraeliPhone(lead.secondary_phone);
    if (normalized) {
      lead.secondary_phone = normalized;
    }
  }
  
  // Optional: normalize WhatsApp phone
  if (lead.whatsapp_phone) {
    const normalized = normalizeIsraeliPhone(lead.whatsapp_phone);
    if (normalized) {
      lead.whatsapp_phone = normalized;
    }
  }

  // Optional: email validation (warn but don't reject)
  if (hasEmail) {
    const emailToCheck = lead.email || lead.contact_email || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToCheck)) {
      console.warn(`Row ${rowNumber}: Email ${emailToCheck} is not valid format`);
      // Don't reject, just warn
    }
  }

  return {
    valid: true,
    errors,
  };
}
