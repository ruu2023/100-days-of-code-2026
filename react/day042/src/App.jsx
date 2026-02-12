import React, { useState, useEffect } from 'react';

function NoteList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    setIsPosting(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: "hello from react!" }),
      });

      if (response.ok) {
        // 投稿成功したら、最新のリストを再取得（またはリロード）
        alert("投稿成功！");
        window.location.reload(); 
      }
    } catch (err) {
      alert("投稿失敗...");
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    // 同じドメインなので相対パスでOKです
    fetch('/api/notes')
      .then(response => {
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        return response.json();
      })
      .then(data => {
        setNotes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  const noteList = notes?.notes || [];

  return (
    <div>
      <h2>ノート一覧</h2>
      <div>
        <button onClick={handlePost} disabled={isPosting}>
          {isPosting ? '送信中...' : 'テスト投稿する'}
        </button>
        {/* ... 既存のリスト表示 ... */}
      </div>
      <ul>
        {noteList.map((note, index) => (
          <li key={index}>
            {note.body}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NoteList;