import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from 'react';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('google_token')); // 初期値に保存済みトークンを入れる

  // ログイン成功時の共通処理
  const handleLoginSuccess = (credential) => {
    localStorage.setItem('google_token', credential); // ローカルに保存
    setToken(credential);
    const decoded = jwtDecode(credential);
    setUser(decoded);
    fetchNotes(credential); // トークンを渡して取得
  };

  // 起動時にトークンがあれば自動でデータを取る
  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      // 有効期限切れチェック（簡易版）
      if (decoded.exp * 1000 > Date.now()) {
        setUser(decoded);
        fetchNotes(token);
      } else {
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('google_token');
    setUser(null);
    setToken(null);
    setNotes([]);
  };

  const fetchNotes = async (activeToken) => {
    const response = await fetch('/api/notes', {
      headers: { 'Authorization': `Bearer ${activeToken}` } // IDではなくトークンを送る
    });
    const data = await response.json();
    if (data.ok) setNotes(data.notes);
  };

  const saveNote = async () => {
    if (!token) return;
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ body })
    });
    if (response.ok) {
      setBody('');
      fetchNotes(token);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ padding: '20px' }}>
        {!user ? (
          <GoogleLogin 
            onSuccess={(res) => handleLoginSuccess(res.credential)} 
            useOneTap 
          />
        ) : (
          <div>
            <button onClick={handleLogout}>ログアウト</button>
            <p>こんにちは、{user.name}さん</p>
            <input value={body} onChange={(e) => setBody(e.target.value)} />
            <button onClick={saveNote}>保存</button>
            {/* ...ノート一覧の表示... */}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}