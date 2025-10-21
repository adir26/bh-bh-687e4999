import { supabase } from '@/integrations/supabase/client';

export interface CreateClientData {
  full_name: string;
  email: string;
  phone?: string;
}

export async function createClient(data: CreateClientData): Promise<string> {
  // Normalize inputs
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedPhone = data.phone?.trim();

  // Check for duplicate - email
  const { data: existingByEmail } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (existingByEmail) {
    throw new Error(`כבר קיים לקוח עם מייל זה: ${existingByEmail.full_name}`);
  }

  // Check for duplicate - phone (only if provided)
  if (normalizedPhone) {
    const { data: existingByPhone } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (existingByPhone) {
      throw new Error(`כבר קיים לקוח עם טלפון זה: ${existingByPhone.full_name}`);
    }
  }

  // Create new client profile (using service role to allow creation without auth)
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      email: normalizedEmail,
      full_name: data.full_name.trim(),
      phone: normalizedPhone || null,
      role: 'client' as const,
    } as any)
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('לקוח עם פרטים אלו כבר קיים במערכת');
    }
    throw error;
  }

  return newProfile.id;
}

export async function createClientWithLead(
  data: CreateClientData,
  supplierId: string,
  leadStatus: 'new' | 'project_in_progress' = 'new'
): Promise<string> {
  // 1. Create the client
  const clientId = await createClient(data);

  // 2. Create lead automatically with the specified status
  try {
    const { error: leadError } = await supabase.from('leads').insert({
      client_id: clientId,
      supplier_id: supplierId,
      status: leadStatus,
      source_key: leadStatus === 'project_in_progress' ? 'orders' : 'website',
      contact_phone: data.phone || null,
      contact_email: data.email,
      name: data.full_name,
      priority_key: 'medium',
      notes: leadStatus === 'project_in_progress' 
        ? 'נוצר אוטומטית ממודול ההזמנות' 
        : 'נוצר אוטומטית מיצירת הזמנה',
    } as any);

    if (leadError) {
      console.error('Failed to create lead:', leadError);
      // Don't throw - client was already created
    }
  } catch (err) {
    console.error('Lead creation error:', err);
  }

  return clientId;
}
