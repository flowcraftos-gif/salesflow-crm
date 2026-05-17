'use client'
import { useEffect } from 'react'

export function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-r],[data-rl],[data-rr],[data-pct]')
    if (!els.length) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            if ('r' in el.dataset || 'rl' in el.dataset || 'rr' in el.dataset) {
              el.style.opacity = '1'
              el.style.translate = '0 0'
            }
            if ('pct' in el.dataset) {
              el.style.width = el.dataset.pct + '%'
            }
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.06 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}
