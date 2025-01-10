export async function recentPlays(userID) {
  const url = "https://jpxdwuzsxkcerplprlwv.supabase.co/functions/v1/osu-api";
  const headers = {
    "Content-Type": "application/json",
  };

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ userID }),
    });
    if (!response.ok) {
      console.log(
        `HTTP error: ${response.status} - ${response.statusText}. In main call`,
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("some wacky error:", error);
  }
}

(async () => {
  const plays = await recentPlays("15417745");
  if (plays) {
    console.log(plays);
  }
})();
