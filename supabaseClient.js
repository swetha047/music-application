import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://tbhsithmujyyhrivnysb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_M1v6w87Z_UVpqrONlUqrfQ_pRNaki8W';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
