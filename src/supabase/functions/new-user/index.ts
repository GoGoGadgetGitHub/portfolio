// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  //CORS Preflight
  if (req.method === "OPTIONS") {
    console.log("Preflight...");
    return new Response("ok", {
      headers: { ...corsHeaders },
    });
  }

  //Create supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceKey);

  const { username, email } = await req.json();

  //Get the id of the user with thier email address
  const { data: id, error: IdError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (IdError) {
    console.error(`Problem selecting id from users tabel: ${IdError.message}`);
    // Respond with an error message
  }

  console.log(id);

  //check if the username is null
  const { data: name, error: checkError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", id.id)
    .single();

  if (checkError) {
    console.error(
      `Problem cheking username: ${checkError.name} - ${checkError.message}`,
    );
  }

  console.log(name);

  //Some check for null
  if (name.username !== null) {
    //Respong with a message stating that the username is already there
    //This would mean the account exists
  }

  //If the username is null then this is a new user and we need to give the username
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ username: username })
    .eq("id", id.id);

  if (updateError) {
    console.error(`Problem updating username: ${updateError.message}`);
    // Respond with an error message
  }

  return new Response(
    "some data",
    {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/new-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
*/
