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
const signup = document.getElementById("signup");
const message = document.getElementById("message");
const button = document.getElementById("submit");
const loader = document.getElementById("loader");

function toggleLoading(button, loader) {
  loader.classList.toggle("hide");
  button.classList.toggle("hide");
}

if (login) {
  login.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;

    toggleLoading(button, loader);

    //TODO: check if user exists using email and profiles tabel

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://gogogadgetgithub.github.io/portfolio",
      },
    });

    toggleLoading(button, loader);

    if (error) {
      message.textContent = error.message;
    } else {
      //window.location.href = "./index.html";
      document.getElementById("submit").classList.add("hide");
      message.textContent =
        "Check your email and click the link to login. \n You can close this tab.";
    }
  });
}

if (signup) {
  document.getElementById("signup").addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      toggleLoading(button, loader);

      const email = document.getElementById("email").value;
      const username = document.getElementById("username").value;

      try {
        //this will create a user if one does not exist
        const { data: magicData, error: magicError } = await supabase.auth
          .signInWithOtp({
            email,
            options: {
              emailRedirectTo: "https://gogogadgetgithub.github.io/portfolio",
            },
          });

        //there was an error with user login/signup
        if (magicError) {
          message.textContent = magicError.message;
          toggleLoading(button, loader);
          return;
        }

        //the rest of the code needs to run server side because it needs to
        //have access to the service role so this is where i hand off to the
        //edge functions
        const { data: edgeData, error: edgeError } = await supabase.functions
          .invoke("new-user", {
            body: { username, email },
          });

        if (edgeError) {
          console.error(
            `error invoking new user edge functions: ${edgeError.message}`,
          );
        }
      } catch (err) {
        message.textContent = "some big bad scary error";
        console.error(err);
      }

      toggleLoading(button, loader);
    },
  );
}
