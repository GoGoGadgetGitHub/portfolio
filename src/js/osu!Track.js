import { supabase } from "./supabaseClient.js";
import "datatables.net";
//TODO: find better rank icons
import a_rank from "../assets/a-rank.svg";
import b_rank from "../assets/b-rank.svg";
import c_rank from "../assets/c-rank.svg";
import d_rank from "../assets/d-rank.svg";
import f_rank from "../assets/f-rank.svg";
import s_rank from "../assets/s-rank.svg";
import x_rank from "../assets/x-rank.svg";
import sh_rank from "../assets/sh-rank.svg";
import xh_rank from "../assets/xh-rank.svg";
import DataTable from "datatables.net-dt";

const track = document.getElementById("track");
const message = document.getElementById("message");

const table = new DataTable("#myTable", {
  paging: false,

  scrollY: 400,
});

track.addEventListener("click", async () => {
  table.clear().draw();
  message.classList.add("hide");
  const osuUsername = document.getElementById("osu-username-input").value;
  const { plays, osu_user_id, error } = await recentPlays(osuUsername);

  if (error === "id-fail") {
    message.classList.remove("hide");
    message.textContent = "No such user!";
    return;
  }
  if (error) {
    message.classList.remove("hide");
    message = "Something went wrong :(";
    return;
  }
  console.log(plays);

  await populateScores(osu_user_id);
});

async function populateScores(osu_user_id) {
  const { data: scores, error: selectError } = await supabase
    .from("osu_scores")
    .select("score")
    .eq("osu_user_id", osu_user_id);

  console.log(scores);

  if (selectError) {
    console.error(
      `Error retrieving scores from database: ${selectError.message}`,
    );
  }

  const rows = [];
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
    const failPercent = document.createElement("p");
    failPercent.classList.add("fail-percent");
    let failPoint;
    switch (score.rank) {
      case "XH":
        image.innerHTML = '<span class="hide">0</span>';
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
        rankImage.src = f_rank;
        failPoint = calculateFailPoint(
          stats,
          score.beatmap.count_circles,
          score.beatmap.count_sliders,
          score.beatmap.count_spinners,
        );
        failPercent.textContent = `${Math.round(failPoint * 100) / 100}%`;
        grade.appendChild(failPercent);
        break;
    }
    grade.classList.add("grade");
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

    rows.push(tableRow);
  }

  table.rows.add(rows).draw();
}

function calculateFailPoint(stats, circles, sliders, spinners) {
  const totalObjects = circles + sliders + spinners;
  const totalHits = stats.count_300 + stats.count_100 + stats.count_50 +
    stats.count_miss;
  return ((totalHits / totalObjects) * 100);
}

//Uses the edge function to interact with the osu API
//Adds a new osu profile to the database if it does not exist
//Adds new plays for existing users and new users
//Returns a list of recent plays and the osu user id of the username specified
export async function recentPlays(osuUsername) {
  const url = "https://jpxdwuzsxkcerplprlwv.supabase.co/functions/v1/osu-api";
  const headers = {
    "Content-Type": "application/json",
  };

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ osuUsername }),
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
