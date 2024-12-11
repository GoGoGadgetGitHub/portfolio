import { supabase } from "./supabaseClient.js";

const auth = document.getElementById("auth");
const logingLink = document.getElementById("login-link");
const dropdown = document.getElementById("dropdown-content")
authCheck()

async function authCheck() {
  if (await checkUser()) {
    getUser()
  }
}

async function getUser() {

  var { data: { user }, userError } = await supabase.auth.getUser()

  if (userError) {
    console.log(`Error getting user: ${error.message}`)
    return
  }

  const id = user.id
  console.log(id)
  var { data: profile, profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', id)
    .single()

  if (profileError) {
    console.log(`Error fetching profile: ${error}`)
  }

  const username = profile.username

  auth.textContent = username
  auth.onclick = expand
  populate()
}


function expand() {
  if (dropdown.classList.contains("hide")) {
    dropdown.classList.remove("hide")
    return
  }
  dropdown.classList.add("hide")
}

function populate() {
  let entry = document.createElement("div")
  entry.id = "user-div"
  entry.textContent = "Log out"
  dropdown.appendChild(entry)
  entry.onclick = logout
  entry = document.createElement("div")
  entry.id = "user-div"
  entry.textContent = "Delete Account"
  dropdown.appendChild(entry)
}

async function logout() {
  const { error } = await supabase.auth.signOut()
  location.reload()
}

async function checkUser() {
  console.log("checking user")
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.log(`Can't check session for some odd reason: ${error.message}`)
    return false
  }
  if (session) {
    console.log("user found")
    return true
  }
  console.log("no user logged in")
  return false
}
