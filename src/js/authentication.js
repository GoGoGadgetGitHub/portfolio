import { supabase } from "./supabaseClient.js";

//this file is used for both sign up and login so i need to check which is happening
const login = document.getElementById("login");
const signup = document.getElementById("signup");
const message = document.getElementById("message");

if (login){
  login.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        message.textContent = error.message;
        console.log(error.message)
      } else {
        window.location.href = "./index.html";
        console.log(data); // Handle user data
      }
    } catch (err) {
      console.log("big ol bad error")
      console.error(err);
    }

  })
}

if (signup){
  document.getElementById("signup").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConf = document.getElementById("password-conf").value;
    const username = document.getElementById("username").value;

    if (password !== passwordConf) {
      message.textContent = "passwords don't match..."
      return
    }

    try {

      var { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      console.log(error.code)
      //there was an error with user creation
      if (error.code === "user_already_exists") {
        console.log("alsdhasjg")
        accountExists()
        return
      }

      //once user is cresated sign them in add their chosen username to the profiles table
      var { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      //there was an error with user login
      if (error){
        console.log(error.message)
        return
      }

      CreateNewUser(username);

    } catch (err) {
      message.textContent = "Please make sure you entered a valid email adress."
      console.error(err)
    }

  })
}  

async function CreateNewUser(username) {
  const {error} = await supabase
    .from('profiles')
    .insert({username:username})
  if (error){
    console.log(error.message)
  }
}

function accountExists() {
  console.log("asjdhlka")
  const message = document.getElementById("message")
  const p = document.createElement("p")
  const a = document.createElement("a")
  p.textContent = "User already exists "
  a.textContent = "Login"
  a.href = "../login.html"
  message.appendChild(p)
  message.appendChild(a)
}
