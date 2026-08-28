// 管理后台 API 请求工具
export function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

function handleUnauthorized(res) {
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('admin_token')
    window.location.replace('/login')
  }
}

async function getError(res, fallback) {
  handleUnauthorized(res)
  const data = await res.json().catch(() => null)
  return new Error(data?.error || fallback)
}

export async function apiGet(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} failed`)
  return res.json()
}

export async function apiPut(url, data) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw await getError(res, `PUT ${url} failed`)
  }
  return res.json()
}

export async function apiPost(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw await getError(res, `POST ${url} failed`)
  }
  return res.json()
}

export async function apiDelete(url, id) {
  const res = await fetch(`${url}?id=${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) {
    throw await getError(res, `DELETE ${url} failed`)
  }
  return res.json()
}

// 通用表单样式
export const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg)',
  color: 'var(--fg)',
  fontFamily: 'monospace',
  fontSize: '16px',
  outline: 'none',
}

export const textareaStyle = {
  ...inputStyle,
  minHeight: '120px',
  resize: 'vertical',
}

export const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: 'var(--fg)',
  color: 'var(--bg)',
  border: 'none',
  fontFamily: 'monospace',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '16px',
  width: 'fit-content',
}

export const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: 'transparent',
  color: 'var(--fg)',
  border: '1px solid var(--border)',
}
// 翻译 API
export async function apiTranslate(text, from = 'zh', to = 'en') {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, from, to }),
  })
  if (!res.ok) throw new Error('翻译失败')
  const data = await res.json()
  return data.translated
}

// 翻译按钮样式
export const translateButtonStyle = {
  padding: '2px 8px',
  backgroundColor: 'transparent',
  color: 'var(--muted)',
  border: '1px solid var(--border)',
  fontFamily: 'monospace',
  fontSize: '0.7rem',
  cursor: 'pointer',
  borderRadius: '2px',
  marginLeft: '8px',
  lineHeight: '1',
  verticalAlign: 'middle',
}

export const labelStyle = {
  display: 'block',
  fontFamily: 'monospace',
  fontSize: '0.8rem',
  color: 'var(--muted)',
  marginBottom: '4px',
}
