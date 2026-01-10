const SUPABASE_URL = 'https://fnxfsvljeqnnuwdrxwje.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IOCSSL9x3pSKVdqKyKTD-Q_jOk_eOga';

window.supabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
