'use client';
import React, { useEffect, useState } from 'react'
// import { getCloudflareContext } from "@opennextjs/cloudflare";
// const { env } = getCloudflareContext();

interface Post {
  id: number;
  title: string;
  content: string;
}

const client = () => {

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/api/v1')
      .then(res => res.json())
      .then(data => setPosts(data as Post[]));
  }, []);
  const onSubmit = async () => {
    const title = (document.querySelector('#title') as HTMLInputElement).value;
    const content = (document.querySelector('#content') as HTMLInputElement).value;
    fetch('/api/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    })
      .then(res => res.json())
      .then(data => setPosts((prev:Post[]) => [...prev, data as Post]));
  }
  return (
    <div>	
      {posts?.map((post:Post) => (
        <div key={post.id} style={{ margin: '1rem' }}>
          <h2>TITLE: {post.title}</h2>
          <p>CONTENT: {post.content}</p>
        </div>
      ))}
      <input type="text" id="title" style={{ margin: '1rem', backgroundColor: 'white', color: 'black' }} />
      <input type="text" id="content" style={{ margin: '1rem', backgroundColor: 'white', color: 'black' }} />
      <button onClick={onSubmit}>Submit</button>  
    </div>
  )
}

export default client