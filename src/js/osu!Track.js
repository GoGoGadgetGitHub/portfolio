import { supabase } from "./supabaseClient.js";
import $ from "jquery";
import "datatables.net";

(async () => {
  const plays = await recentPlays("3982856");
  if (plays) {
    console.log(plays);
  }
  await populateScores("3982856");
  $(document).ready(() => {
    $("#myTable").DataTable({
      paging: false,
      scrollY: 400,
    });

    $(fail).addClass(".hide");
  });
})();

async function populateScores(osu_profile_id) {
  const { data: scores, error: selectError } = await supabase
    .from("osu_scores")
    .select("score")
    .eq("osu_profile_id", osu_profile_id);

  if (selectError) {
    console.error(
      `Error retrieving scores from database: ${selectError.message}`,
    );
  }
  const tableBody = document.getElementById("scores-table");

  for (const i in scores) {
    const songName = document.createElement("td");
    const sr = document.createElement("td");
    const acc = document.createElement("td");
    const hits = document.createElement("td");
    const grade = document.createElement("td");
    const pp = document.createElement("td");

    const tableRow = document.createElement("tr");
    const scoreEntry = scores[i];
    const score = scoreEntry.score;
    songName.textContent = score.beatmapset.title;
    tableRow.appendChild(songName);
    sr.textContent = score.beatmap.difficulty_rating;
    tableRow.appendChild(sr);
    acc.textContent = `${Math.round(score.accuracy * 100) / 100}%`;
    tableRow.appendChild(acc);
    const stats = score.statistics;
    hits.textContent =
      `${stats.count_300}/${stats.count_100}/${stats.count_50}/${stats.count_miss}`;
    tableRow.appendChild(hits);
    grade.textContent = score.rank;
    if (score.rank === "F") {
      grade.classList.add("fail");
    }
    tableRow.appendChild(grade);
    if (score.pp) {
      pp.textContent = score.pp;
    } else {
      pp.textContent = 0;
    }
    tableRow.appendChild(pp);
    tableBody.appendChild(tableRow);
  }
}

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
