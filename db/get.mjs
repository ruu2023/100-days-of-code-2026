import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const main = async () => {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('date,payload,created_at')
    .eq('date', '2026-02-10')
    .single()

  if (error) {
    console.error('ERROR:', error)
    process.exit(1)
  }
  console.log(JSON.stringify(data, null, 2))
}

main()
