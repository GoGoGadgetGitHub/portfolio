import { corsHeaders } from "../_shared/cors.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { recentPlays } from "./recentPlays.ts";
import { getToken } from "./tokenFetch.ts";

Deno.serve(async (req: Request) => {
  //CORS Preflight
  if (req.method === "OPTIONS") {
    console.log("Preflight...");
    console.log(corsHeaders);
    return new Response("ok", {
      headers: { ...corsHeaders },
    });
  }

  const { userID } = await req.json();

  const token = await getToken();
  if (token === null) {
    return new Response("Failed to fetch token", {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  //TODO:Every now and then the recent plays fetch fails. I might need to implemnet a retry tactic

  const plays = await recentPlays(userID, token);
  if (token === null) {
    return new Response("Failed to fetch plays", {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  return new Response(JSON.stringify(plays), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
});
