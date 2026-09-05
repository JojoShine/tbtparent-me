export function getCatActionForHour(actions, hour) {
  if (!Array.isArray(actions) || actions.length === 0) return null
  return actions[Math.floor(hour / 2) % actions.length]
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
