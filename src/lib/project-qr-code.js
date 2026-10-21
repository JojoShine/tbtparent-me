import QRCode from 'qrcode'

export async function getProjectQrCode(project, options) {
  if (project.demo_qr_url) return project.demo_qr_url
  const destination = project.mobile_url
  if (!destination || destination === '#') return ''
  return QRCode.toDataURL(destination, options)
}
