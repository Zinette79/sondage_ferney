// supabase project configuration parameters
const SUPABASE_URL = 'https://slduhnwpugxsrloamlwl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iICTGZzTKQxvdGuq2hzaJw_KIbwCcvG';

// initialize supabase client instance
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);