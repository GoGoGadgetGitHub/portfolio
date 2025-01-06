//Create supabase client
import { createClient } from "npm:@supabase/supabase-js@2";

export function getClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceKey);

  if (supabase) {
    console.log("Client Created sucsessfully");
    return supabase;
  }
  return null;
}
