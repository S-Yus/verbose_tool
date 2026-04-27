import { useEffect, useRef, useState } from 'react'
import Robot from './Robot'

const LEVEL_LABELS: Record<number, string> = {
  1: 'やや丁寧',
  2: '回りくどい',
  3: '補足多め',
  4: 'かなり冗長',
  5: '政治家',
  6: '学術論文',
  7: '哲学',
  8: '宇宙',
  9: '資源の無駄',
  10: '存在論的',
}

const getSpeed = (level: number) => {
  if (level <= 3) return 50
  if (level <= 6) return 25
  return 8
}

export default function App() {
  const [input, setInput] = useState('')
  const [level, setLevel] = useState(5)
  const [displayedText, setDisplayedText] = useState('')
  const [talking, setTalking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const queueRef = useRef<string[]>([])
  const intervalRef = useRef<number | null>(null)
  const streamDoneRef = useRef(false)

  const startTypewriter = (speed: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => {
      if (queueRef.current.length > 0) {
        const char = queueRef.current.shift()!
        setDisplayedText(prev => prev + char)
      } else if (streamDoneRef.current) {
        clearInterval(intervalRef.current!)
        setTalking(false)
      }
    }, speed)
  }

  const handleSubmit = async () => {
    if (!input.trim()) return
    setLoading(true)
    setTalking(true)
    setDisplayedText('')
    setError('')
    queueRef.current = []
    streamDoneRef.current = false

    const speed = getSpeed(level)
    startTypewriter(speed)

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/api/verbose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, level }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.detail ?? 'エラーが発生しました。')
        setTalking(false)
        setLoading(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') {
            streamDoneRef.current = true
            break
          }
          try {
            const { text } = JSON.parse(data)
            queueRef.current.push(...text.split(''))
          } catch {}
        }
      }
      streamDoneRef.current = true
    } catch {
      setError('エラーが発生しました。')
      setTalking(false)
      if (intervalRef.current) clearInterval(intervalRef.current)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <div className="container">
      <h1 className="title">冗長くん</h1>
      <p className="subtitle">短い文章を無駄に長くします</p>

      <div className="robot-area">
        <Robot talking={talking} />
        {(displayedText || error) && (
          <div className="speech-bubble">
            {error ? (
              <p className="result-text error-text">{error}</p>
            ) : (
              <>
                <p className="result-text">{displayedText}</p>
                {!talking && displayedText && (
                  <button className="copy-button" onClick={handleCopy}>
                    {copied ? 'コピーしました！' : 'コピー'}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

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
        disabled={loading || talking}
      >
        {loading || talking ? '冗長化中...' : '冗長にする'}
      </button>
    </div>
  )
}
