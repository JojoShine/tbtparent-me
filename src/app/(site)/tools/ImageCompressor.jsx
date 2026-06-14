'use client'

import { useState, useRef } from 'react'
import { useLang } from '@/hooks/useLang'

export default function ImageCompressor() {
  const { lang } = useLang()
  const [originalFile, setOriginalFile] = useState(null)
  const [compressedFile, setCompressedFile] = useState(null)
  const [quality, setQuality] = useState(0.8) // 默认中档
  const [compressing, setCompressing] = useState(false)
  const canvasRef = useRef(null)

  const qualityOptions = [
    { value: 0.6, label: lang === 'zh' ? '低质量 (60%)' : 'Low (60%)' },
    { value: 0.8, label: lang === 'zh' ? '中质量 (80%)' : 'Medium (80%)' },
    { value: 0.95, label: lang === 'zh' ? '高质量 (95%)' : 'High (95%)' },
  ]

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert(lang === 'zh' ? '请选择图片文件' : 'Please select an image file')
      return
    }

    setOriginalFile(file)
    setCompressedFile(null)
  }

  const compressImage = async () => {
    if (!originalFile) return

    setCompressing(true)
    
    try {
      const img = new Image()
      const reader = new FileReader()
      
      reader.onload = (e) => {
        img.src = e.target.result
      }
      
      img.onload = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        // 设置画布尺寸
        canvas.width = img.width
        canvas.height = img.height
        
        // 绘制图片
        ctx.drawImage(img, 0, 0)
        
        // 压缩并转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              setCompressedFile({
                blob,
                url,
                size: blob.size,
              })
            }
            setCompressing(false)
          },
          'image/jpeg',
          quality
        )
      }
      
      reader.readAsDataURL(originalFile)
    } catch (error) {
      console.error('Compression error:', error)
      setCompressing(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const downloadCompressed = () => {
    if (!compressedFile) return
    
    const link = document.createElement('a')
    link.href = compressedFile.url
    link.download = `compressed_${originalFile.name.replace(/\.[^/.]+$/, '')}.jpg`
    link.click()
  }

  const reset = () => {
    setOriginalFile(null)
    setCompressedFile(null)
    setQuality(0.8)
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '20px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? '图片压缩' : 'Image Compressor'}
      </h3>

      {/* 文件上传 */}
      {!originalFile && (
        <div
          style={{
            border: '2px dashed var(--border)',
            borderRadius: '4px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease',
          }}
          onClick={() => document.getElementById('file-input').click()}
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
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* 已选择文件 */}
      {originalFile && (
        <div>
          {/* 原图信息 */}
          <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <p className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.85rem', marginBottom: '4px' }}>
              <strong>{lang === 'zh' ? '原图：' : 'Original: '}</strong>
              {originalFile.name}
            </p>
            <p className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
              {lang === 'zh' ? '大小：' : 'Size: '}{formatFileSize(originalFile.size)}
            </p>
          </div>

          {/* 质量选择 */}
          <div style={{ marginBottom: '16px' }}>
            <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
              {lang === 'zh' ? '压缩质量：' : 'Compression Quality:'}
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {qualityOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setQuality(option.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: quality === option.value ? 'var(--fg)' : 'transparent',
                    color: quality === option.value ? 'var(--bg)' : 'var(--muted)',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 压缩按钮 */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            <button
              onClick={compressImage}
              disabled={compressing}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: compressing ? 'var(--muted)' : 'var(--fg)',
                color: compressing ? 'var(--bg)' : 'var(--bg)',
                border: 'none',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                cursor: compressing ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s ease',
              }}
            >
              {compressing ? (lang === 'zh' ? '压缩中...' : 'Compressing...') : (lang === 'zh' ? '开始压缩' : 'Compress')}
            </button>
            <button
              onClick={reset}
              style={{
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--fg)'
                e.currentTarget.style.color = 'var(--fg)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--muted)'
              }}
            >
              {lang === 'zh' ? '重置' : 'Reset'}
            </button>
          </div>

          {/* 压缩结果 */}
          {compressedFile && (
            <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <p className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.85rem', marginBottom: '6px' }}>
                <strong>{lang === 'zh' ? '压缩后：' : 'Compressed: '}</strong>
              </p>
              <p className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '10px' }}>
                {lang === 'zh' ? '大小：' : 'Size: '}{formatFileSize(compressedFile.size)}
                {' '}
                <span style={{ color: '#38a169' }}>
                  ({((1 - compressedFile.size / originalFile.size) * 100).toFixed(1)}% {lang === 'zh' ? '减小' : 'reduced'})
                </span>
              </p>
              
              {/* 预览 */}
              <div style={{ marginBottom: '10px' }}>
                <img
                  src={compressedFile.url}
                  alt="Compressed preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                />
              </div>

              {/* 下载按钮 */}
              <button
                onClick={downloadCompressed}
                style={{
                  width: '100%',
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
                {lang === 'zh' ? '下载压缩图片' : 'Download Compressed Image'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 隐藏的 Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
