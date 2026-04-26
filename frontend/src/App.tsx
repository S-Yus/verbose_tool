import { useState } from 'react'

const LEVEL_LABELS: Record<number, string> = {
  1: '少し丁寧',
  2: '回りくどい',
  3: '補足多め',
  4: 'かなり冗長',
  5: '官僚的',
  6: '学術論文風',
  7: '哲学的',
  8: '存在論的',
  9: '超冗長',
  10: '宇宙的',
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
      setResult(data.result)
    } catch {
      setResult('エラーが発生しました。バックエンドが起動しているか確認してください。')
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
    <div style={styles.container}>
      <h1 style={styles.title}>冗長ツール</h1>
      <p style={styles.subtitle}>短い文章を無駄に長くします</p>

      <textarea
        style={styles.textarea}
        placeholder="冗長にしたい文章を入力..."
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={4}
      />

      <div style={styles.sliderRow}>
        <span style={styles.sliderLabel}>冗長レベル</span>
        <input
          type="range"
          min={1}
          max={10}
          value={level}
          onChange={e => setLevel(Number(e.target.value))}
          style={styles.slider}
        />
        <span style={styles.levelBadge}>
          {level} / 10 — {LEVEL_LABELS[level]}
        </span>
      </div>

      <button
        style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '冗長化中...' : '冗長にする'}
      </button>

      {result && (
        <div style={styles.resultBox}>
          <div style={styles.resultHeader}>
            <span style={styles.resultLabel}>結果</span>
            <button style={styles.copyButton} onClick={handleCopy}>
              {copied ? 'コピーしました！' : 'コピー'}
            </button>
          </div>
          <p style={styles.resultText}>{result}</p>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#fff',
    borderRadius: 16,
    padding: '40px',
    width: '100%',
    maxWidth: 680,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: -12,
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: '1.5px solid #e0e0e0',
    fontSize: 15,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    color: '#444',
  },
  slider: {
    flex: 1,
    accentColor: '#6366f1',
  },
  levelBadge: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  button: {
    padding: '12px 0',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  resultBox: {
    background: '#f8f8ff',
    border: '1.5px solid #e0e0f0',
    borderRadius: 10,
    padding: '16px',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultLabel: {
    fontWeight: 600,
    fontSize: 13,
    color: '#6366f1',
  },
  copyButton: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid #6366f1',
    background: 'transparent',
    color: '#6366f1',
    cursor: 'pointer',
  },
  resultText: {
    fontSize: 15,
    lineHeight: 1.7,
    color: '#333',
    whiteSpace: 'pre-wrap',
  },
}
