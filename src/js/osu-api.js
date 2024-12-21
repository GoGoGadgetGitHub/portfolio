//this is gonna be the dev url
const url = "http://localhost:54321/functions/v1/osu-api";

const headers = {
  "Content-Type": "application/json",
};

fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify({ userID: "3982856" }),
}).then((response) => {
  const data = response.json();
  console.log(data);
});
