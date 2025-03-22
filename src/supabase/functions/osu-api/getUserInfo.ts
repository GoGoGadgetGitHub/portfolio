import { getClient } from "../_shared/supabase.ts";

export async function getUserInfo(osuUsername: string, token: string) {
  const supabase = getClient();
  if (supabase === null) {
    return null;
  }
  //NOTE: Starting to wonder why i'm keeping a record of osu profiles

  console.log(`Attempting to fetch id from database for ${osuUsername}...`);
  const { data: osu_user_id, error: selectError } = await supabase
    .from("osu_profiles")
    .select("osu_user_id")
    .eq("osu_username", osuUsername.toUpperCase())
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

  console.log("Fetching user data...");
  const userData = await getUserData(osuUsername, token);
  if (userData === null) {
    return null;
  }

  if (!osu_user_id) {
    console.log(`User is not in database, adding profile entry`);
    await addOsuUser(userData, supabase);
  }

  return { id: userData.id, otherData: userData };
}

//adds an osu profile to the profiles table
async function addOsuUser(userData, supabase) {
  const { data, error: insertError } = await supabase
    .from("osu_profiles")
    //Usernames are saved in all uppercase to allow for selecting ID with username
    .insert([{
      osu_user_id: userData.id,
      osu_username: userData.username.toUpperCase(),
    }])
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
