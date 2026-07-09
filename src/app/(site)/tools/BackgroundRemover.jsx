'use client'

import { useState, useRef } from 'react'
import { useLang } from '@/hooks/useLang'

export default function BackgroundRemover() {
  const { lang } = useLang()
  const [originalImage, setOriginalImage] = useState(null)
  const [originalFile, setOriginalFile] = useState(null)
  const [resultBlob, setResultBlob] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [progressPct, setProgressPct] = useState(-1)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) {
      alert(lang === 'zh' ? '请选择图片文件' : 'Please select an image file')
      return
    }
    setOriginalFile(file)
    setResultBlob(null)
    setResultUrl(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setOriginalImage(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const removeBackground = async () => {
    if (!originalImage) return
    setProcessing(true)
    setProgress(lang === 'zh' ? '加载模型中...' : 'Loading model...')
    setProgressPct(0)

    try {
      // 使用 quint8 小模型（~2MB），模型文件托管在 staticimgly CDN
      const config = {
        model: 'isnet_quint8',
        publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
        progress: (key, current, total) => {
          if (total > 0 && key) {
            const pct = Math.round((current / total) * 100)
            setProgressPct(pct)
            if (key.includes('fetch') || key.includes('download')) {
              setProgress(lang === 'zh' ? `下载模型 ${pct}%` : `Downloading model ${pct}%`)
            } else if (key.includes('compute') || key.includes('inference')) {
              setProgress(lang === 'zh' ? `处理中 ${pct}%` : `Processing ${pct}%`)
            } else {
              setProgress(lang === 'zh' ? `加载中 ${pct}%` : `Loading ${pct}%`)
            }
          }
        }
      }

      const { removeBackground: removeBg } = await import('@imgly/background-removal')
      const blob = await removeBg(originalImage, config)

      setProgressPct(100)
      setProgress(lang === 'zh' ? '处理完成' : 'Done')

      const url = URL.createObjectURL(blob)
      setResultBlob(blob)
      setResultUrl(url)
      setProcessing(false)
      setProgress('')
      setProgressPct(-1)
    } catch (err) {
      console.error('Remove background error:', err)
      alert(lang === 'zh' ? `处理失败：${err.message}` : `Processing failed: ${err.message}`)
      setProcessing(false)
      setProgress('')
      setProgressPct(-1)
    }
  }

  const downloadResult = () => {
    if (!resultUrl || !originalFile) return
    const link = document.createElement('a')
    link.href = resultUrl
    const name = originalFile.name.replace(/\.[^/.]+$/, '')
    link.download = `${name}_no_bg.png`
    link.click()
  }

  const reset = () => {
    setOriginalImage(null)
    setOriginalFile(null)
    setResultBlob(null)
    setResultUrl(null)
    setProcessing(false)
    setProgress('')
    setProgressPct(-1)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? 'AI 抠图' : 'AI Background Remover'}
      </h3>
      <p className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '20px' }}>
        {lang === 'zh'
          ? '纯浏览器端处理，图片不会上传。使用轻量模型（~2MB），首次需下载，之后浏览器缓存'
          : 'Processed entirely in browser. Images never leave your device. Lightweight model (~2MB), cached after first use.'}
      </p>

      {/* 上传区域 */}
      {!originalImage && (
        <div
          style={{
            border: '2px dashed var(--border)',
            borderRadius: '4px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease',
          }}
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fg)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <p className="font-mono" style={{ color: 'var(--muted)', marginBottom: '12px' }}>
            {lang === 'zh' ? '点击或拖拽上传图片' : 'Click or drag to upload image'}
          </p>
          <p className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            {lang === 'zh' ? '支持 JPG、PNG、WebP 格式' : 'Supports JPG, PNG, WebP'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* 已上传图片 */}
      {originalImage && (
        <div>
          {/* 原图信息 */}
          <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <p className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.85rem', marginBottom: '4px' }}>
              <strong>{lang === 'zh' ? '原图：' : 'Original: '}</strong>
              {originalFile.name}
            </p>
            <p className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
              {lang === 'zh' ? '大小：' : 'Size: '}{formatSize(originalFile.size)}
            </p>
          </div>

          {/* 预览区域：原图 vs 结果 */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {/* 原图 */}
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '6px' }}>
                {lang === 'zh' ? '原图' : 'Original'}
              </div>
              <div style={{
                border: '1px solid var(--border)',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: 'var(--border)',
              }}>
                <img
                  src={originalImage}
                  alt="Original"
                  style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '300px' }}
                />
              </div>
            </div>

            {/* 结果 */}
            {resultUrl && (
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '6px' }}>
                  {lang === 'zh' ? '抠图结果' : 'Result'}
                  {resultBlob && (
                    <span style={{ marginLeft: '8px', color: '#38a169' }}>
                      {formatSize(resultBlob.size)}
                    </span>
                  )}
                </div>
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  backgroundImage: 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)',
                  backgroundSize: '16px 16px',
                }}>
                  <img
                    src={resultUrl}
                    alt="Result"
                    style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '300px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 处理进度 */}
          {processing && (
            <div style={{
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--fg)' }}>
                {progress}
              </div>
              {progressPct >= 0 && (
                <div style={{
                  marginTop: '8px',
                  height: '3px',
                  backgroundColor: 'var(--border)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${progressPct}%`,
                    height: '100%',
                    backgroundColor: 'var(--fg)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              )}
              <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '6px' }}>
                {lang === 'zh' ? '首次使用需下载轻量模型（~2MB），之后浏览器缓存加速' : 'First use downloads lightweight model (~2MB), then cached by browser'}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {!resultUrl && !processing && (
              <button
                onClick={removeBackground}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'var(--fg)',
                  color: 'var(--bg)',
                  border: 'none',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {lang === 'zh' ? '开始抠图' : 'Remove Background'}
              </button>
            )}
            {resultUrl && (
              <button
                onClick={downloadResult}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#38a169',
                  color: 'white',
                  border: 'none',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {lang === 'zh' ? '下载 PNG（透明背景）' : 'Download PNG (transparent)'}
              </button>
            )}
            <button
              onClick={reset}
              disabled={processing}
              style={{
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: processing ? 'var(--border)' : 'var(--muted)',
                border: '1px solid var(--border)',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                cursor: processing ? 'not-allowed' : 'pointer',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!processing) {
                  e.currentTarget.style.borderColor = 'var(--fg)'
                  e.currentTarget.style.color = 'var(--fg)'
                }
              }}
              onMouseLeave={e => {
                if (!processing) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--muted)'
                }
              }}
            >
              {lang === 'zh' ? '重置' : 'Reset'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
