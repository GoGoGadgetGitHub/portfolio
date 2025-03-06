import { getClient } from "../_shared/supabase.ts";

export async function addScores(scores, osu_user_id) {
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

  let session_id = hadScores ? lastScore.session_id : 0;

  let count = 0;
  let prevScore;

  for (const i in scores) {
    const score = scores[i];

    const timeStampCurrent = new Date(score.created_at);

    let timeStamPrev: Date;

    if (prevScore) {
      timeStamPrev = new Date(prevScore.created_at);
    } else if (hadScores) {
      timeStamPrev = new Date(lastScore.created_at);
    } else {
      timeStamPrev = timeStampCurrent;
    }

    //We reached the end of new scores if the user had previos scores and the last
    //know previos score's timestamp is equal to the score we want to add
    //this assumes the recent plays end point returns scores in accending order of time
    const finished = (timeStampCurrent.getTime() ===
      new Date(lastScore.created_at).getTime()) &&
      hadScores;
    if (finished) {
      console.log(`reached end of new scores. ${count} added`);
      break;
    }
    //if there were no scores logged for this user then we would just log all the scores returned from the recent
    //plays end point i.e. there is no break condition

    //to determain the session id we need to look at the time diffrence between the last/prev score and the current score
    const timeDiff = timeStampCompare(timeStamPrev, timeStampCurrent);

    // for a time diffrence more than 1 hour the session ID is incremented
    if (timeDiff > 60) {
      console.log(`Starting new session... time diffrence is ${timeDiff}`);
      session_id += 1;
    }

    //add record
    const created_at = score.created_at;
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
