import { getClient } from "../_shared/supabase.ts";
import { getSrWithMods } from "./getSrWithMods.ts";

export async function addScores(scores, osu_user_id, token) {
  const supabase = getClient();
  if (supabase === null) {
    console.error("Could not create supabase client");
    return false;
  }

  console.log(`Adding scores for: ${osu_user_id}`);

  // get the last score form this user
  let { data: lastScore, error: lastScoreError } = await supabase.rpc(
    "get_latest_score",
    { p_osu_user_id: osu_user_id },
  );

  if (lastScoreError) {
    console.error(lastScoreError.message);
    return false;
  }

  // if the latest score stored procedure returns null for the user id,
  // this means that there are no scores saved for that user and we need to start with a session ID of 0
  const hadScores = lastScore.osu_user_id !== null;
  console.log(`User had scores saved: ${hadScores}`);
  if (hadScores) {
    console.log(
      "Last score saved for this user is:",
      lastScore.score.beatmapset.title,
    );
    console.log("It was set at :", lastScore.created_at);
    console.log("The session id for this score is:", lastScore.session_id);
  }

  let session_id = hadScores ? lastScore.session_id : 0;
  console.log(`initial session id is set to ${session_id}`);

  let count = 0;
  let prevScore;

  for (let i = scores.length - 1; i >= 0; i--) {
    const score = scores[i];

    const timeStampCurrent = new Date(score.created_at);

    //if current score time <= last score time, skip
    const skip =
      timeStampCurrent.getTime() <= new Date(lastScore.created_at).getTime();
    if (skip) {
      console.log(
        `score was set before latest score in database, it's being skipped`,
      );
      continue;
    }

    let timeStamPrev: Date;

    if (prevScore) {
      timeStamPrev = new Date(prevScore.created_at);
    } else if (hadScores) {
      timeStamPrev = new Date(lastScore.created_at);
    } else {
      timeStamPrev = timeStampCurrent;
    }

    //to determain the session id we need to look at the time diffrence between the last/prev score and the current score
    const timeDiff = timeStampCompare(timeStamPrev, timeStampCurrent);

    // for a time diffrence more than 1 hour the session ID is incremented
    if (timeDiff > 60) {
      console.log(
        `Starting new session, last session was ${session_id}, new session is ${
          session_id + 1
        }, time diffrence is ${timeDiff}`,
      );
      session_id += 1;
    }

    //TODO: Figure out some caching for this
    //
    //NOTE:
    //So this has to check if the mods list only contains CL and NF or just CL or just NF, if so then we don't need to
    //recalculate the star rating
    //Other then that some players migh play like DT only for the entire session, resulting in loads of
    //API calls to add their scores, making this take very very long.
    //i could try a query for this map with these mods in my db to check if i maybe have the sr stored already

    //Ignore the score for sr fetch if it only has either NF or CL or both.
    let nf = false;
    let cl = false;
    for (const mod of score.mods) {
      nf = mod === "NF";
      cl = mod === "CL";
    }

    const shouldGetNewSR = !((nf && cl && score.mods.length === 2) ||
      ((nf || cl) && score.mods.length === 1) ||
      (score.mods.length === 0));

    if (shouldGetNewSR) {
      console.log("This score has mods that effect SR: ", score.mods);
      const srWithMods = await getSrWithMods(
        score.beatmap.id,
        score.mods,
        token,
      );
      console.log(srWithMods.star_rating);
      //just change the sr of the score response lol
    }

    //add record
    const created_at = score.ended_at;
    const { error: insertError } = await supabase
      .from("osu_scores")
      .insert({ osu_user_id, created_at, score, session_id });

    if (insertError) {
      console.error(
        `Error when adding scores to score table:${insertError.message}`,
      );
      return false;
    }
    count += 1;
    console.log(`Score added!: ${score.beatmapset.title}`);
    prevScore = score;
  }
  return true;
}

function timeStampCompare(prev: Date, next: Date) {
  if (prev === null) {
    return;
  }
  const differenceMilli = next - prev;
  const differenceSeconds = differenceMilli / 1000;
  const differenceMinutes = differenceSeconds / 60;

  return Math.abs(Math.round(differenceMinutes));
}
