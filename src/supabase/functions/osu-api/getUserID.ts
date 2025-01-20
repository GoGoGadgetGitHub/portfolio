import { getClient } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";

export async function getUserID(osuUsername: string, token: string) {
  const supabase = getClient();
  if (supabase === null) {
    return null;
  }

  console.log(`Attempting to fetch id from database for ${osuUsername}`);
  let { data: osu_user_id, error: selectError } = await supabase
    .from("osu_profiles")
    .select("osu_user_id")
    .eq("osu_username", osuUsername)
    .single();

  //PGRST116 is the error code for now rows returned, that's fine
  //it just means that the record does not exist which is an expected result
  //if it doesn't exist we're adding it
  if (selectError && (selectError.code !== "PGRST116")) {
    console.log(
      `Error fetching user data from database: ${selectError.message}`,
    );
    return null;
  }

  if (osu_user_id) {
    console.log(`ID found in database: ${osu_user_id.osu_user_id}`);
    return osu_user_id.osu_user_id;
  }
  console.log("No ID found, fetching user data from osu API");
  const userData = await getUserData(osuUsername, token);
  if (userData === null) {
    return null;
  }
  await addOsuUser(userData, supabase);
  return userData.id;
}

//adds an osu profile to the profiles table
async function addOsuUser(userData, supabase) {
  const { data, error: insertError } = await supabase
    .from("osu_profiles")
    .insert([{ osu_user_id: userData.id, osu_username: userData.username }])
    .select();

  if (insertError) {
    console.error(
      `Error adding new entry to osu profiles table: ${insertError.message}`,
    );
    return null;
  }
  console.log(`User added to osu_profiles table: ${data}`);
}

export async function getUserData(osuUsername: string, token: string) {
  const urlApi = new URL(
    `https://osu.ppy.sh/api/v2/users/@${osuUsername}/`,
  );

  const params = {
    "key": osuUsername,
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
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching user id:", error);
    return null;
  }
}
