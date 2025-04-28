import { osuApiRequest } from "./apiCallTemplate.ts";

export async function recentPlays(osu_user_id: string, token: string) {
  const url = `https://osu.ppy.sh/api/v2/users/${osu_user_id}/scores/recent`;

  const params = {
    "include_fails": "1",
    "limit": "999",
  };

  const headers = {
    "x-api-version": "20220705",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  return osuApiRequest(
    {
      url,
      headers,
      errorString: "Error fetching recent plays.",
      method: "GET",
      params: params,
    },
  );
}
