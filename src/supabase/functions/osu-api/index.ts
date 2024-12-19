// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  const { userID } = await req.json();
  console.log(userID);

  //Getting access token
  const tokenResponse = await fetch("http://osu.ppy.sh/oauth/token", {
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

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  //Setting up user recent activity fetch
  const urlApi = new URL(
    `https://osu.ppy.sh/api/v2/users/${userID}/recent_activity`,
  );
  const params = {
    "limit": "20",
    "offest": "1",
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

  console.log("fetching...");
  const response = await fetch(urlApi, {
    method: "GET",
    headers,
  });
  console.log("we got somthing back");

  console.log(response.ok);
  console.log(response.status);
  console.log(response.body);

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
