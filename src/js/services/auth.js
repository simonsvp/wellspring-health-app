import {supabase} from './supabase.js';
import {isDemoMode} from '../config.js';
const demoKey='wellspring-demo-user';
export async function currentUser(){if(isDemoMode)return JSON.parse(localStorage.getItem(demoKey)||'null');const{data}=await supabase.auth.getUser();return data.user}
export async function signIn(email,password){if(isDemoMode){const user={id:'demo-user',email,user_metadata:{full_name:'Demo Explorer'},role:email.startsWith('admin')?'admin':'user'};localStorage.setItem(demoKey,JSON.stringify(user));return user}const{data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;return data.user}
export async function signUp(name,email,password){if(isDemoMode){const user={id:'demo-user',email,user_metadata:{full_name:name},role:'user'};localStorage.setItem(demoKey,JSON.stringify(user));return user}const{data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)throw error;return data.user}
export async function signOut(){if(isDemoMode)localStorage.removeItem(demoKey);else await supabase.auth.signOut()}
