import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const date = '2026-02-10'
const payload = {
  logs: ['[18:00] (20min) eee'],
  diary: { 事実: 'e', 発見: 'a', 教訓: 'd', 宣言: 'a', 悩み: 'c' }
}

const main = async () => {
  // date を unique にしてる前提：同じ日付は上書きしたいので upsert
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert({ date, payload }, { onConflict: 'date' })
    .select()

  if (error) {
    console.error('ERROR:', error)
    process.exit(1)
  }
  console.log('OK:', data)
}

main()
