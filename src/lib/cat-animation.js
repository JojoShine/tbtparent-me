const signatureActions = {
  雪宝: { id: 'typing', src: '/videos/cats/v2/xuebao/typing.png?v=3', columns: 4, rows: 4, frameCount: 16, fps: 12 },
  甜枣: { id: 'tail', src: '/videos/cats/v2/tianzao/tail.png?v=3', columns: 4, rows: 4, frameCount: 16, fps: 10 },
  三塔: { id: 'look', src: '/videos/cats/v2/santa/look.png?v=3', columns: 4, rows: 4, frameCount: 16, fps: 12 },
}

export function getSignatureCatAction(catName) {
  return signatureActions[catName] ?? null
}

export function getSpriteFrame(frameIndex, action, imageWidth, imageHeight) {
  const sw = imageWidth / action.columns
  const sh = imageHeight / action.rows
  const index = frameIndex % action.frameCount

  return {
    sx: (index % action.columns) * sw,
    sy: Math.floor(index / action.columns) * sh,
    sw,
    sh,
  }
}

export function shouldShowCatFallback(ready, reduceMotion, action) {
  return !ready || reduceMotion || !action
}

export function getSpriteFrameIndex(elapsedTime, fps, frameCount) {
  return Math.floor((elapsedTime * fps) / 1000) % frameCount
}
