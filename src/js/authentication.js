import { supabase } from "./supabaseClient.js";
/*NOTE:
This is an extreamly simplified authentication flow. I spent way too long trying to get this to work
with first a more traditional password and email flow, which got stuck at reset passowrd.
Then i tried to use just email login and sign up with usernames but this flopped aswell when trying
to update the username colomn of the profiles table so that the user can have a username
Considering this has taken me over a week to try and get working i opted for the most simple approach
i can. Just email confirmation login. No usernames, no passowrds just email. I might come back and try
to improve this later but i really just want to move on past this and work on some actual projects.

I admit this is a cop out but this is also just a protfolio page which needs user acounts for one simple
task. So i believe in this case it's justified
*/

const login = document.getElementById("login");
const message = document.getElementById("message");

if (login) {
  login.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;

    var { data, error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      message.textContent = error.message;
    } else {
      //window.location.href = "./index.html";
      document.getElementById("submit").classList.add("hide")
      document.getElementById("no-account").classList.add("hide")
      message.textContent = "Check your email and click the link to login. \n You can close this tab."
    }
  })
}

/*if (signup) {
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

      var { data: { user }, userError } = await supabase.auth.getUser()

      console.log(user)

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


async function updateUsename(username) {
  const { error } = await supabase
    .from('profiles')
    .insert({ username: username })
  if (error) {
    console.log(error.message)
    return false
  }
  return true
}*/
