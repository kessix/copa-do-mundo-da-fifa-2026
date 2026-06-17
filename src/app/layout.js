import './globals.css';

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
      </body>
    </html>
  )
}
