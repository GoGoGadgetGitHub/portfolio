//TODO: figure out a way around inconsistatn behavior. The likly culprit is
//the osu API

export async function recentPlays(userID) {
  const url = "http://localhost:54321/functions/v1/osu-api";

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
  const plays = await recentPlays("22613198");
  if (plays) {
    console.log(plays);
  }
})();
