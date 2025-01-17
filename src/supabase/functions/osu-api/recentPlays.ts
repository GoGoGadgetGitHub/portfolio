import { corsHeaders } from "../_shared/cors.ts";

export async function recentPlays(osu_user_id: string, token: string) {
  const urlApi = new URL(
    `https://osu.ppy.sh/api/v2/users/${osu_user_id}/scores/recent`,
  );

  const params = {
    "include_fails": "1",
    "limit": "999",
  };

  Object.keys(params).forEach((key) =>
    urlApi.searchParams.append(key, params[key])
  );
  console.log(urlApi);

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  let response: Response;
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching recent plays:", error);
    return new Response("Error fetching recent plays", {
      headers: { ...corsHeaders },
      status: 500,
    });
  }
}
