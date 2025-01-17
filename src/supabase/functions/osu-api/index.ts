import { corsHeaders } from "../_shared/cors.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { recentPlays } from "./recentPlays.ts";
import { getToken } from "./tokenFetch.ts";
import { addScores } from "./addScores.ts";
import { getUserID } from "./getUserID.ts";

Deno.serve(async (req: Request) => {
  //CORS Preflight
  if (req.method === "OPTIONS") {
    console.log("Preflight...");
    return new Response("ok", {
      headers: { ...corsHeaders },
    });
  }

  const { osuUsername } = await req.json();
  console.log(`The username passed is: ${osuUsername}`);

  console.log(`Getting token`);
  const token = await getToken();
  if (token === null) {
    return new Response("Failed to fetch token", {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  console.log("Getting osu user id from database.");
  const osu_user_id = await getUserID(osuUsername, token);
  if (osu_user_id == null) {
    return new Response("Could not find user id, username might not exist!", {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  console.log("Fetching recent plays.");
  const plays = await recentPlays(osu_user_id, token);
  if (plays === null) {
    return new Response("Failed to fetch plays", {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  console.log("Adding scores to database.");
  const added = await addScores(plays, osu_user_id);
  if (!added) {
    return new Response("Failed to add scores", {
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
