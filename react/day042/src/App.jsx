import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useState } from 'react';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]); // ノート一覧を管理
  const [user, setUser] = useState(null); // ログインユーザー情報を管理

  const fetchNotes = async (userId) => {
    const response = await fetch('/api/get-notes', {
      headers: { 'X-User-Id': userId }
    });
    const data = await response.json();
    setNotes(data);
  };

  const saveNote = async () => {
    if (!user) return alert("ログインしてください");

    const response = await fetch('/api/create-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.sub
      },
      body: JSON.stringify({ title, content })
    });

    if (response.ok) {
      alert("ノートを保存しました！");
      fetchNotes(user.sub); // 保存後に一覧を更新
    }
  };
  
  const onSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser(decoded); // ここでユーザー情報を state に保存！
    fetchNotes(decoded.sub); // ログイン成功時にノートを取得
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ padding: '20px' }}>
        <h2>Googleログインテスト</h2>
        <GoogleLogin
          onSuccess={onSuccess}
          onError={() => console.log('Login Failed')}
          useOneTap
        />

        {user && (
          <div style={{ marginTop: '20px' }}>
            <p>こんにちは、{user.name}さん</p>
            
            <div style={{ marginBottom: '20px' }}>
              <input 
                placeholder="タイトル" 
                value={title}
                onChange={(e) => setTitle(e.target.value)} 
              />
              <input 
                placeholder="内容" 
                value={content}
                onChange={(e) => setContent(e.target.value)} 
              />
              <button onClick={saveNote}>Save Note</button>
            </div>

            <h3>あなたのノート一覧</h3>
            <ul>
              {notes.map((note, index) => (
                <li key={index}>
                  <strong>{note.title}</strong>: {note.content}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;