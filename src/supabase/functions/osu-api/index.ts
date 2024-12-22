//NOTE: This code seems really messy maybe i should split fetching the token into a new file

import { corsHeaders } from "../_shared/cors.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  //CORS Preflight
  if (req.method === "OPTIONS") {
    console.log("Preflight...");
    return new Response("ok", {
      headers: { ...corsHeaders },
    });
  }

  const { userID } = await req.json();

  let accessToken;
  let tokenResponse;
  try {
    tokenResponse = await fetch("http://osu.ppy.sh/oauth/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: Deno.env.get("OSU_CLIENT_ID"),
        client_secret: Deno.env.get("OSU_CLIENT_SECRET"),
        grant_type: "client_credentials",
        scope: "public",
      }),
    });

    if (!tokenResponse.ok) {
      console.error(
        `HTTP error: ${tokenResponse.status} - ${tokenResponse.statusText}. In token fetch`,
      );
      return new Response("Failed to fetch api token", {
        headers: { ...corsHeaders },
        status: tokenResponse.status,
      });
    }

    const tokenData = await tokenResponse.json();
    accessToken = tokenData.access_token;
  } catch (error) {
    console.error("Error fetching API token:", error);
    return new Response("Error fetching API token", {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  //Setting up user recent activity fetch
  const urlApi = new URL(
    `https://osu.ppy.sh/api/v2/users/${userID}/scores/recent`,
  );

  const params = {
    "include_fails": "1",
    "limit": "9999",
  };

  Object.keys(params).forEach((key) =>
    urlApi.searchParams.append(key, params[key])
  );
  console.log(urlApi);

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${accessToken}`,
  };

  let response;
  try {
    response = await fetch(urlApi, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error(
        `HTTP error: ${response.status} - ${response.statusText}`,
      );
      return new Response("Failed to fetch recentplays", {
        headers: { ...corsHeaders },
        status: response.status,
      });
    }
  } catch (error) {
    console.log("Error fetching recent plays:", error);
    return new Response("Error fetching recent plays", {
      headers: { ...corsHeaders },
      status: 500,
    });
  }

  const data = await response.json();
  console.log(data);

  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
});
