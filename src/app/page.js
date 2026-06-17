'use client';

import KnockoutBracket from '../components/KnockoutBracket';
import GroupTable from '../components/GroupTable';
import GroupMatches from '../components/GroupMatches';
import { useLanguage } from '../context/LanguageContext';
import { useWorldCupData } from '../hooks/useWorldCupData';

export default function Home() {
  const { t, lang, toggleLanguage } = useLanguage();
  const { teams, groups, games, loading, error } = useWorldCupData();

  if (loading) {
    return (
      <main className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <h2 style={{ color: 'var(--neon-green)' }}>{t.loading || 'Carregando dados oficiais da Copa do Mundo...'}</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <h2 style={{ color: '#ff4444' }}>{t.error || 'Erro ao carregar dados'}</h2>
      </main>
    );
  }

  // Sort groups alphabetically by name (A, B, C...)
  const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="container" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
        <button 
          onClick={() => toggleLanguage(lang === 'pt' ? 'en' : 'pt')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {lang === 'pt' ? 'EN' : 'PT'}
        </button>
      </div>

      <header style={{ padding: '3rem 0 4rem 0', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-1px' }}>
          {t.title}
        </h1>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>{lang === 'pt' ? 'Desenvolvido por' : 'Developed by'} <strong>kessix</strong></span>
          <img src="https://flagcdn.com/w20/br.png" alt="Brasil" style={{ width: '20px', borderRadius: '2px', display: 'inline-block' }} />
          <a href="https://www.linkedin.com/in/kessix" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', color: '#0A66C2', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>
      </header>

      <section>
        <h2 style={{ fontSize: '2rem', color: 'var(--foreground)', marginBottom: '2rem' }}>{t.groupStage}</h2>
        
        <GroupMatches games={games} teamsMap={teams} t={t} lang={lang} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))',
          gap: '2rem',
          marginTop: '3rem'
        }}>
          {sortedGroups.map(group => (
            <GroupTable key={group.name} letter={group.name} teams={group.teams} teamsMap={teams} />
          ))}
        </div>
      </section>

      <section style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--foreground)' }}>{t.knockoutStage}</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', background: 'rgba(11, 209, 163, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
            {t.liveData || 'AO VIVO'}
          </span>
        </div>
        <KnockoutBracket games={games} teamsMap={teams} />
      </section>

      <footer style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <a href="https://github.com/kessix" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{lang === 'pt' ? 'Hospedado na' : 'Hosted on'}</span>
            <svg viewBox="0 0 76 65" fill="#fff" width="20" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/>
            </svg>
            <strong>Vercel</strong>
          </span>
        </div>
      </footer>
    </main>
  );
}
