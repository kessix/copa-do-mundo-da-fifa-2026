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
      roundName: round.roundName,
      days: Object.entries(round.daysMap)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, matches]) => ({ 
          date, 
          matches: matches.sort((a, b) => new Date(a.local_date).getTime() - new Date(b.local_date).getTime()) 
        }))
    }));

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [m, d, y] = dateStr.split('/');
    return y ? `${d}/${m}/${y}` : dateStr;
  };

  return (
    <div className={`glass-panel ${styles.matchesContainer}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t.matchday1 || "Jogos da Fase de Grupos"}</h3>
      </div>
      
      <div className={styles.scrollArea}>
        {matchesData.map((roundGroup, rIdx) => (
          <div key={rIdx} className={styles.roundGroup}>
            <h4 className={styles.roundTitle}>
              {lang === 'pt' ? roundGroup.roundName : roundGroup.roundName.replace('ª Rodada', ' Round').replace('1 ', '1st').replace('2 ', '2nd').replace('3 ', '3rd')}
            </h4>
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
        ))}
      </div>
    </div>
  );
}
