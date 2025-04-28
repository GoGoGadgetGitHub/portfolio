import { osuApiRequest } from "./apiCallTemplate.ts";

export async function getSrWithMods(beatmapID, mods, token) {
  const url = `https://osu.ppy.sh/api/v2/beatmaps/${beatmapID}/attributes`;

  console.log(`In SR with mods call: ${mods}`);

  const body = {
    "mods": mods,
    "ruleset": "osu",
  };

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  return await osuApiRequest({
    url,
    headers,
    errorString: "could not fetch beatmap atributes with mods",
    method: "POST",
    body: JSON.stringify(body),
  });
}
