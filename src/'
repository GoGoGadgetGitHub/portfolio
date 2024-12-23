import { corsHeaders } from "../_shared/cors.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

export async function getToken() {
  const supabaseUrl = Deno.env.get("SUPABASE_API");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceKey);

  const { token, selectError } = await supabase
    .from("token_cache")
    .select("token, created_at")
    .eq("token_name", "osu_api_token")
    .single();

  if (selectError) {
    console.error(`Error fetching token from database: ${selectError}`);
  }

  if (!token) {
    const newToken = await fetchToken();
    if (newToken instanceof Response) {
      return newToken;
    }

    const { insertError } = await supabase
      .from("contries")
      .insert({ token_name: "osu_api_token", token: newToken });

    if (insertError) {
      console.error(`Error inserting new token into table: ${insertError}`);
    }

    return newToken.access_token;
  }

  const { token_data, created_at } = token;
  const accesToken = token_data.acces_token;
  const expiresIn = token_data.expires_in;

  const createdAt = new Date(created_at).getTime();
  const expiresAt = createdAt + expiresIn * 1000;
  const now = Date.now();

  if (now > expiresAt) {
    console.log("Token is valid");
    return accesToken;
  }

  const newToken = await fetchToken();
  if (newToken instanceof Response) {
    return newToken;
  }

  const { updateError } = await supabase
    .from("token_cache")
    .update({ token: newToken })
    .eq("token_name", "osu_api_token");

  if (updateError) {
    console.error(`fuck: ${updateError}`);
  }

  return newToken.access_token;
}

async function fetchToken() {
  let tokenResponse: Response;
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

    return tokenData;
  } catch (error) {
    console.error("Error fetching API token:", error);
    return new Response("Error fetching API token", {
      headers: { ...corsHeaders },
      status: 500,
    });
  }
}
