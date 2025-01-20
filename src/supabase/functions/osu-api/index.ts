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

  //TODO: Handel user does not exist

  const { osuUsername } = await req.json();
  console.log(`The username passed is: ${osuUsername}`);

  const response = { plays: null, osu_user_id: null, error: null };

  console.log(`Getting token`);
  const token = await getToken();
  if (token === null) {
    response.error = "token-fail";
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  console.log("Getting osu user id from database.");
  response.osu_user_id = await getUserID(osuUsername, token);
  console.log(response.osu_user_id);
  if (response.osu_user_id === null) {
    response.error = "id-fail";
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  console.log("Fetching recent plays.");
  response.plays = await recentPlays(response.osu_user_id, token);
  if (response.plays === null) {
    response.error = "plays-fail";
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  console.log("Adding scores to database.");
  const added = await addScores(response.plays, response.osu_user_id);
  if (!added) {
    response.error = "add-scores-fail";
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  return new Response(
    JSON.stringify(response),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    },
  );
});
