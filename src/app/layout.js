import './globals.css';

import { SpeedInsights } from "@vercel/speed-insights/next";
import { LanguageProvider } from '../context/LanguageContext';

export const metadata = {
  title: 'FIFA World Cup 2026',
  description: 'Interactive World Cup 2026 App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
