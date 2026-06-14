'use client'

import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { useLang } from '@/hooks/useLang'

export default function QRCodeGenerator() {
  const { lang } = useLang()
  const [content, setContent] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [expiryDays, setExpiryDays] = useState('')
  const [generating, setGenerating] = useState(false)
  const canvasRef = useRef(null)

  const handleLogoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert(lang === 'zh' ? '请选择图片文件' : 'Please select an image file')
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const generateQR = async () => {
    if (!content.trim()) {
      alert(lang === 'zh' ? '请输入内容' : 'Please enter content')
      return
    }

    setGenerating(true)

    try {
      // 处理有效期
      let finalContent = content.trim()
      if (expiryDays && parseInt(expiryDays) > 0) {
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays))
        finalContent += `\n\n${lang === 'zh' ? '有效期至' : 'Valid until'}: ${expiryDate.toLocaleDateString()}`
      }

      // 生成基础二维码
      const qrCanvas = document.createElement('canvas')
      await QRCode.toCanvas(qrCanvas, finalContent, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H' // 高容错率，支持中心logo
      })

      // 如果有logo，叠加到中心
      if (logoFile) {
        const ctx = qrCanvas.getContext('2d')
        const logoImg = new Image()
        
        logoImg.onload = () => {
          const logoSize = 80 // logo大小
          const x = (qrCanvas.width - logoSize) / 2
          const y = (qrCanvas.height - logoSize) / 2
          
          // 绘制白色背景
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8)
          
          // 绘制logo
          ctx.drawImage(logoImg, x, y, logoSize, logoSize)
          
          // 显示结果
          setQrDataUrl(qrCanvas.toDataURL())
          setGenerating(false)
        }
        
        logoImg.src = logoPreview
      } else {
        setQrDataUrl(qrCanvas.toDataURL())
        setGenerating(false)
      }
    } catch (error) {
      console.error('QR generation error:', error)
      alert(lang === 'zh' ? '生成失败，请重试' : 'Generation failed, please try again')
      setGenerating(false)
    }
  }

  const downloadQR = () => {
    if (!qrDataUrl) return
    
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `qrcode_${Date.now()}.png`
    link.click()
  }

  const reset = () => {
    setContent('')
    setQrDataUrl(null)
    setLogoFile(null)
    setLogoPreview(null)
    setExpiryDays('')
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '20px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? '二维码生成器' : 'QR Code Generator'}
      </h3>

      {/* 内容输入 */}
      <div style={{ marginBottom: '16px' }}>
        <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
          {lang === 'zh' ? '二维码内容：' : 'QR Code Content:'}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={lang === 'zh' ? '输入文本、网址等...' : 'Enter text, URL, etc...'}
          rows={3}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            backgroundColor: 'transparent',
            color: 'var(--fg)',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Logo上传 */}
      <div style={{ marginBottom: '16px' }}>
        <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
          {lang === 'zh' ? '中心Logo（可选）：' : 'Center Logo (optional):'}
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label
            className="file-upload-btn"
            style={{
              flex: 1,
              height: '40px',
              padding: '0 16px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              lineHeight: 'normal',
              backgroundColor: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--fg)'
              e.currentTarget.style.color = 'var(--fg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--muted)'
            }}
          >
            {logoFile ? logoFile.name : (lang === 'zh' ? '选择图片...' : 'Select image...')}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              style={{ display: 'none' }}
            />
          </label>
          {logoPreview && (
            <img
              src={logoPreview}
              alt="Logo preview"
              style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
            />
          )}
        </div>
      </div>

      {/* 有效期设置 */}
      <div style={{ marginBottom: '16px' }}>
        <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
          {lang === 'zh' ? '有效期（天数，可选）：' : 'Validity (days, optional):'}
        </label>
        <input
          type="number"
          value={expiryDays}
          onChange={(e) => setExpiryDays(e.target.value)}
          placeholder={lang === 'zh' ? '例如：30' : 'e.g., 30'}
          min="1"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            backgroundColor: 'transparent',
            color: 'var(--fg)',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* 生成按钮 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        <button
          onClick={generateQR}
          disabled={generating || !content.trim()}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: generating || !content.trim() ? 'var(--muted)' : 'var(--fg)',
            color: 'var(--bg)',
            border: 'none',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            cursor: generating || !content.trim() ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s ease',
          }}
        >
          {generating ? (lang === 'zh' ? '生成中...' : 'Generating...') : (lang === 'zh' ? '生成二维码' : 'Generate QR Code')}
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

      {/* 二维码结果 */}
      {qrDataUrl && (
        <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}>
          <img
            src={qrDataUrl}
            alt="QR Code"
            style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '12px' }}
          />
          <button
            onClick={downloadQR}
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
            {lang === 'zh' ? '下载二维码' : 'Download QR Code'}
          </button>
        </div>
      )}
    </div>
  )
}
