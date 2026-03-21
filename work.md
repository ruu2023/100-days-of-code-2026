posts.json の最新の投稿内容を元に、以下のファイル内へ追記をお願いします。

- README.md

---

```bash
gcloud run deploy hono-next-app --source . --region asia-northeast1
```

```bash
npx wrangler tail hono-api
```

```bash
source .env
kamal deploy
```

ndlocr テスト

```bash

cd ndlocr-api
python main.py

curl -X POST -F "file=@image.jpeg" http://localhost:8080/ocr
```

ubuntu user setting

```bash
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

ログイン確認後
sudo vim /etc/ssh/sshd_config

```config:
PermitRootLogin no
PasswordAuthentication no
```

sudo systemctl restart ssh

sudo usermod -aG docker deploy
