import { createClient } from '@supabase/supabase-js';

// Pastikan diawali dengan https:// dan diakhiri .supabase.co
const supabaseUrl = 'https://gfronddhdlsvrizkjrhj.supabase.co'; 

// Anon key adalah string acak yang cukup panjang
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmcm9uZGRoZGxzdnJpemtqcmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MjAyNjcsImV4cCI6MjEwNDQ5NjI2N30.RRNo-M981QXZG370_Lp7R45keop6taG8CLNEOFAXYAM'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);