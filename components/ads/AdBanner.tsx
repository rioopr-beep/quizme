'use client'

import Script from 'next/script'

export default function AdBanner() {
  return (
    <Script
      id="monetag-banner"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `(function(s){s.dataset.zone='11635566',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
      }}
    />
  )
}
