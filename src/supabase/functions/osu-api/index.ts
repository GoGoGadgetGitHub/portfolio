import { corsHeaders } from "../_shared/cors.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { recentPlays } from "./recentPlays.ts";
import { getToken } from "./tokenFetch.ts";
import { addScores } from "./addScores.ts";
import { getUserInfo } from "./getUserInfo.ts";

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

  const response: { osu_user_info?: object; error?: string } = {
    osu_user_info: undefined,
    error: undefined,
  };

  const failOpts = {
    headers: { ...corsHeaders },
    status: 500,
  };

  //TODO: The token caching does not work properly i need to fix it
  console.log(`Getting token`);
  const token = await getToken();
  if (token === null) {
    response.error = "token-fail";
    return new Response(JSON.stringify(response), failOpts);
  }

  console.log("Getting osu user data.");
  response.osu_user_info = await getUserInfo(osuUsername, token);
  console.log(response.osu_user_info);
  if (!response.osu_user_info) {
    response.error = "info-fail";
    return new Response(JSON.stringify(response), failOpts);
  }

  console.log("Fetching recent plays.");
  const plays = await recentPlays(response.osu_user_info.id, token);
  if (!plays) {
    response.error = "plays-fail";
    return new Response(JSON.stringify(response), failOpts);
  }

  console.log("Adding scores to database.");
  const added = await addScores(plays, response.osu_user_info.id, token);
  if (!added) {
    response.error = "add-scores-fail";
    return new Response(JSON.stringify(response), failOpts);
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
