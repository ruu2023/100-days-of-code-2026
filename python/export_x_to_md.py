import asyncio
from twikit import Client
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

# --- 設定項目 ---
USERNAME = os.getenv('X_USERNAME')
AUTH_TOKEN = os.getenv('X_AUTH_TOKEN')
CT0 = os.getenv('X_CT0')
DAYS_LIMIT = 50
OUTPUT_FILE = 'my_tweets.md'

async def main():
    client = Client('en-US')
    
    # .envの情報からクッキーを設定
    client.set_cookies({
        'auth_token': AUTH_TOKEN,
        'ct0': CT0,
        '_sl': '1'
    })
    print("環境変数からログイン情報を設定しました。")
    
    # 2. 自分のユーザーIDを取得
    user = await client.get_user_by_screen_name(USERNAME)
    user_id = user.id
    
    # 3. 期限の設定（JSTベース）
    limit_date = datetime.now(timezone.utc) - timedelta(days=DAYS_LIMIT)
    
    print(f"{limit_date} 以降のポストを取得中...")
    
    all_tweets = []
    cursor = None

    # 4. ポストの取得ループ
    while True:
        tweets = await client.get_user_tweets(user_id, 'Tweets', count=20, cursor=cursor)
        if not tweets:
            break
            
        for tweet in tweets:
            # 文字列の日時をdatetimeオブジェクトに変換
            tweet_date = datetime.strptime(tweet.created_at, '%a %b %d %H:%M:%S +0000 %Y').replace(tzinfo=timezone.utc)
            
            if tweet_date < limit_date:
                goto_end = True
                break
            
            all_tweets.append({
                'date': tweet_date.astimezone(timezone(timedelta(hours=9))), # JSTに変換
                'text': tweet.full_text,
                'id': tweet.id
            })
        
        if 'goto_end' in locals() and goto_end:
            break
            
        cursor = tweets.next_cursor
        print(f"{len(all_tweets)}件 取得済み...")
        await asyncio.sleep(2) # 負荷軽減のための待機

    # 5. Markdownとして書き出し
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(f"# X Posts (Past {DAYS_LIMIT} days)\n\n")
        for t in all_tweets:
            f.write(f"## {t['date'].strftime('%Y-%m-%d %H:%M')}\n")
            f.write(f"{t['text']}\n\n")
            f.write(f"[Original Post](https://x.com/{USERNAME}/status/{t['id']})\n")
            f.write("---\n\n")

    print(f"完了！ {OUTPUT_FILE} に保存しました。")

if __name__ == '__main__':
    asyncio.run(main())