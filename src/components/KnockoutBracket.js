'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './KnockoutBracket.module.css';
import { useLanguage } from '../context/LanguageContext';

const leftCols = [
  { round: 'Round of 32', matches: [74, 77, 73, 75, 83, 84, 81, 82] },
  { round: 'Round of 16', matches: [89, 90, 93, 94] },
  { round: 'Quarter-Finals', matches: [97, 98] },
  { round: 'Semi-Finals', matches: [101] }
];

const centerCol = { round: 'Final', matches: [104, 103] };

const rightCols = [
  { round: 'Semi-Finals', matches: [102] },
  { round: 'Quarter-Finals', matches: [99, 100] },
  { round: 'Round of 16', matches: [91, 92, 95, 96] },
  { round: 'Round of 32', matches: [76, 78, 79, 80, 86, 88, 85, 87] }
];

export default function KnockoutBracket({ games = [], teamsMap = {} }) {
  const { t, lang } = useLanguage();
  
  // Create a flattened array of skeleton matches for updateLines
  const skeletonMatches = [
    ...leftCols.flatMap(c => c.matches),
    ...centerCol.matches,
    ...rightCols.flatMap(c => c.matches)
  ];
  
  const containerRef = useRef(null);
  const bracketContentRef = useRef(null);
  const matchRefs = useRef({});
  const [lines, setLines] = useState([]);

  const updateLines = useCallback(() => {
    if (!bracketContentRef.current) return;
    const contentRect = bracketContentRef.current.getBoundingClientRect();
    const newLines = [];

    // The knockout tree requires connections. We loop over our layout columns
    [...leftCols, centerCol, ...rightCols].forEach(round => {
      const matchesInRound = Array.isArray(round.matches) ? round.matches : [round.matches];
      matchesInRound.forEach(matchId => {
        const game = games.find(g => g.id === matchId.toString());
        if (!game) return;
        
        if (matchId === 103) return; // Skip lines to bronze match

        // Extract source1 and source2 from labels (e.g. "Winner Match 74")
        const source1Match = game.home_team_label ? game.home_team_label.match(/\d+/) : null;
        const source2Match = game.away_team_label ? game.away_team_label.match(/\d+/) : null;
        const source1 = source1Match ? parseInt(source1Match[0]) : null;
        const source2 = source2Match ? parseInt(source2Match[0]) : null;

        if (!source1 || !source2) return;

        const elCurrent = matchRefs.current[matchId];
        const elSource1 = matchRefs.current[source1];
        const elSource2 = matchRefs.current[source2];

        if (elCurrent && elSource1 && elSource2) {
          const rectCurrent = elCurrent.getBoundingClientRect();
          const rect1 = elSource1.getBoundingClientRect();
          const rect2 = elSource2.getBoundingClientRect();

          const currentXCenter = rectCurrent.left + rectCurrent.width/2;
          const s1XCenter = rect1.left + rect1.width/2;
          
          // Determine if source is to the left or right of current
          const isSourceLeft = s1XCenter < currentXCenter;
          
          const currentX = (rectCurrent.left - contentRect.left) + (isSourceLeft ? 0 : rectCurrent.width);
          const currentY = rectCurrent.top - contentRect.top + (rectCurrent.height / 2);

          const s1X = (rect1.left - contentRect.left) + (isSourceLeft ? rect1.width : 0);
          const s1Y = rect1.top - contentRect.top + (rect1.height / 2);

          const s2X = (rect2.left - contentRect.left) + (isSourceLeft ? rect2.width : 0);
          const s2Y = rect2.top - contentRect.top + (rect2.height / 2);

          const controlOffset = isSourceLeft ? 40 : -40;
          
          newLines.push(`M ${s1X} ${s1Y} C ${s1X + controlOffset} ${s1Y}, ${currentX - controlOffset} ${currentY}, ${currentX} ${currentY}`);
          newLines.push(`M ${s2X} ${s2Y} C ${s2X + controlOffset} ${s2Y}, ${currentX - controlOffset} ${currentY}, ${currentX} ${currentY}`);
        }
      });
    });
    setLines(newLines);
  }, [games]);

  useEffect(() => {
    setTimeout(updateLines, 100);
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [updateLines]);


  const renderMatch = (matchId, isRightSide = false) => {
    const match = games.find(g => g.id === matchId.toString());
    if (!match) return null;

    const matchName = lang === 'pt' ? `Jogo ${matchId}` : `Match ${matchId}`;
    const dateFormatted = match.local_date ? match.local_date.split(' ')[0] : '';
    
    // Determine Team 1 Display
    const t1IsPlaceholder = match.home_team_id === "0";
    const team1Data = !t1IsPlaceholder ? teamsMap[match.home_team_id] : null;
    const team1Name = t1IsPlaceholder ? match.home_team_label : (t.teams[team1Data?.name_en] || team1Data?.name_en || match.home_team_name_en);
    
    // Determine Team 2 Display
    const t2IsPlaceholder = match.away_team_id === "0";
    const team2Data = !t2IsPlaceholder ? teamsMap[match.away_team_id] : null;
    const team2Name = t2IsPlaceholder ? match.away_team_label : (t.teams[team2Data?.name_en] || team2Data?.name_en || match.away_team_name_en);

    return (
      <div 
        key={matchId} 
        className={`${styles.match} ${matchId === 104 ? styles.finalMatch : ''} ${matchId === 103 ? styles.bronzeMatch : ''}`}
        ref={el => matchRefs.current[matchId] = el}
      >
        <div className={styles.matchInfo}>
          {matchId === 104 ? (lang === 'pt' ? 'FINAL' : 'FINAL') : matchId === 103 ? (lang === 'pt' ? 'TERCEIRO LUGAR' : 'BRONZE FINAL') : `${matchName} • ${dateFormatted}`}
        </div>
        
        {/* Team 1 Slot */}
        <div className={styles.teamSlot}>
          {isRightSide && (
            <div className={styles.staticScore}>{match.finished === "TRUE" ? match.home_score : "-"}</div>
          )}
          {team1Data ? (
            <div className={isRightSide ? styles.teamContentRight : styles.teamContent}>
              {isRightSide && <span className={styles.teamName}>{team1Name}</span>}
              {team1Data.flag && (
                <img src={team1Data.flag} alt={team1Name} className={styles.teamFlag} />
              )}
              {!isRightSide && <span className={styles.teamName}>{team1Name}</span>}
            </div>
          ) : (
            <div className={styles.emptySlot}>{team1Name}</div>
          )}
          {!isRightSide && (
            <div className={styles.staticScore}>{match.finished === "TRUE" ? match.home_score : "-"}</div>
          )}
        </div>
        
        {/* Team 2 Slot */}
        <div className={styles.teamSlot}>
          {isRightSide && (
            <div className={styles.staticScore}>{match.finished === "TRUE" ? match.away_score : "-"}</div>
          )}
          {team2Data ? (
            <div className={isRightSide ? styles.teamContentRight : styles.teamContent}>
              {isRightSide && <span className={styles.teamName}>{team2Name}</span>}
              {team2Data.flag && (
                <img src={team2Data.flag} alt={team2Name} className={styles.teamFlag} />
              )}
              {!isRightSide && <span className={styles.teamName}>{team2Name}</span>}
            </div>
          ) : (
            <div className={styles.emptySlot}>{team2Name}</div>
          )}
          {!isRightSide && (
            <div className={styles.staticScore}>{match.finished === "TRUE" ? match.away_score : "-"}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.bracketContainer} ref={containerRef}>
      <div className={styles.bracketContent} ref={bracketContentRef}>
        <svg 
          className={styles.svgLayer} 
        >
          {lines.map((d, i) => (
            <path 
              key={i} 
              d={d} 
              fill="none" 
              stroke="rgba(11, 209, 163, 0.5)" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          ))}
        </svg>
        
        {/* Left Pathway */}
        {leftCols.map((col, cIdx) => (
          <div key={`left-${cIdx}`} className={styles.roundColumn}>
            <div className={styles.roundTitle}>{t.rounds[col.round] || col.round}</div>
            {col.matches.map(id => renderMatch(id))}
          </div>
        ))}

        {/* Center Pathway */}
        <div className={styles.centerPathway}>
          <img 
            src="https://assets.football-logos.cc/logos/tournaments/1500x1500/fifa-world-cup-2026--white.10e0b37b.png"
            alt="FIFA World Cup 2026 Logo"
            className={styles.centerLogo}
          />
          {centerCol.matches.map(id => renderMatch(id))}
        </div>

        {/* Right Pathway */}
        {rightCols.map((col, cIdx) => (
          <div key={`right-${cIdx}`} className={styles.roundColumn}>
            <div className={styles.roundTitle}>{t.rounds[col.round] || col.round}</div>
            {col.matches.map(id => renderMatch(id, true))}
          </div>
        ))}
      </div>
    </div>
  );
}
