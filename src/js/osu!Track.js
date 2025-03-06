import { supabase } from "./supabaseClient.js";
import "datatables.net";
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
import { Pagination } from "./component/pagination.js";

const track = document.getElementById("track");
const message = document.getElementById("message");
const loader = document.getElementById("loader");

const statSubmited = document.getElementById("submited");
const statAcc = document.getElementById("acc");
const statBpm = document.getElementById("bpm");
const statMissCount = document.getElementById("misscount");
const statSr = document.getElementById("sr");

let scores = undefined;

function toggleLoading(button, loader) {
  loader.classList.toggle("hide");
  button.classList.toggle("hide");
}

const table = new DataTable("#myTable", {
  paging: false,
  scrollY: 400,
  columns: [
    { "title": "Song Name" },
    { "title": "*" },
    { "title": "Accuacy" },
    { "title": "Hits" },
    { "title": "Grade" },
    { "title": "PP" },
    { "title": "Set" },
  ],
});

addToggleFial();
let pager = undefined;
startEndComponent();

const failRadio = document.getElementById("fail-radio");

async function changeSession(sessionID, osu_user_id) {
  const sessionScores = scores[sessionID];
  const { start, end } = await getStartEnd(osu_user_id, sessionID);
  populateScores(sessionScores);
  setStartEndText(start, end);
  populateStats(sessionScores);
}

function setStartEndText(start, end) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  document.getElementById("session-start").innerText = `Starts at: ${
    formatter.format(new Date(start))
  }`;
  document.getElementById("session-end").innerText = `Ends at: ${
    formatter.format(new Date(end))
  }`;
}

async function getStartEnd(osu_user_id, sessionID) {
  //calling stored procedure
  const { data: startEnd, error } = await supabase.rpc(
    "get_start_and_end_of_session",
    { p_osu_user_id: osu_user_id, p_session_id: sessionID },
  );

  if (error) {
    console.error(
      `could net retrieve start and end of session for session ${sessionID}`,
    );
    return null;
  }

  return {
    start: startEnd[0].start_time,
    end: startEnd[0].end_time,
  };

  //chaning start and end text
}

failRadio.addEventListener("change", () => {
  toggleFials();
});

track.addEventListener("click", async () => {
  toggleLoading(track, loader);
  if (pager) {
    pager.node.remove();
  }
  failRadio.checked = true;
  table.clear().draw();
  message.classList.add("hide");

  //add new plays
  const osuUsername = document.getElementById("osu-username-input").value;
  const { plays, osu_user_id, error } = await recentPlays(osuUsername);

  if (error === "id-fail") {
    message.classList.remove("hide");
    message.textContent = "No such user!";
    toggleLoading(track, loader);
    return;
  }
  if (error) {
    message.classList.remove("hide");
    message = "Something went wrong :(";
    toggleLoading(track, loader);
    return;
  }
  const latestSession = await getLatestSession(osu_user_id);

  scores = await getScoresFromDB(osu_user_id);
  console.log(scores);

  pager = addPager(latestSession, osu_user_id);
  await changeSession(latestSession, osu_user_id);

  toggleLoading(track, loader);
});

function toggleFials() {
  const rows = document.getElementsByClassName("fail");
  for (const score of rows) {
    score.classList.toggle("hide");
  }
}

//Try to get the latest session ID for the user and if that fails then set the session ID to 0
async function getLatestSession(osu_user_id) {
  const { data: lastScore, error: lastScoreError } = await supabase.rpc(
    "get_latest_score",
    { p_osu_user_id: osu_user_id },
  );

  if (lastScoreError) {
    console.error("could not retrieve latest score, using id 0");
    sessionID = 0;
  } else {
    sessionID = lastScore.session_id;
  }

  return sessionID;
}

function populateStats(sessionScores) {
  const passes = calcAvg("bpm", sessionScores).passes;
  const acc = calcAvg("accuracy", sessionScores).avg;
  const bpm = calcAvg("bpm", sessionScores).avg;
  const misscount = calcAvg("count_miss", sessionScores).avg;
  const sr = calcAvg("difficulty_rating", sessionScores).avg;

  statSubmited.innerText = `Submited: ${passes}`;
  statAcc.innerText = `Accuracy: ${Math.round(acc * 100 * 100) / 100}`;
  statBpm.innerText = `BPM: ${Math.round(bpm * 100) / 100}`;
  statMissCount.innerText = `Miss Count: ${Math.round(misscount * 100) / 100}`;
  statSr.innerText = `SR: ${Math.round(sr * 100) / 100}`;
}

async function getScoresFromDB(osu_user_id) {
  const { data: scores, error: selectError } = await supabase
    .from("osu_scores")
    .select("*")
    .eq("osu_user_id", osu_user_id);

  if (selectError) {
    console.error(
      `Error retrieving scores from database: ${selectError.message}`,
    );
  }

  const arrangedScores = {};
  for (const score of scores) {
    if (!arrangedScores[score.session_id]) {
      arrangedScores[score.session_id] = [];
      arrangedScores[score.session_id].push(score);
    }
    arrangedScores[score.session_id].push(score);
  }

  return arrangedScores;
}

function populateScores(sessionScores) {
  const rows = [];
  table.clear().draw();
  for (let score of sessionScores) {
    score = score.score;

    const tableRow = document.createElement("tr");

    tableRow.style.background =
      `center / contain no-repeat linear-gradient(to right, var(--background-rgba0), var(--background-rgba1) 90%), url('${score.beatmapset.covers.slimcover}')`;

    const songName = document.createElement("td");
    songName.classList.add("song-name");
    const sr = document.createElement("td");
    const acc = document.createElement("td");
    const hits = document.createElement("td");
    const grade = document.createElement("td");
    const pp = document.createElement("td");
    const set = document.createElement("td");

    const songLink = document.createElement("a");
    songLink.href = score.beatmap.url;
    songLink.textContent = score.beatmapset.title;

    songName.appendChild(songLink);
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
        rankImage.src = f_rank;
        failPoint = calculateFailPoint(
          stats,
          score.beatmap.count_circles,
          score.beatmap.count_sliders,
          score.beatmap.count_spinners,
        );
        failPercent.textContent = `${Math.round(failPoint * 100) / 100}%`;
        grade.appendChild(failPercent);
        tableRow.classList.add("fail");
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

  if (!failRadio.checked) {
    toggleFials();
  }
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
  const { data, error } = await supabase.functions.invoke("osu-api", {
    body: JSON.stringify({ osuUsername }),
  });
  if (error) {
    console.log(
      `There as an error invoing the edge function: ${error.message}`,
    );
    return null;
  }
  return data;
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

function startEndComponent() {
  let startP;
  let endP;
  if (!document.getElementById("start-end-div")) {
    const targetDiv = document.getElementById("myTable_info").parentNode;

    const startEndDiv = document.createElement("div");
    startEndDiv.classList.add("start-end-div");

    startP = document.createElement("p");
    startP.id = "session-start";
    endP = document.createElement("p");
    endP.id = "session-end";

    startEndDiv.appendChild(startP);
    startEndDiv.appendChild(endP);

    targetDiv.append(startEndDiv);
  }
  startP = document.getElementById("session-start");
  endP = document.getElementById("session-end");
}

//Add toggle fail component to datatables
function addToggleFial() {
  const controlRow = document.getElementsByClassName(
    "dt-layout-cell dt-layout-end",
  );

  for (const component of controlRow) {
    //Checking if this is the div we need to add the component too
    if (
      component.firstChild && component.firstChild.className === "dt-search"
    ) {
      component.id = "table-controls";

      const toggleFail = document.createElement("div");
      toggleFail.classList.add("toggle-fail");
      component.appendChild(toggleFail);

      const failRadioLabel = document.createElement("label");
      failRadioLabel.textContent = "Display Fails:";

      const failRadio = document.createElement("input");
      failRadio.type = "checkbox";
      failRadio.id = "fail-radio";
      failRadio.checked = true;

      toggleFail.appendChild(failRadioLabel);
      toggleFail.appendChild(failRadio);

      return;
    }
  }
}

//TODO: The pager seems to be behaving wierdly in the case of a small amount of sessions. not all sessions are being shown
function addPager(maxPages, osu_user_id) {
  const controlRow = document.getElementsByClassName(
    "dt-layout-cell dt-layout-end",
  );

  for (const component of controlRow) {
    //Checking if this is the div we need to add the component too
    if (
      component.firstChild && component.firstChild.className === "dt-search"
    ) {
      pagerObject = new Pagination(maxPages);
      component.appendChild(pagerObject.node);

      document.addEventListener("moved", async () => {
        const sessionID = pager.pages[pager.pointer].value;
        await changeSession(sessionID, osu_user_id);
      });

      return pagerObject;
    }
  }
}

function calcAvg(type, scores) {
  let sum = 0;
  let passes = 0;

  for (const score of scores) {
    if (score.score.rank === "F") {
      continue;
    }

    if (type === "count_miss") {
      sum += score.score.statistics[type];
      passes++;
      continue;
    }

    if ((type === "bpm") || (type === "difficulty_rating")) {
      sum += score.score.beatmap[type];
      passes++;
      continue;
    }

    passes++;
    sum += score.score[type];
  }
  return { avg: sum / passes, passes: passes };
}
