// supabase/functions/delete-account/index.ts
// Purpose: E2E account deletion (DB purge + storage delete + auth delete)
// Auth: requires a valid user JWT in Authorization: Bearer <token>

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type DeletePayload = { confirm: boolean };

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { 
        status: 405,
        headers: corsHeaders 
      });
    }

    // 1) Verify caller's JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response("Unauthorized", { 
        status: 401,
        headers: corsHeaders 
      });
    }
    const jwt = authHeader.split(" ")[1];

    // Create client with user JWT to verify access
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // Identify the user from the JWT
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      console.error("Failed to get user from JWT:", userErr);
      return new Response("Unauthorized", { 
        status: 401,
        headers: corsHeaders 
      });
    }
    const user = userData.user;
    const userId = user.id;

    console.log(`Delete account request for user: ${userId}`);

    // Optional: body confirmation
    const body = (await req.json().catch(() => null)) as DeletePayload | null;
    if (!body?.confirm) {
      console.error("Missing confirmation in request body");
      return new Response("Bad Request: confirm=true required", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Create admin client for privileged operations
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 2) Purge Postgres data using the secure function
    console.log("Starting database purge...");
    const { error: purgeErr } = await adminClient.rpc(
      "delete_user_account_db",
      { p_user_id: userId }
    );
    if (purgeErr) {
      console.error("DB purge error:", purgeErr);
      return new Response("DB purge failed", { 
        status: 500,
        headers: corsHeaders 
      });
    }
    console.log("Database purge completed successfully");

    // 3) Delete Storage files (adjust buckets/prefixes based on your storage structure)
    console.log("Starting storage cleanup...");
    const storage = adminClient.storage;

    // Define buckets and prefixes owned by user
    // Adjust these based on your actual storage bucket structure
    const buckets = [
      { bucket: "user-uploads", prefix: `${userId}/` },
      { bucket: "inspiration", prefix: `${userId}/` },
      { bucket: "attachments", prefix: `${userId}/` },
      { bucket: "photos", prefix: `${userId}/` },
      { bucket: "documents", prefix: `${userId}/` },
    ];

    for (const b of buckets) {
      try {
        // List files in the user's folder
        const { data: list, error: listErr } = await storage
          .from(b.bucket)
          .list(b.prefix, { limit: 1000, offset: 0 });
        
        if (listErr) {
          // Log warning but continue - bucket might not exist
          console.warn(`Storage list warning for bucket ${b.bucket}:`, listErr);
          continue;
        }
        
        if (list && list.length > 0) {
          const paths = list.map((f) => `${b.prefix}${f.name}`);
          const { error: delErr } = await storage.from(b.bucket).remove(paths);
          if (delErr) {
            console.warn(`Storage delete warning for bucket ${b.bucket}:`, delErr);
          } else {
            console.log(`Deleted ${paths.length} files from bucket ${b.bucket}`);
          }
        }
      } catch (error) {
        console.warn(`Storage cleanup error for bucket ${b.bucket}:`, error);
        // Continue with other buckets even if one fails
      }
    }
    console.log("Storage cleanup completed");

    // 4) Delete Auth user
    console.log("Deleting auth user...");
    const { error: delUserErr } = await adminClient.auth.admin.deleteUser(userId);
    if (delUserErr) {
      console.error("Auth delete error:", delUserErr);
      return new Response("Auth delete failed", { 
        status: 500,
        headers: corsHeaders 
      });
    }
    console.log("Auth user deleted successfully");

    console.log(`Account deletion completed successfully for user: ${userId}`);
    return new Response(JSON.stringify({ 
      success: true,
      message: "Account deleted successfully" 
    }), {
      status: 200,
      headers: { 
        ...corsHeaders,
        "content-type": "application/json" 
      },
    });
  } catch (e) {
    console.error("Unhandled error in delete-account function:", e);
    return new Response("Internal Error", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});