const catMotionClasses = {
  雪宝: 'cat-motion-work',
  甜枣: 'cat-motion-gentle',
  三塔: 'cat-motion-watch',
}

export function getCatMotionClass(catName) {
  return catMotionClasses[catName] ?? ''
}
