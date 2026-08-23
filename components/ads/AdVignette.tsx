'use client'

import Script from 'next/script'

export default function AdVignette() {
  return (
    <Script
      id="monetag-vignette"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `(function(s){s.dataset.zone='11635549',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
      }}
    />
  )
}
