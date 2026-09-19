export function getLibraryPath(chapterId) {
  return chapterId == null ? '/library' : `/library/${chapterId}`
}
