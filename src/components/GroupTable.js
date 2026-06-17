'use client';
import styles from './GroupTable.module.css';
import { useLanguage } from '../context/LanguageContext';

export default function GroupTable({ letter, teams, teamsMap }) {
  const { t } = useLanguage();

  return (
    <div className={`glass-panel ${styles.groupContainer}`}>
      <div className={styles.groupHeader}>
        <h3 className={styles.groupTitle}>{t.group} {letter}</h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>{t.team}</th>
              <th title={t.stats.mpTitle}>{t.stats.mp}</th>
              <th title={t.stats.wTitle}>{t.stats.w}</th>
              <th title={t.stats.dTitle}>{t.stats.d}</th>
              <th title={t.stats.lTitle}>{t.stats.l}</th>
              <th title={t.stats.gfTitle}>{t.stats.gf}</th>
              <th title={t.stats.gaTitle}>{t.stats.ga}</th>
              <th title={t.stats.gdTitle}>{t.stats.gd}</th>
              <th title={t.stats.ptsTitle}>{t.stats.pts}</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const teamInfo = teamsMap[team.team_id] || {};
              const nameEn = teamInfo.name_en || 'TBD';
              const flagUrl = teamInfo.flag || '';
              
              return (
                <tr 
                  key={team.team_id} 
                  className={styles.teamRow}
                >
                  <td style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                    •
                  </td>
                  <td>
                    <div className={styles.teamInfo}>
                      {flagUrl && (
                        <img 
                          src={flagUrl} 
                          alt={`${t.teams[nameEn] || nameEn} flag`}
                          className={styles.flag}
                          draggable="false"
                        />
                      )}
                      <span className={styles.teamName}>{t.teams[nameEn] || nameEn}</span>
                    </div>
                  </td>
                  <td>{team.mp}</td>
                  <td>{team.w}</td>
                  <td>{team.d}</td>
                  <td>{team.l}</td>
                  <td>{team.gf}</td>
                  <td>{team.ga}</td>
                  <td>{team.gd}</td>
                  <td className={styles.points}>{team.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
