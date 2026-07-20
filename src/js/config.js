export const config={supabaseUrl:import.meta.env.VITE_SUPABASE_URL,supabaseKey:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY};
export const isDemoMode=!config.supabaseUrl||!config.supabaseKey;
