let pendingVisit = null

// Share registration while the footer mounts more than once before its cookie arrives.
export function recordVisit() {
  if (!pendingVisit) {
    pendingVisit = fetch('/api/visits', {
      method: 'POST',
      cache: 'no-store',
    })
      .then(async response => {
        if (!response.ok) throw new Error('Visit statistics unavailable')
        const data = await response.json()
        if (data.error || !Number.isInteger(data.todayCount) || data.todayCount < 0
          || !Number.isInteger(data.total) || data.total < 0) {
          throw new Error('Invalid visit statistics')
        }
        return data
      })
      .finally(() => { pendingVisit = null })
  }
  return pendingVisit
}
