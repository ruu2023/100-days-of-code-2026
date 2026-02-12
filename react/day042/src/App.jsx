import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useState } from 'react';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  const [body, setBody] = useState(''); // サーバーの「body」に合わせました
  const [notes, setNotes] = useState([]); 
  const [user, setUser] = useState(null); 

  // ノート取得
  const fetchNotes = async (userId) => {
    try {
      const response = await fetch('/api/notes', { // エンドポイント名は適宜合わせてください
        headers: { 'X-User-Id': userId }
      });
      const data = await response.json();
      if (data.ok) {
        setNotes(data.notes); // data.notes の中に配列が入っている構成に合わせました
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // ノート保存
  const saveNote = async () => {
    if (!user) return alert("ログインしてください");
    if (!body.trim()) return alert("内容を入力してください");

    const response = await fetch('/api/notes', { // POST先
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.sub
      },
      body: JSON.stringify({ body: body }) // サーバーが待っているのは { body: "..." }
    });

    if (response.ok) {
      setBody(''); // 入力欄をクリア
      fetchNotes(user.sub); // 再読み込み
    }
  };
  
  const onSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser(decoded);
    fetchNotes(decoded.sub);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2>My Simple Notes</h2>
        
        {!user ? (
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => console.log('Login Failed')}
            useOneTap
          />
        ) : (
          <div>
            <p>ログイン中: {user.name} ({user.email})</p>
            
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
              <input 
                style={{ flex: 1, padding: '8px' }}
                placeholder="なにか書き残す..." 
                value={body}
                onChange={(e) => setBody(e.target.value)} 
              />
              <button onClick={saveNote} style={{ padding: '8px 16px' }}>保存</button>
            </div>

            <hr />

            <h3>過去のメモ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notes.length === 0 && <p>メモがありません。</p>}
              {notes.map((note) => (
                <div key={note.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{note.body}</div>
                  <small style={{ color: '#666' }}>{new Date(note.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;