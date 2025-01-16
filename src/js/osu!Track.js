import { supabase } from "./supabaseClient.js";
import $ from "jquery";
import "datatables.net";
import a_rank from "../assets/a-rank.png";
import b_rank from "../assets/b-rank.png";
import c_rank from "../assets/c-rank.png";
import d_rank from "../assets/d-rank.png";
import s_rank from "../assets/s-rank.png";
import x_rank from "../assets/x-rank.png";
import sh_rank from "../assets/sh-rank.png";
import xh_rank from "../assets/xh-rank.png";

(async () => {
  const plays = await recentPlays("11628790");
  if (plays) {
    console.log(plays);
  }
  await populateScores("11628790");
  $(document).ready(() => {
    $("#myTable").DataTable({
      paging: false,
      scrollY: 400,
    });
    console.log(a_rank);
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
    const set = document.createElement("td");

    const tableRow = document.createElement("tr");
    const scoreEntry = scores[i];
    const score = scoreEntry.score;

    songName.textContent = score.beatmapset.title;
    tableRow.appendChild(songName);

    sr.textContent = score.beatmap.difficulty_rating;
    tableRow.appendChild(sr);

    acc.textContent = `${Math.round(score.accuracy * 100 * 100) / 100}%`;
    tableRow.appendChild(acc);

    const stats = score.statistics;
    hits.textContent =
      `${stats.count_300}/${stats.count_100}/${stats.count_50}/${stats.count_miss}`;
    tableRow.appendChild(hits);

    grade.innerHTML = `<span class="hide">${score.rank}</span>`;

    const rankImage = document.createElement("img");

    switch (score.rank) {
      case "XH":
        grade.innerHTML = '<span class="hide">0</span>';
        rankImage.src = xh_rank;
        break;
      case "X":
        grade.innerHTML = '<span class="hide">1</span>';
        rankImage.src = x_rank;
        break;
      case "SH":
        grade.innerHTML = '<span class="hide">2</span>';
        rankImage.src = sh_rank;
        break;
      case "S":
        grade.innerHTML = '<span class="hide">3</span>';
        rankImage.src = s_rank;
        break;
      case "A":
        grade.innerHTML = '<span class="hide">4</span>';
        rankImage.src = a_rank;
        break;
      case "B":
        grade.innerHTML = '<span class="hide">5</span>';
        rankImage.src = b_rank;
        break;
      case "C":
        grade.innerHTML = '<span class="hide">6</span>';
        rankImage.src = c_rank;
        break;
      case "D":
        grade.innerHTML = '<span class="hide">7</span>';
        rankImage.src = d_rank;
        break;
      case "F":
        grade.innerHTML = '<span class="hide">8</span>';
        rankImage.src = d_rank;
        break;
    }

    rankImage.classList.add("rank-image");

    grade.appendChild(rankImage);
    tableRow.appendChild(grade);

    if (score.pp) {
      pp.textContent = score.pp;
    } else {
      pp.textContent = 0;
    }
    tableRow.appendChild(pp);

    set.innerHTML = `<span class="hide">${score.created_at}</span>${
      formatRelativeTime(score.created_at)
    }`;
    tableRow.appendChild(set);

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

function formatRelativeTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now - time;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (seconds < 60) {
    return rtf.format(-seconds, "seconds");
  } else if (minutes < 60) {
    return rtf.format(-minutes, "minutes");
  } else if (hours < 24) {
    return rtf.format(-hours, "hour");
  } else {
    return rtf.format(-days, "day");
  }
}
