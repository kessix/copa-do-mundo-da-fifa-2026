'use client';
import { useState, useEffect } from 'react';
import styles from './GroupMatches.module.css';

export default function GroupMatches({ games, teamsMap, t, lang }) {
  const groupGames = (games || []).filter(g => g.type === 'group');

  // Group by matchday and date
  const roundsMap = {};
  groupGames.forEach(game => {
    const md = game.matchday;
    if (!roundsMap[md]) {
      roundsMap[md] = { md: parseInt(md, 10), roundName: `${md}ª Rodada`, daysMap: {} };
    }
    const dateOnly = game.local_date.split(' ')[0];
    if (!roundsMap[md].daysMap[dateOnly]) {
      roundsMap[md].daysMap[dateOnly] = [];
    }
    roundsMap[md].daysMap[dateOnly].push(game);
  });

  const matchesData = Object.values(roundsMap)
    .sort((a, b) => a.md - b.md)
    .map(round => ({
      md: round.md,
      roundName: round.roundName,
      days: Object.entries(round.daysMap)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, matches]) => ({ 
          date, 
          matches: matches.sort((a, b) => new Date(a.local_date).getTime() - new Date(b.local_date).getTime()) 
        }))
    }));

  const [openRounds, setOpenRounds] = useState({});
  const [hasSetDefault, setHasSetDefault] = useState(false);

  // Automatically expand the current round based on today's date
  useEffect(() => {
    if (matchesData.length > 0 && !hasSetDefault) {
      const now = new Date();
      // Default to the last round if all matches are in the past
      let activeRoundMd = matchesData[matchesData.length - 1].md;

      for (const round of matchesData) {
        // Check if the round has any match that hasn't finished yet (accounting for a ~2hr game duration)
        const hasFutureMatch = round.days.some(day => 
          day.matches.some(match => new Date(match.local_date).getTime() > now.getTime() - 2 * 60 * 60 * 1000)
        );
        if (hasFutureMatch) {
          activeRoundMd = round.md;
          break;
        }
      }

      setOpenRounds({ [activeRoundMd]: true });
      setHasSetDefault(true);
    }
  }, [matchesData, hasSetDefault]);

  const toggleRound = (md) => {
    setOpenRounds(prev => ({ ...prev, [md]: !prev[md] }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [m, d, y] = dateStr.split('/');
    return y ? `${d}/${m}/${y}` : dateStr;
  };

  const getRoundLabel = (roundName) => {
    if (lang === 'pt') return roundName;
    return roundName
      .replace('1ª Rodada', '1st Round')
      .replace('2ª Rodada', '2nd Round')
      .replace('3ª Rodada', '3rd Round');
  };

  return (
    <div className={`glass-panel ${styles.matchesContainer}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t.matchday1 || "Jogos da Fase de Grupos"}</h3>
      </div>
      
      <div className={styles.scrollArea}>
        {matchesData.map((roundGroup) => {
          const isOpen = !!openRounds[roundGroup.md];
          const totalMatches = roundGroup.days.reduce((acc, d) => acc + d.matches.length, 0);

          return (
            <div key={roundGroup.md} className={styles.roundGroup}>
              <button
                className={`${styles.roundToggle} ${isOpen ? styles.roundToggleOpen : ''}`}
                onClick={() => toggleRound(roundGroup.md)}
                aria-expanded={isOpen}
              >
                <span className={styles.roundTitleText}>
                  {getRoundLabel(roundGroup.roundName)}
                </span>
                <span className={styles.roundMeta}>
                  <span className={styles.matchCount}>{totalMatches} {lang === 'pt' ? 'jogos' : 'matches'}</span>
                  <svg
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                    viewBox="0 0 24 24" width="20" height="20" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>

              <div className={`${styles.roundContent} ${isOpen ? styles.roundContentOpen : ''}`}>
                <div className={styles.roundContentInner}>
                  {roundGroup.days.map((day, dIdx) => (
                    <div key={dIdx} className={styles.matchDay}>
                      <h5 className={styles.date}>{formatDate(day.date)}</h5>
                      <div className={styles.matchesList}>
                        {day.matches.map((match, mIdx) => (
                          <div key={mIdx} className={styles.matchCard}>
                            <div className={styles.matchHeader}>
                              <span className={styles.groupBadge}>{t.group} {match.group}</span>
                              <span className={styles.location}>{match.local_date.split(' ')[1]}</span>
                            </div>
                            
                            <div className={styles.scoreBoard}>
                              <div className={styles.team}>
                                {(teamsMap[match.home_team_id]?.flag) && <img src={teamsMap[match.home_team_id].flag} alt="flag" className={styles.flag} />}
                                <span className={styles.teamName}>{t.teams[match.home_team_name_en] || match.home_team_name_en}</span>
                              </div>
                              
                              <div className={styles.scoreWrapper}>
                                {match.finished === "TRUE" ? (
                                  <div className={styles.score}>
                                    <span>{match.home_score}</span>
                                    <span className={styles.separator}>-</span>
                                    <span>{match.away_score}</span>
                                  </div>
                                ) : (
                                  <div className={styles.vs}>VS</div>
                                )}
                              </div>
                              
                              <div className={styles.team} style={{ flexDirection: 'row-reverse', textAlign: 'right' }}>
                                {(teamsMap[match.away_team_id]?.flag) && <img src={teamsMap[match.away_team_id].flag} alt="flag" className={styles.flag} />}
                                <span className={styles.teamName}>{t.teams[match.away_team_name_en] || match.away_team_name_en}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
