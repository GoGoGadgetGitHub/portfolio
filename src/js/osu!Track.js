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
import star from "../assets/star.svg";
import DataTable from "datatables.net-dt";
import { Pagination } from "./component/pagination.js";
import { Chart } from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { format, parse } from "date-fns";

//TODO: figure out graph switching logic

//NOTE: There are some genreal things abou the UI which i feel can use improvment. Most notably the songs table's font and
//font size
//Generally i think the font looks really plain and the weight probably needs to be a little higher

const track = document.getElementById("track");
const message = document.getElementById("message");
const loader = document.getElementById("loader");
const statSubmited = document.getElementById("submited");
const statAcc = document.getElementById("acc");
const statBpm = document.getElementById("bpm");
const statMissCount = document.getElementById("misscount");
const statSr = document.getElementById("sr");
const profile = document.getElementById("pro-container");

const table = new DataTable("#myTable", {
  paging: false,
  scrollY: 400,
});
let chart;

const srTitle = document.querySelector("#icon-header span.dt-column-title");
srTitle.innerHTML = `<img src=${star}/>`;

addToggleFail();
let pager = undefined;
let osu_user_id = undefined;
startEndComponent();

const failRadio = document.getElementById("fail-radio");

//TODO: somthing broke while i was changing sessions
//that is not helpfull...

//TODO: OPTIMIZE SHIT
//niether is this

failRadio.addEventListener("change", () => {
  toggleFails();
});

//TODO: fix graph resizing
window.addEventListener("resize", checkOverlap);

function checkOverlap() {
  const profile = document.getElementById("pro-container");
  const usernameInput = document.getElementById("osu-username");

  const proRect = profile.getBoundingClientRect();
  const inpRect = usernameInput.getBoundingClientRect();

  const isOverlapping = !(proRect.right < inpRect.left);

  profile.style.visibility = isOverlapping ? "hidden" : "visible";
}

track.addEventListener("click", async () => {
  if (!profile.classList.contains("hide")) {
    profile.classList.add("hide");
  }

  toggleLoading(track, loader);

  if (pager) {
    pager.div.remove();
  }

  failRadio.checked = true;
  table.clear().draw();
  message.classList.add("hide");

  //add new plays
  const osuUsername = document.getElementById("osu-username-input").value;
  const { osu_user_info, error } = await osuApi(osuUsername);

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

  osu_user_id = osu_user_info.id;
  populateProfileComponent(osu_user_info.otherData);
  document.getElementById("pro-container").classList.toggle("hide");

  const latestSessionID = await getLatestSession(osu_user_id);
  console.log(latestSessionID);

  pager = addPager(latestSessionID);

  await changeSession(latestSessionID);

  toggleLoading(track, loader);
});

async function changeSession(sessionID) {
  const session = await getSessionScoresFromDB(sessionID);

  if (session === null) {
    return null;
  }

  populateScores(session.scores);
  changeTableInfo(
    `Passes: ${session.passes}   Fails: ${session.fails}`,
  );
  setStartEndText(session.startTime, session.endTime);
  populateStats(session);
  await addGraph(session);
}

function changeTableInfo(text) {
  const targetDiv = document.getElementById("myTable_info");
  targetDiv.innerText = text;
}

function setStartEndText(start, end) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  document.getElementById("session-start").innerText = `Starts at: ${formatter.format(new Date(start))
    }`;
  document.getElementById("session-end").innerText = `Ends at: ${formatter.format(new Date(end))
    }`;
}

async function getStartEnd(sessionID) {
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
    start: new Date(startEnd[0].start_time),
    end: new Date(startEnd[0].end_time),
  };

  //chaning start and end text
}

// TODO: Profile picture links to osu profile
function populateProfileComponent(osuUserData) {
  console.log(osuUserData);
  const image = document.getElementById("pro-img");
  const rank = document.getElementById("pro-rank");
  const pp = document.getElementById("pro-pp");
  const score = document.getElementById("pro-score");
  image.src = osuUserData.avatar_url;
  rank.innerText = `Global Rank: #${osuUserData.rank_history.data[0]}`;
  pp.innerText = `PP: ${osuUserData.statistics.pp}`;
  score.innerText = `Score: ${osuUserData.statistics.ranked_score}`;
}

function toggleFails() {
  const rows = document.getElementsByClassName("fail");
  for (const score of rows) {
    score.classList.toggle("hide");
  }
}

function toggleLoading(button, loader) {
  loader.classList.toggle("hide");
  button.classList.toggle("hide");
}

//Try to get the latest session ID for the user and if that fails then set the session ID to 0
async function getLatestSession() {
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

//TODO: Figure out how to do modded sr for both the graph and the displayed star rating
//this requires an api call for each new modded score, that ups the amount of calls i need to do
//to update the scores for a user. (I'll do an initial implimentation just to get the sr to be more accurate)

function populateStats(sessionScores) {
  const passes = sessionScores.passes;
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

async function getSessionScoresFromDB(session_id) {
  const { data: scores, error } = await supabase.rpc(
    "get_session_scores_by_date",
    { p_osu_user_id: osu_user_id, p_session_id: session_id },
  );

  if (error) {
    console.error(
      `Error retrieving scores from database: ${selectError.message}`,
    );
  }

  console.log(scores);
  if (scores === null) {
    message.innerText = "You have set no scores in the last 24 hours :)";
    message.classList.toggle("hide");
    return null;
  }

  const session = {
    scores: [],
    fails: 0,
    passes: 0,
    startTime: undefined,
    endTime: undefined,
  };

  //Count Fails and passes
  for (const score of scores) {
    session.scores.push(score);
    if (score.score.rank === "F") {
      session.fails++;
    } else {
      session.passes++;
    }
  }

  //Get start and end time of session
  const startEnd = await getStartEnd(session_id);
  session.startTime = startEnd.start;
  session.endTime = startEnd.end;

  console.log(session);
  return session;
}

//TODO: Song links should open up in a new tab
//TODO: add mods to table
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

    const rating = document.createElement("p");
    rating.innerText = score.beatmap.difficulty_rating;
    sr.appendChild(rating);
    const starIcon = document.createElement("img");
    starIcon.src = star;
    sr.appendChild(starIcon);
    sr.id = "star-rating";
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

    set.innerHTML = `<span class="hide">${score.created_at}</span>${formatRelativeTime(score.created_at)
      }`;
    tableRow.appendChild(set);

    rows.push(tableRow);
  }

  table.rows.add(rows).draw();

  if (!failRadio.checked) {
    toggleFails();
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
export async function osuApi(osuUsername) {
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
    const targetDiv = document.getElementById("sessions");

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
function addToggleFail() {
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

      const failSpan = document.createElement("span");
      failSpan.classList.add("checkmark");

      toggleFail.appendChild(failRadioLabel);
      failRadioLabel.appendChild(failRadio);
      failRadioLabel.appendChild(failSpan);

      return;
    }
  }
}

function addPager(maxPages) {
  const targetDiv = document.getElementById("sessions");

  const pagerDiv = document.createElement("div");
  pagerDiv.classList.add("pager");
  const pagerTitle = document.createElement("h4");
  pagerTitle.innerText = "Seslect Session:";

  pagerObject = new Pagination(maxPages);
  pagerDiv.appendChild(pagerTitle);
  pagerDiv.appendChild(pagerObject.node);
  targetDiv.appendChild(pagerDiv);

  //I have to add the event listener here otherwise it trys to add the event to the
  //pager object before it exists
  document.addEventListener("moved", async () => {
    const sessionID = pagerObject.pages[pagerObject.pointer].value;
    await changeSession(sessionID);
  });

  return { comp: pagerObject, div: pagerDiv };
}

function calcAvg(type, sessionScores) {
  let sum = 0;
  let passes = 0;

  for (const score of sessionScores.scores) {
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

//TODO: add other chart data functions, maybe make a module that you can import and pass data to
//TODO: figure out chart colors (see graph idea draw io file)
function createSessionSRData(session) {
  const data = [];

  for (const score of session.scores) {
    console.log(session.startTime.getTime());
    data.push(
      {
        x: new Date(score.created_at).getTime(),
        y: score.score.beatmap.difficulty_rating,
      },
    );
  }
  return data;
}

function addGraph(session) {
  if (chart) {
    chart.destroy();
  }

  const data = createSessionSRData(session);
  console.log(data);

  const ctx = document.getElementById("test-graph");

  //TODO: add lablels for data
  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Star Rating Over Time",
          data: data,
          tension: 0.3,
        },
      ],
    },
    options: {
      parsing: false,
      scales: {
        x: {
          type: "time",
          time: {
            tooltipFormat: "yyyy-MM-dd HH:mm",
          },
        },
      },
    },
  });
}
