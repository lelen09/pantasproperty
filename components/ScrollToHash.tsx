'use client'

import { useEffect } from 'react'

export default function ScrollToHash() {
  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1))
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('ring-4', 'ring-navy-400')
          setTimeout(() => el.classList.remove('ring-4', 'ring-navy-400'), 2000)
        }, 300)
      }
    }
  }, [])

  return null
}
