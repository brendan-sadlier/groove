import { useEffect } from 'react'

// Registers the service worker in production only (keeps dev HMR clean).
export function RegisterSW() {
  useEffect(() => {
    if (!import.meta.env.PROD) return
    if (!('serviceWorker' in navigator)) return

    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registration is best-effort */
      })
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return null
}
