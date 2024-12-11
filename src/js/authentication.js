import { supabase } from "./supabaseClient.js";

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

//TODO: ok so i need to set up a trigger in the database for user accoutn createion
//that will add a profile entry
//The profile table will have UID as fk with on delete cascade
//this will ensure that unconfirmed profiles are deleted and make sure that when
//the user deletes their account their profile gets romoved too
//this on delete cascade option will need to be set on other child tables of profile aswell
if (signup) {

  document.getElementById("signup").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;

    // if the account already exists then this shoul just log them in (don know if i should be notifying the user of this or not)
    try {
      var { data, error } = await supabase.auth.signInWithOtp({
        email,
      })

      //there was an error with user login/signup
      if (error) {
        console.log(error.message)
        return
      }

      await CreateNewUser(username);

      //the user should be logged in so they can just go to the home page

    } catch (err) {
      message.textContent = "some big bad scary error"
      console.error(err)
    }

  })
}
//NOTE: this will need to change as a result of the above todo

async function CreateNewUser(username) {
  const { error } = await supabase
    .from('profiles')
    .insert({ username: username })
  if (error) {
    console.log(error.message)
  }
}
