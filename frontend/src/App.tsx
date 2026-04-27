import { useState } from 'react'

const LEVEL_LABELS: Record<number, string> = {
  1: 'やや丁寧',
  2: '回りくどい',
  3: '補足多め',
  4: 'かなり冗長',
  5: '冗長くん',
  6: '学術論文',
  7: '哲学',
  8: '宇宙',
  9: '資源の無駄',
  10: '存在論的',
}

export default function App() {
  const [input, setInput] = useState('')
  const [level, setLevel] = useState(5)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) return
    setLoading(true)
    setResult('')
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/api/verbose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, level }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult(data.detail ?? 'エラーが発生しました。')
      } else {
        setResult(data.result)
      }
    } catch {
      setResult('エラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container">
      <h1 className="title">冗長くん</h1>
      <p className="subtitle">短い文章を無駄に長くします</p>

      <div style={{ position: 'relative' }}>
        <textarea
          className="textarea"
          placeholder="冗長にしたい文章を入力..."
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={4}
          maxLength={500}
        />
        <span style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 12, color: input.length >= 500 ? '#e55' : '#aaa' }}>
          {input.length} / 500
        </span>
      </div>

      <div className="slider-row">
        <span className="slider-label">冗長レベル</span>
        <input
          type="range"
          min={1}
          max={10}
          value={level}
          onChange={e => setLevel(Number(e.target.value))}
          className="slider"
        />
        <span className="level-badge">
          {level} / 10 — {LEVEL_LABELS[level]}
        </span>
      </div>

      <button
        className="button"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '冗長化中...' : '冗長にする'}
      </button>

      {result && (
        <div className="result-box">
          <div className="result-header">
            <span className="result-label">結果</span>
            <button className="copy-button" onClick={handleCopy}>
              {copied ? 'コピーしました！' : 'コピー'}
            </button>
          </div>
          <p className="result-text">{result}</p>
        </div>
      )}
    </div>
  )
}
