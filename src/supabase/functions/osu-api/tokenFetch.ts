import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getClient } from "../_shared/supabase.ts";

export async function getToken() {
  //Get token from database
  /*
  const tableName = "token_cahe";
  const params = new URLSearchParams({ token_name: "osu_api_token" });
  const url = `${supabaseUrl}/rest/v1/${tableName}?${params}`;
  console.log(url);
  const response = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/vdn.pgrst.object+json",
    },
  });

  if (!response.ok) {
    console.error("api be bugging");
  }

  const { token, expires_in } = await response.json();
  console.log(token, expires_in);
  */
  const supabase = getClient();
  if (supabase === null) {
    console.error("Supabase client could not be made");
    return null;
  }

  const { data: token, error: selectError } = await supabase
    .from("token_cache")
    .select("token, created_at")
    .eq("token_name", "osu_api_token")
    .single();

  if (selectError) {
    console.error(
      `Error fetching token from database: ${selectError.message}`,
    );
  }

  //Checking if token is still valid
  if (token) {
    console.log("token found");
    const { access_token, expires_in } = token.token;

    const createdAt = new Date(token.created_at).getTime();
    const expiresAt = createdAt + expires_in * 1000;
    const now = Date.now();

    //Token is still valid, return it
    if (now < expiresAt) {
      console.log("Token is valid");
      return access_token;
    }
  }

  //Token is not still valid so get a new one
  const newToken = await fetchToken();

  if (newToken === null) {
    return null;
  }

  //Upsert the new token
  const { error: upsertError } = await supabase
    .from("token_cache")
    .upsert({
      token_name: "osu_api_token",
      token: newToken,
    });

  if (upsertError) {
    console.error(`Upsert error: ${upsertError.message}`);
    return null;
  }

  //Finally return it
  return newToken.access_token;
}

async function fetchToken() {
  //Fetching new token
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

    //If the response has some problems log it and return null
    if (!tokenResponse.ok) {
      console.error(
        `HTTP error: ${tokenResponse.status} - ${tokenResponse.statusText}. In token fetch`,
      );
      return null;
    }

    //Response was fine return the new token
    const token = await tokenResponse.json();
    return token;
  } catch (error) {
    //Likey a more language related error like parsing ect since HTTP errors
    //are already being checked for
    console.error("Error fetching API token:", error);
    return null;
  }
}
