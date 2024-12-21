import { createClient } from "@supabase/supabase-js";

//const supabaseUrl = 'https://jpxdwuzsxkcerplprlwv.supabase.co'
//const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweGR3dXpzeGtjZXJwbHBybHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MDQ4MTksImV4cCI6MjA0ODM4MDgxOX0.lFBWgHBURcsJ-niq0E5t4arJQdrDxQA_o2-uhZ6Q9r0'
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
export const supabase = createClient(supabaseUrl, supabaseKey);
