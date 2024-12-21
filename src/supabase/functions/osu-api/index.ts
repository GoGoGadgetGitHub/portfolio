// Setup type definitions for built-in Supabase Runtime APIs
// TODO: do error handeling and error checking
//maybe find dome way to make this dry code and generalise
//make a list of endpoints you'll need
//think of how your gonna save this data in the database
//
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  //CORS Preflight
  if (req.method === "OPTIONS") {
    console.log("Preflight");
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      status: 204,
    });
  }

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
    `https://osu.ppy.sh/api/v2/users/${userID}/scores/recent`,
  );
  const params = {
    "user_id": userID,
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
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    status: 200,
  });
});
