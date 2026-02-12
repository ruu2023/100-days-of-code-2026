import React, { useState, useEffect } from 'react';

function NoteList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div>
      <h2>ノート一覧</h2>
      <ul>
        {notes.map((note, index) => (
          <li key={index}>
            {/* APIのレスポンス形式に合わせて調整してください */}
            {typeof note === 'string' ? note : JSON.stringify(note)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NoteList;