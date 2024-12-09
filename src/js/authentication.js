import { supabase } from "./supabaseClient.js";

//this file is used for sign up, login and password reset so i need to check which is happening
const login = document.getElementById("login");
const signup = document.getElementById("signup");
const passwordReset = document.getElementById("password-reset");
const passwordForgot = document.getElementById("forgot-password");
const message = document.getElementById("message");

if (login){
  login.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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

      //there was an error with user creation
      if (error && error.code === "user_already_exists") {
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

      await CreateNewUser(username);
      window.location.href = "../login.html";

    } catch (err) {
      message.textContent = "Please make sure you entered a valid email adress."
      console.error(err)
    }

  })
}

if (passwordForget) {
  passwordReset.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;

    const {data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://gogogadgetgithub.github.io/portfolio/resetPassword.html'
    })

    if (error) {
      console.log(error.message)
    }
    else {
      console.log("no error email should have been sent")
    }
  })
}

if (passwordReset) {
  passwordReset.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = document.getElementById("password").value;
    const passwordConf = document.getElementById("password-conf").value;

    if (password !== passwordConf) {
      message.textContent = "Passwords don't match..."
      return
    }

    const {data, error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      console.log(error.message)
    }
    else {
      console.log("no error, passowrd should have been reset")
      window.location.href = "../login.html"
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
  message.innerContenr = ""
  const message = document.getElementById("message")
  const p = document.createElement("p")
  const a = document.createElement("a")
  p.textContent = "User already exists "
  a.textContent = "Login"
  a.href = "../login.html"
  message.appendChild(p)
  message.appendChild(a)
}
