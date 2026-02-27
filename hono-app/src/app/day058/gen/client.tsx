'use client'

import React, {ChangeEvent, useState} from 'react'
import { generateImage, refineSketch } from './actions'

const Client = () => {
  const [image, setImage] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false);
  const [sketch, setSketch] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("プロのイラストレーターが描いたようなファンタジー風のイラストにして");

  const handleGenerate = async () => {
    try{
      setLoading(true)
      const image = await generateImage("Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme") as string
      setImage(image);
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSketch(prev => [...prev || [], reader.result as string]);
      };
      reader.readAsDataURL(file);
    })
  }

  const handleRefine = async () => {
    if(sketch.length === 0) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("prompt", prompt);
    sketch.forEach(sketch => formData.append("sketch", sketch))
    try {
      const result = await refineSketch(formData) as string;
      setImage(result);
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* <button onClick={handleGenerate} disabled={loading}>Generate Image</button> */}
      {loading && <p>Loading...</p>}
      {image && <img src={image} alt="Generated Image" />}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />
      <textarea name="" id="" value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
      <button onClick={handleRefine} disabled={loading || !sketch}>{loading ? 'AIが書き込み中...' : 'ラフ画を清書する'}</button>
      </div>

      {/* 画像の比較 */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sketch.map((sketch, index) => (
          <img style={{ width: '300px', height: 'auto' }} key={index} src={sketch} alt={`Sketch ${index}`} />
        ))}
        {image && <img style={{ width: '300px', height: 'auto' }} src={image} alt="Generated Image" />}
      </div>
    </div>
  )
}

export default Client