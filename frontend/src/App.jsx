import { useState } from 'react'

export default function App() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [mediaAnalyzed, setMediaAnalyzed] = useState(false)
  const [activeTab, setActiveTab] = useState('linkedin')

  const handleMediaSelect = (file) => {
    if (!file) return
    setMediaFile(file)
    const ext = file.name.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      setMediaPreview({ type: 'image', url: URL.createObjectURL(file), name: file.name })
    } else {
      setMediaPreview({ type: 'video', name: file.name })
    }
  }

  const handleClearMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
  }

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    setPosts(null)
    setMediaAnalyzed(false)

    try {
      const formData = new FormData()
      formData.append('topic', topic)
      if (mediaFile) formData.append('file', mediaFile)

      const response = await fetch('http://127.0.0.1:5000/generate', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (response.ok) {
        setPosts(data.posts)
        setMediaAnalyzed(data.media_analyzed)
        setActiveTab('linkedin')
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, platform) => {
    navigator.clipboard.writeText(text)
    setCopied(platform)
    setTimeout(() => setCopied(''), 2000)
  }

  const platforms = [
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#f472b6' },
    { key: 'twitter', label: 'Twitter / X', icon: '𝕏', color: '#c084fc' },
    { key: 'instagram', label: 'Instagram', icon: '◈', color: '#e879f9' },
  ]

  return (
    <div style={s.root}>
      {/* Noise texture overlay */}
      <div style={s.noise} />

      {/* Mesh gradient blobs */}
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.blob3} />

      <div style={s.layout}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={s.sidebar}>

          {/* Brand mark */}
          <div style={s.brand}>
            <p style={s.builtBy}>Built by a Python Developer & AI/ML Engineer</p>
            <a href="https://www.linkedin.com/in/jam-ehtisham-qadir-aaa691243" target="_blank" rel="noreferrer" style={s.authorChip}>
              <span style={s.authorDot} />
              Jam Ehtisham Qadir
            </a>
          </div>

          <div style={s.sidebarInner}>
            <p style={s.eyebrow}>AI Social Media Agent</p>
            <h1 style={s.heading}>
              Craft posts<br />
              <em style={s.headingEm}>that convert.</em>
            </h1>
            <p style={s.desc}>
              Drop a topic, attach media — the agent researches the web and writes platform-perfect content in seconds.
            </p>

            <div style={s.dividerLine} />

            {/* Topic input */}
            <label style={s.label}>Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. Electric vehicles, AI in healthcare…"
              style={s.input}
            />

            {/* Media upload */}
            <label style={s.label}>
              Media <span style={s.labelSub}>optional</span>
            </label>

            {!mediaPreview ? (
              <>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.avi,.mkv"
                  onChange={(e) => handleMediaSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="media-upload"
                />
                <label htmlFor="media-upload" style={s.uploadZone}>
                  <span style={s.uploadIcon}>⊕</span>
                  <span>Attach image or video</span>
                </label>
              </>
            ) : (
              <div style={s.previewWrap}>
                {mediaPreview.type === 'image'
                  ? <img src={mediaPreview.url} alt="preview" style={s.imgPreview} />
                  : <div style={s.videoChip}>🎬 {mediaPreview.name}</div>
                }
                <button onClick={handleClearMedia} style={s.removeBtn}>✕ Remove</button>
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              style={{ ...s.generateBtn, ...(loading || !topic.trim() ? s.generateBtnOff : {}) }}
            >
              {loading
                ? <><span style={s.spin} /> {mediaFile ? 'Analyzing & writing…' : 'Researching & writing…'}</>
                : <><span style={s.btnStar}>✦</span> Generate Posts</>
              }
            </button>

            {error && <div style={s.errorBox}>⚠ {error}</div>}

          </div>

          {/* Footer */}
          <p style={s.sideFooter}>
            GPT-4o · Serper · Vision API
          </p>
        </aside>

        {/* ── RIGHT CONTENT ── */}
        <main style={s.main}>

          {!posts && !loading && (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>✦</div>
              <p style={s.emptyTitle}>Your posts will appear here</p>
              <p style={s.emptyDesc}>Enter a topic on the left and hit Generate Posts to get started.</p>
            </div>
          )}

          {loading && (
            <div style={s.loadingState}>
              {[
                '🔍 Searching the web for latest data…',
                mediaFile ? '🖼 Analyzing your media with GPT-4o Vision…' : null,
                '✍ Crafting platform-specific posts…',
                '✦ Finalizing and formatting…',
              ].filter(Boolean).map((step, i) => (
                <div key={i} style={{ ...s.loadStep, animationDelay: `${i * 0.3}s` }}>{step}</div>
              ))}
            </div>
          )}

          {posts && (
            <>
              {mediaAnalyzed && (
                <div style={s.mediaBadge}>
                  ✦ Media context included in all posts
                </div>
              )}

              {/* Tab bar */}
              <div style={s.tabBar}>
                {platforms.map(p => (
                  <button
                    key={p.key}
                    onClick={() => setActiveTab(p.key)}
                    style={{
                      ...s.tab,
                      ...(activeTab === p.key ? { ...s.tabActive, borderColor: p.color, color: p.color } : {}),
                    }}
                  >
                    <span>{p.icon}</span> {p.label}
                  </button>
                ))}
              </div>

              {/* Active post */}
              {platforms.map(p => activeTab === p.key && (
                <div key={p.key} style={s.postCard}>
                  <div style={s.postTopBar}>
                    <div style={{ ...s.platformPill, background: p.color + '22', color: p.color, borderColor: p.color + '55' }}>
                      {p.icon} {p.label}
                    </div>
                    <div style={s.postMeta}>
                      <span style={s.charBadge}>{posts[p.key].length} chars</span>
                      <button
                        onClick={() => handleCopy(posts[p.key], p.key)}
                        style={{ ...s.copyBtn, ...(copied === p.key ? s.copyBtnDone : {}) }}
                      >
                        {copied === p.key ? '✓ Copied' : '⎘ Copy'}
                      </button>
                    </div>
                  </div>

                  <div style={s.postDivider} />

                  <p style={s.postBody}>{posts[p.key]}</p>
                </div>
              ))}

              {/* Quick nav dots */}
              <div style={s.dotNav}>
                {platforms.map(p => (
                  <button
                    key={p.key}
                    onClick={() => setActiveTab(p.key)}
                    style={{
                      ...s.dot,
                      ...(activeTab === p.key ? { background: p.color, width: '24px' } : {}),
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0a14; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        input::placeholder { color: #3d3450; }
        input:focus { border-color: rgba(244,114,182,0.4) !important; box-shadow: 0 0 0 3px rgba(244,114,182,0.08) !important; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(244,114,182,0.3); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(244,114,182,0.6); }
      `}</style>
    </div>
  )
}

const s = {
  root: {
    minHeight: '100vh',
    background: '#0d0a14',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  noise: {
    position: 'fixed', inset: 0, zIndex: 0,
    opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '128px 128px',
    pointerEvents: 'none',
  },
  blob1: {
    position: 'fixed', top: '-200px', left: '-100px',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 65%)',
    pointerEvents: 'none', zIndex: 0,
  },
  blob2: {
    position: 'fixed', bottom: '-150px', right: '20%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 65%)',
    pointerEvents: 'none', zIndex: 0,
  },
  blob3: {
    position: 'fixed', top: '40%', right: '-100px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(232,121,249,0.08) 0%, transparent 65%)',
    pointerEvents: 'none', zIndex: 0,
  },
  layout: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative', zIndex: 1,
  },

  // ── SIDEBAR ──
  sidebar: {
    width: '380px',
    flexShrink: 0,
    borderRight: '1px solid rgba(244,114,182,0.1)',
    background: 'rgba(15,10,22,0.8)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    height: '100vh',
    overflow: 'hidden',
  },
  brand: {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '24px 32px 0',
  gap: '12px',
  },
  brandIcon: {
    width: '32px', height: '32px',
    background: 'linear-gradient(135deg, #f472b6, #c084fc)',
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', color: '#fff', fontWeight: '700',
  },
  brandText: {
    color: '#e2d5f0',
    fontSize: '15px', fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  sidebarInner: {
    padding: '24px 32px',
    flex: 1,
    overflow: 'hidden',
  },
  eyebrow: {
    color: '#f472b6',
    fontSize: '10px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '12px',
  },
  heading: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '42px',
    fontWeight: '400',
    color: '#f0e8ff',
    lineHeight: 1.1,
    marginBottom: '16px',
    letterSpacing: '-0.02em',
  },
  headingEm: {
    fontStyle: 'italic',
    background: 'linear-gradient(135deg, #f472b6, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  desc: {
    color: '#6b5a80',
    fontSize: '14px',
    lineHeight: 1.7,
    marginBottom: '20px',
  },
  authorChip: {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '6px 14px',
  borderRadius: '999px',
  border: '1px solid rgba(244,114,182,0.2)',
  background: 'rgba(244,114,182,0.06)',
  color: '#c084fc',
  fontSize: '12px', fontWeight: '600',
  textDecoration: 'none',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  },
  builtBy: {
  color: '#7c6a90',
  fontSize: '11px',
  letterSpacing: '0.06em',
  fontWeight: '500',
  lineHeight: 1.5,
  flexShrink: 1,
  },
  authorDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#f472b6',
    boxShadow: '0 0 6px #f472b6',
  },
  dividerLine: {
    height: '1px',
    background: 'linear-gradient(90deg, rgba(244,114,182,0.2), transparent)',
    marginBottom: '28px',
  },
  label: {
    display: 'block',
    color: '#7c6a90',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '8px',
  },
  labelSub: {
    color: '#4a3d5a',
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: '400',
    fontSize: '10px',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    color: '#e2d5f0',
    fontSize: '14px',
    padding: '12px 14px',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: '24px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  uploadZone: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px dashed rgba(244,114,182,0.25)',
    background: 'rgba(244,114,182,0.04)',
    color: '#9d6fb0',
    fontSize: '13px', fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '24px',
  },
  uploadIcon: {
    fontSize: '18px', color: '#f472b6',
  },
  previewWrap: {
    marginBottom: '24px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(244,114,182,0.2)',
    position: 'relative',
  },
  imgPreview: {
    width: '100%', maxHeight: '140px',
    objectFit: 'cover', display: 'block',
  },
  videoChip: {
    padding: '12px 16px',
    background: 'rgba(244,114,182,0.06)',
    color: '#c084fc', fontSize: '13px',
  },
  removeBtn: {
    display: 'block', width: '100%',
    padding: '8px',
    background: 'rgba(244,114,182,0.08)',
    border: 'none',
    color: '#f472b6',
    fontSize: '12px', fontWeight: '600',
    cursor: 'pointer',
  },
  generateBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #f472b6, #c084fc)',
    color: '#fff',
    fontSize: '14px', fontWeight: '700',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    letterSpacing: '0.02em',
    boxShadow: '0 4px 24px rgba(244,114,182,0.3)',
    transition: 'opacity 0.2s, box-shadow 0.2s',
    marginBottom: '16px',
  },
  generateBtnOff: {
    opacity: 0.35, cursor: 'not-allowed',
    boxShadow: 'none',
  },
  btnStar: { fontSize: '12px' },
  spin: {
    display: 'inline-block',
    width: '13px', height: '13px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  errorBox: {
    padding: '12px 14px',
    borderRadius: '10px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#fca5a5',
    fontSize: '13px',
  },
  sideFooter: {
    padding: '20px 32px',
    color: '#3d3050',
    fontSize: '11px',
    letterSpacing: '0.06em',
    borderTop: '1px solid rgba(255,255,255,0.04)',
  },

  // ── MAIN ──
  main: {
    flex: 1,
    padding: '40px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100vh',
    overflow: 'hidden',
  },
  emptyState: {
    textAlign: 'center',
    margin: 'auto',
  },
  emptyIcon: {
    fontSize: '48px',
    background: 'linear-gradient(135deg, #f472b6, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '20px',
    animation: 'pulse 3s ease-in-out infinite',
  },
  emptyTitle: {
    color: '#4a3d5a',
    fontSize: '20px', fontWeight: '600',
    marginBottom: '8px',
    fontFamily: "'Instrument Serif', serif",
  },
  emptyDesc: {
    color: '#3d3050',
    fontSize: '14px', lineHeight: 1.6,
    maxWidth: '320px', margin: '0 auto',
  },
  loadingState: {
    display: 'flex', flexDirection: 'column', gap: '16px',
    maxWidth: '420px', margin: 'auto',
  },
  loadStep: {
    color: '#7c6a90',
    fontSize: '14px',
    padding: '14px 18px',
    borderRadius: '10px',
    background: 'rgba(244,114,182,0.04)',
    border: '1px solid rgba(244,114,182,0.1)',
    animation: 'fadeUp 0.4s ease both',
  },
  mediaBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px',
    borderRadius: '999px',
    background: 'rgba(244,114,182,0.08)',
    border: '1px solid rgba(244,114,182,0.2)',
    color: '#f472b6',
    fontSize: '12px', fontWeight: '600',
    marginBottom: '24px',
  },
  tabBar: {
    display: 'flex', gap: '8px',
    marginBottom: '24px',
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 18px',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'transparent',
    color: '#4a3d5a',
    fontSize: '13px', fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'rgba(244,114,182,0.06)',
  },
  postCard: {
    background: 'rgba(20,14,30,0.8)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(244,114,182,0.12)',
    borderRadius: '16px',
    padding: '24px 28px',
    animation: 'fadeUp 0.3s ease both',
    boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 220px)',
  },
  postTopBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px',
  },
  platformPill: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '5px 14px',
    borderRadius: '999px',
    border: '1px solid',
    fontSize: '12px', fontWeight: '700',
    letterSpacing: '0.02em',
  },
  postMeta: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  charBadge: {
    color: '#4a3d5a',
    fontSize: '11px',
  },
  copyBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#7c6a90',
    fontSize: '12px', fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  copyBtnDone: {
    background: 'rgba(244,114,182,0.1)',
    borderColor: 'rgba(244,114,182,0.3)',
    color: '#f472b6',
  },
  postDivider: {
    height: '1px',
    background: 'rgba(244,114,182,0.08)',
    marginBottom: '20px',
  },
  postBody: {
    color: '#c4b0d8',
    fontSize: '15px',
    lineHeight: 1.85,
    whiteSpace: 'pre-wrap',
  },
  dotNav: {
    display: 'flex', alignItems: 'center', gap: '6px',
    marginTop: '20px',
  },
  dot: {
    height: '6px', width: '6px',
    borderRadius: '999px',
    background: '#2a1f35',
    border: 'none', cursor: 'pointer',
    transition: 'all 0.3s',
  },
}