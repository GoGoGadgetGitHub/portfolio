import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jpxdwuzsxkcerplprlwv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweGR3dXpzeGtjZXJwbHBybHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MDQ4MTksImV4cCI6MjA0ODM4MDgxOX0.lFBWgHBURcsJ-niq0E5t4arJQdrDxQA_o2-uhZ6Q9r0' 
const supabase = createClient(supabaseUrl, supabaseKey)
 
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

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        message.textContent = error.message;
        console.log(error.message)
      } else {
        console.log(data); // Handle user data
      }
      } catch (err) {
        console.log("big ol bad error")
        console.error(err);
      }

  })
}  