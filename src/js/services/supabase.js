import {createClient} from '@supabase/supabase-js';
import {config,isDemoMode} from '../config.js';
export const supabase=isDemoMode?null:createClient(config.supabaseUrl,config.supabaseKey);
