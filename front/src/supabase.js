import { createClient } from '@supabase/supabase-js'

// Substitua pelos seus dados reais do Supabase (Project Settings > API)
const supabaseUrl = 'https://pytnkwlnvcwwvaadvjqn.supabase.co' 
const supabaseKey = 'sb_publishable_fdaD1OvtomjxY-Q3fB_FPg_VeZISBgR'

export const supabase = createClient(supabaseUrl, supabaseKey)