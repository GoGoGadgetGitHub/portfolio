import { supabase } from "./supabaseClient.js";

const loggedin = document.getElementById("user");
const dropdown = document.getElementById("dropdown-content")
getUser()

async function getUser() {
  var {data: {user}, error} = await supabase.auth.getUser()
  const id = user.id
  console.log(id)
  var {data: profile, error} = await supabase
    .from('profiles')
    .select('username')
    .eq('id', id)
    .single()
  console.log(error)
  const username = profile.username
  loggedin.textContent = username
  loggedin.clicked = expand
}

function expand() {
  if (dropdown.classList.contains("hide")){
    dropdown.classList.remove("hide")
    return
  }
  dropdown.classList.add("hide")
}

function populate() {
  const options = ["Log Out", "Delete Accout"]
  for (var opt in options) {
    entry = document.createElement("div")
    entry.textContent = opt
    dropdown.appendChild(entry)
  }
  
}
