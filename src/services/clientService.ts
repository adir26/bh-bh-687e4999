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
