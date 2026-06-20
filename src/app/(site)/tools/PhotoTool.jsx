'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'

// 标准证件照尺寸 (300dpi)
const PHOTO_SIZES = [
  { key: '1inch', label: '1寸', width: 295, height: 413, desc: '25×35mm' },
  { key: 'small-1inch', label: '小1寸', width: 260, height: 378, desc: '22×32mm' },
  { key: 'large-1inch', label: '大1寸', width: 390, height: 567, desc: '33×48mm' },
  { key: '2inch', label: '2寸', width: 413, height: 579, desc: '35×49mm' },
  { key: 'small-2inch', label: '小2寸', width: 413, height: 531, desc: '35×45mm' },
]

// 常用背景色
const BG_COLORS = [
  { key: 'white', label: '白底', color: '#FFFFFF' },
  { key: 'blue', label: '蓝底', color: '#438EDB' },
  { key: 'red', label: '红底', color: '#D42020' },
  { key: 'transparent', label: '透明底', color: null },
]

export default function PhotoTool() {
  const { lang } = useLang()
  const [originalImage, setOriginalImage] = useState(null)       // 原始图片 dataURL
  const [noBgImage, setNoBgImage] = useState(null)               // 去背景后的 Image 对象
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [progressPct, setProgressPct] = useState(-1)  // -1 表示无精确进度
  const [selectedSize, setSelectedSize] = useState(PHOTO_SIZES[0])
  const [selectedBg, setSelectedBg] = useState(BG_COLORS[0])
  const [resultUrl, setResultUrl] = useState(null)
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const previewRef = useRef(null)
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startOffX: 0, startOffY: 0 })

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) {
      alert(lang === 'zh' ? '请选择图片文件' : 'Please select an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setOriginalImage(ev.target.result)
      setNoBgImage(null)
      setResultUrl(null)
    }
    reader.readAsDataURL(file)
  }

  const processImage = async () => {
    if (!originalImage) return
    setProcessing(true)
    setProgress(lang === 'zh' ? '识别处理中...' : 'Processing...')
    setProgressPct(-1)

    try {
      const { removeBackground } = await import('@imgly/background-removal')
      
      const blob = await removeBackground(originalImage, {
        progress: (key, current, total) => {
          if (total > 0 && key) {
            const pct = Math.round((current / total) * 100)
            // 模型下载阶段有精确进度
            setProgressPct(pct)
            setProgress(lang === 'zh' ? `加载模型 ${pct}%` : `Loading model ${pct}%`)
          }
        }
      })

      // 模型加载完成，推理完成
      setProgressPct(100)
      setProgress(lang === 'zh' ? '处理完成' : 'Done')

      // 将 blob 转换为 Image 对象
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        setNoBgImage(img)
        setProcessing(false)
        setProgress('')
        setProgressPct(-1)
        setScale(1)
        setOffsetX(0)
        setOffsetY(0)
        generateResult(img, selectedSize, selectedBg, 1, 0, 0)
      }
      img.src = url
    } catch (err) {
      console.error('Processing error:', err)
      alert(lang === 'zh' ? `处理失败：${err.message}` : `Processing failed: ${err.message}`)
      setProcessing(false)
      setProgress('')
      setProgressPct(-1)
    }
  }

  const generateResult = useCallback((img, size, bg, sc, ox, oy) => {
    if (!img || !size) return

    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d')

    // 绘制背景
    if (bg.color) {
      ctx.fillStyle = bg.color
      ctx.fillRect(0, 0, size.width, size.height)
    }

    // 按比例缩放人物到目标尺寸（居中 + 用户缩放/偏移）
    const imgRatio = img.width / img.height
    const sizeRatio = size.width / size.height

    let drawW, drawH, drawX, drawY
    if (imgRatio > sizeRatio) {
      drawH = size.height
      drawW = size.height * imgRatio
      drawX = (size.width - drawW) / 2
      drawY = 0
    } else {
      drawW = size.width
      drawH = size.width / imgRatio
      drawX = 0
      drawY = (size.height - drawH) / 2
    }

    // 应用用户缩放和偏移
    const userScale = sc || 1
    const userOffX = ox || 0
    const userOffY = oy || 0
    const centerX = drawX + drawW / 2
    const centerY = drawY + drawH / 2

    ctx.save()
    ctx.translate(userOffX, userOffY)
    ctx.translate(centerX, centerY)
    ctx.scale(userScale, userScale)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(img, drawX, drawY, drawW, drawH)
    ctx.restore()

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setResultUrl(url)
      }
    }, 'image/png')
  }, [])

  // 缩放/偏移变化时重新生成
  useEffect(() => {
    if (noBgImage) {
      generateResult(noBgImage, selectedSize, selectedBg, scale, offsetX, offsetY)
    }
  }, [scale, offsetX, offsetY, noBgImage, selectedSize, selectedBg, generateResult])

  const handleSizeChange = (size) => {
    setSelectedSize(size)
    setScale(1)
    setOffsetX(0)
    setOffsetY(0)
  }

  const handleBgChange = (bg) => {
    setSelectedBg(bg)
  }

  const downloadResult = () => {
    if (!resultUrl) return
    const link = document.createElement('a')
    link.href = resultUrl
    link.download = `id-photo-${selectedSize.label}-${selectedBg.label || 'transparent'}.png`
    link.click()
  }

  const reset = () => {
    setOriginalImage(null)
    setNoBgImage(null)
    setResultUrl(null)
    setProcessing(false)
    setProgress('')
    setProgressPct(-1)
    setScale(1)
    setOffsetX(0)
    setOffsetY(0)
    setSelectedSize(PHOTO_SIZES[0])
    setSelectedBg(BG_COLORS[0])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '20px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? '证件照制作' : 'ID Photo Maker'}
      </h3>

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
            {lang === 'zh' ? '点击上传人像照片' : 'Click to upload portrait photo'}
          </p>
          <p className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            {lang === 'zh' ? '支持 JPG、PNG 格式，建议使用纯色背景的照片' : 'Supports JPG, PNG. Photos with plain background work best.'}
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
          {/* 预览区域 */}
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
                  {selectedSize.label} ({selectedSize.desc}) - {selectedBg.label}
                  {lang === 'zh' ? '（可拖拽调整位置）' : ' (drag to reposition)'}
                </div>
                <div
                  ref={previewRef}
                  onPointerDown={(e) => {
                    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, startOffX: offsetX, startOffY: offsetY }
                    e.currentTarget.setPointerCapture(e.pointerId)
                  }}
                  onPointerMove={(e) => {
                    if (!dragRef.current.dragging) return
                    const dx = e.clientX - dragRef.current.startX
                    const dy = e.clientY - dragRef.current.startY
                    const rect = e.currentTarget.querySelector('img')?.getBoundingClientRect()
                    const ratioX = selectedSize.width / (rect?.width || selectedSize.width)
                    const ratioY = selectedSize.height / (rect?.height || selectedSize.height)
                    setOffsetX(dragRef.current.startOffX + dx * ratioX)
                    setOffsetY(dragRef.current.startOffY + dy * ratioY)
                  }}
                  onPointerUp={() => { dragRef.current.dragging = false }}
                  onPointerLeave={() => { dragRef.current.dragging = false }}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    cursor: dragRef.current.dragging ? 'grabbing' : 'grab',
                    touchAction: 'none',
                    backgroundColor: selectedBg.key === 'transparent' ? 'rgba(0,0,0,0.06)' : undefined,
                  }}
                >
                  <div style={{
                    aspectRatio: `${selectedSize.width} / ${selectedSize.height}`,
                    maxHeight: '300px',
                    maxWidth: '100%',
                    backgroundImage: selectedBg.key === 'transparent'
                      ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)'
                      : undefined,
                    backgroundSize: selectedBg.key === 'transparent' ? '16px 16px' : undefined,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <img
                      src={resultUrl}
                      alt="Result"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 识别处理按钮 */}
          {!noBgImage && !processing && (
            <button
              onClick={processImage}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--fg)',
                color: 'var(--bg)',
                border: 'none',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              {lang === 'zh' ? '识别处理' : 'Process'}
            </button>
          )}

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
                {lang === 'zh' ? '首次使用需加载模型（约5MB），请耐心等待' : 'First use requires model download (~5MB)'}
              </div>
            </div>
          )}

          {/* 尺寸选择 */}
          {noBgImage && (
            <>
              {/* 缩放和位置调整 */}
              <div style={{ marginBottom: '16px' }}>
                <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--fg)', marginBottom: '8px' }}>
                  {lang === 'zh' ? '缩放调整：' : 'Scale:'}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setScale(s => Math.max(0.5, +(s - 0.1).toFixed(1)))}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--fg)',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: '2px',
                    }}
                  >-</button>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(+e.target.value)}
                    style={{ flex: 1, accentColor: 'var(--fg)' }}
                  />
                  <button
                    onClick={() => setScale(s => Math.min(2, +(s + 0.1).toFixed(1)))}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--fg)',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: '2px',
                    }}
                  >+</button>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--muted)', minWidth: '40px', textAlign: 'center' }}>
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() => { setScale(1); setOffsetX(0); setOffsetY(0) }}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--muted)',
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {lang === 'zh' ? '复位' : 'Reset'}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--fg)', marginBottom: '8px' }}>
                  {lang === 'zh' ? '照片尺寸：' : 'Photo Size:'}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {PHOTO_SIZES.map(size => (
                    <button
                      key={size.key}
                      onClick={() => handleSizeChange(size)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid',
                        borderColor: selectedSize.key === size.key ? 'var(--fg)' : 'var(--border)',
                        backgroundColor: selectedSize.key === size.key ? 'var(--fg)' : 'transparent',
                        color: selectedSize.key === size.key ? 'var(--bg)' : 'var(--muted)',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {size.label} ({size.desc})
                    </button>
                  ))}
                </div>
              </div>

              {/* 背景色选择 */}
              <div style={{ marginBottom: '16px' }}>
                <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--fg)', marginBottom: '8px' }}>
                  {lang === 'zh' ? '背景颜色：' : 'Background Color:'}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {BG_COLORS.map(bg => (
                    <button
                      key={bg.key}
                      onClick={() => handleBgChange(bg)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        border: '1px solid',
                        borderColor: selectedBg.key === bg.key ? 'var(--fg)' : 'var(--border)',
                        backgroundColor: 'transparent',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        color: 'var(--fg)',
                      }}
                    >
                      <span style={{
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        borderRadius: '2px',
                        backgroundColor: bg.color || 'transparent',
                        border: '1px solid var(--border)',
                        backgroundImage: !bg.color
                          ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)'
                          : undefined,
                        backgroundSize: !bg.color ? '8px 8px' : undefined,
                      }} />
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {resultUrl && (
                  <button
                    onClick={downloadResult}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: 'var(--fg)',
                      color: 'var(--bg)',
                      border: 'none',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'zh' ? '下载照片' : 'Download'}
                  </button>
                )}
                <button
                  onClick={reset}
                  style={{
                    padding: '12px 20px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--muted)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'zh' ? '重置' : 'Reset'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
