import { getClient } from "../_shared/supabase.ts";

export async function addScores(scores, user_id) {
  const supabase = getClient();
  if (supabase === null) {
    console.error("Could not create supabase client");
    return false;
  }

  // get the last score form this user
  console.log(user_id);
  let { data: lastScore, error: lastScoreError } = await supabase.rpc(
    "get_latest_score",
    { p_osu_profile_id: user_id },
  );

  if (lastScoreError) {
    console.error(lastScoreError.message);
    return false;
  }

  // if the user has no previos score in the table then we'll start with an initial session id 0
  const hadScores = lastScore.osu_profile_id !== null;
  let session_id = hadScores ? lastScore.session_id : 0;

  let count = 0;
  let prevScore;

  for (const i in scores) {
    const score = scores[i];

    const timeStampNext = new Date(score.created_at);

    //on the first itteration of the loop prev score will be undefined
    const timeStamPrev = prevScore ? new Date(prevScore.created_at) : null;

    //if the were no scores logged for this user the time stamp of the last score will be the time stamp of the next score
    const timeStampLast = hadScores
      ? new Date(lastScore.created_at)
      : timeStampNext;

    console.log(`result of comparison between last score and next score:
      ${timeStampNext.getTime() === timeStampLast.getTime()}`);

    //We reached the end of new scores if the user had previos scores and the last know previos score's timestamp is equal
    //to the score we want to add
    const finished = (timeStampNext.getTime() === timeStampLast.getTime()) &&
      hadScores;
    if (finished) {
      console.log(`reached end of new scores. ${count} added`);
      break;
    }

    const timeDiffLast = timeStampCompare(timeStampLast, timeStampNext);
    const timeDiffPrev = timeStampCompare(timeStamPrev, timeStampNext);

    //If this is the first itteration of the the loop the time diffrence between scores will be the diffrence
    //between the last score i have of that user in the database and the next score i want to add
    //other wise it will be the time diffrence between the pevious score added and the next one
    const timeDiffMin = prevScore ? timeDiffPrev : timeDiffLast;

    // for a time diffrence more than 1 hour the session ID is incremented
    session_id = (timeDiffMin > 60) ? session_id += 1 : session_id;

    //add record
    const created_at = score.created_at;
    const { error: insertError } = await supabase
      .from("osu_scores")
      .insert({ osu_profile_id: user_id, created_at, score, session_id });

    if (insertError) {
      console.error(
        `Error when adding scores to score table:${insertError.message}`,
      );
      return false;
    }
    count += 1;
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
