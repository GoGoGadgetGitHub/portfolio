import { getClient } from "../_shared/supabase.ts";

export async function addScores(scores, user_id) {
  const supabase = getClient();
  if (supabase === null) {
    console.error("Could not create supabase client");
    return null;
  }
  // get the last score form this user
  console.log(user_id);
  let { data: lastScore, error: lastScoreError } = await supabase.rpc(
    "get_latest_score",
    { p_osu_profile_id: user_id },
  );

  if (lastScoreError) {
    console.error(lastScoreError.message);
    return null;
  }

  // if the user has no previos score in the table then we'll start with an initial session id 0
  let session_id = lastScore.session_id;
  if (lastScore.osu_profile_id === null) {
    console.log("No scores exist for this user, initialising session id to 0");
    session_id = 0;
  }

  let count = 0;
  let prevScore;
  let i;
  console.log(lastScore);
  for (i in scores) {
    const score = scores[i];
    console.log(score, prevScore);
    //compare last score with socre, if they are the same then exit
    const timeStampNext = new Date(score.created_at);
    const timeStamPrev = prevScore ? new Date(prevScore.created_at) : null;
    const timeStampLast = new Date(lastScore.created_at);

    console.log(`result of comparison between last score and next score:
      ${timeStampNext.getTime() === timeStampLast.getTime()}`);

    if (timeStampNext.getTime() === timeStampLast.getTime()) {
      console.log(`reached end of new scores. ${count} added`);
      break;
    }

    const timeDiffLast = timeStampCompare(timeStampLast, timeStampNext);
    const timeDiffPrev = timeStampCompare(timeStamPrev, timeStampNext);

    const timeDiffMin = prevScore ? timeDiffPrev : timeDiffLast;
    console.log(timeDiffMin);

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
      return null;
    }
    count += 1;
    prevScore = score;
  }

  function timeStampCompare(last: Date, next: Date) {
    if (last === null) {
      return;
    }
    const differenceMilli = next - last;
    const differenceSeconds = differenceMilli / 1000;
    const differenceMinutes = differenceSeconds / 60;

    return differenceMinutes;
  }
