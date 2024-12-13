import { supabase } from "./supabaseClient.js";
import { getUsername, checkUser } from "./user.js"

//this file is used for sign up, login and password reset so i need to check which is happening
const login = document.getElementById("login");
const signup = document.getElementById("signup");
const message = document.getElementById("message");

if (login) {
  login.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;

    var { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      }
    })

    if (error) {
      message.textContent = error.message;
    } else {
      window.location.href = "./index.html";
    }
  })
}

if (signup) {

  document.getElementById("signup").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;

    try {

      //this will create a user if one does not exist
      var { data, error } = await supabase.auth.signInWithOtp({
        email,
      })

      //there was an error with user login/signup
      if (error) {
        console.log(error.message)
        return
      }

      console.log(data)

      //if the user did not exist prior to signInWithOtp call they would now
      //have a username of null deu to the trigger on the auth.user table
      //if this is the case their usename should be updated with the one they
      //entered, othewise they will just be logged in an their username will 
      //stay the same

      if (userExists()) {
        console.log("this is where you redirect existing user")
        //window.location.href = '../index.html'
        return
      }

      if (!updateUsename(username)) {
        console.log("error updating username")
        return
      }

      //the user should be logged in so they can just go to the home page
      console.log("this is where you redirect the new user")
      //window.location.href = '../index.html'

    } catch (err) {
      message.textContent = "some big bad scary error"
      console.error(err)
    }
  })
}

async function userExists() {
  return false
}

async function updateUsename(username) {
  const { error } = await supabase
    .from('profiles')
    .insert({ username: username })
  if (error) {
    console.log(error.message)
    return false
  }
  return true
}
