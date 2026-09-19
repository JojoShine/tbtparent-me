import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('project covers and detail images use the shared accessible image preview', async () => {
  const [lightbox, projects, detail] = await Promise.all([
    readFile(new URL('../src/components/ui/ImageLightbox.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/projects/ProjectsClient.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/(site)/projects/[id]/page.js', import.meta.url), 'utf8'),
  ])

  assert.match(lightbox, /role="dialog"/)
  assert.match(lightbox, /aria-modal="true"/)
  assert.match(lightbox, /event\.key === 'Escape'/)
  assert.match(lightbox, /document\.body\.style\.overflow = 'hidden'/)
  assert.match(lightbox, /createPortal/)
  assert.match(lightbox, /z-index: 2147483647/)
  assert.match(lightbox, /IMAGE_ZOOM_CURSOR/)
  assert.match(projects, /<ImageLightbox/)
  assert.match(projects, /setPreviewImage/)
  assert.match(projects, /style=\{\{ cursor: IMAGE_ZOOM_CURSOR \}\}/)
  assert.match(projects, /river-project-cover img[^}]*cursor: zoom-in/)
  assert.match(detail, /<ImageLightbox/)
  assert.match(detail, /setPreviewImage/)
  assert.match(detail, /project-content-image-button img[^}]*cursor: zoom-in/)
})
