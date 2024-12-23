import { corsHeaders } from "../_shared/cors.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { recentPlays } from "./recentPlays.ts";
import { getToken } from "./tokenFetch.ts";

//TODO: TEST TEST TEST

Deno.serve(async (req: Request) => {
  //CORS Preflight
  if (req.method === "OPTIONS") {
    console.log("Preflight...");
    return new Response("ok", {
      headers: { ...corsHeaders },
    });
  }

  const { userID } = await req.json();
  const token = await getToken();
  const plays = await recentPlays(userID, token);

  //plays or token would be an error response if the fetch somehow failed
  if (plays instanceof Response) {
    return plays;
  }
  if (token instanceof Response) {
    return token;
  }
  return new Response(JSON.stringify(plays), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
});
