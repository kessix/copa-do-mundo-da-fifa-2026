import { useState, useEffect } from 'react';

const CACHE_KEY = 'worldcup26_cache';

const STADIUM_TO_BRT_OFFSET = {
  "1": 3, "2": 3, "3": 3, // Mexico (UTC-6) -> BRT (UTC-3)
  "4": 2, "5": 2, "6": 2, // Central (UTC-5) -> BRT (UTC-3)
  "7": 1, "8": 1, "9": 1, "10": 1, "11": 1, "12": 1, // Eastern (UTC-4) -> BRT (UTC-3)
  "13": 4, "14": 4, "15": 4, "16": 4 // Pacific (UTC-7) -> BRT (UTC-3)
};

function convertToBRT(localDateStr, stadiumId) {
  if (!localDateStr || !stadiumId) return localDateStr;
  const parts = localDateStr.split(' ');
  if (parts.length !== 2) return localDateStr;
  
  const [month, day, year] = parts[0].split('/');
  const [hour, minute] = parts[1].split(':');

  const d = new Date(Date.UTC(year, month - 1, day, parseInt(hour), parseInt(minute)));
  const offset = STADIUM_TO_BRT_OFFSET[stadiumId] || 0;
  d.setUTCHours(d.getUTCHours() + offset);

  const newMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
  const newDay = String(d.getUTCDate()).padStart(2, '0');
  const newYear = d.getUTCFullYear();
  const newHour = String(d.getUTCHours()).padStart(2, '0');
  const newMinute = String(d.getUTCMinutes()).padStart(2, '0');

  return `${newMonth}/${newDay}/${newYear} ${newHour}:${newMinute}`;
}

export function useWorldCupData() {
  const [data, setData] = useState({
    teams: {},
    groups: [],
    games: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    // 1. Try to load from localStorage first
    let cachedDataStr = null;
    if (typeof window !== 'undefined') {
      try {
        cachedDataStr = localStorage.getItem(CACHE_KEY);
        if (cachedDataStr) {
          const parsedCache = JSON.parse(cachedDataStr);
          setData({
            teams: parsedCache.teams,
            groups: parsedCache.groups,
            games: parsedCache.games,
            loading: false, // Stop loading immediately
            error: null
          });
        }
      } catch (e) {
        console.warn("Failed to read cache", e);
      }
    }

    // 2. Fetch fresh data in the background
    async function fetchData() {
      try {
        const [teamsRes, groupsRes, gamesRes] = await Promise.all([
          fetch('https://worldcup26.ir/get/teams', { cache: 'no-store' }),
          fetch('https://worldcup26.ir/get/groups', { cache: 'no-store' }),
          fetch('https://worldcup26.ir/get/games', { cache: 'no-store' })
        ]);

        if (!teamsRes.ok || !groupsRes.ok || !gamesRes.ok) {
          throw new Error('Failed to fetch data from API');
        }

        const teamsData = await teamsRes.json();
        const groupsData = await groupsRes.json();
        const rawGamesData = await gamesRes.json();

        // Convert times to BRT
        const gamesData = {
          ...rawGamesData,
          games: rawGamesData.games.map(game => ({
            ...game,
            local_date_original: game.local_date,
            local_date: convertToBRT(game.local_date, game.stadium_id)
          }))
        };

        // Convert teams array to a lookup map
        const teamsMap = {};
        teamsData.teams.forEach(team => {
          teamsMap[team.id] = team;
        });

        // ----------------------------------------------------
        // CALCULATE TABLE LOCALLY BASED ON COMPLETED GAMES
        // To guarantee 100% accuracy even if API groups are lagging
        // ----------------------------------------------------
        const calculatedGroups = groupsData.groups.map(group => {
          const teamStats = {};
          group.teams.forEach(t => {
            teamStats[t.team_id] = { ...t, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
          });

          gamesData.games.forEach(game => {
             if (game.type !== 'group' || game.finished !== "TRUE") return;
             
             const homeId = game.home_team_id;
             const awayId = game.away_team_id;
             
             // If both teams belong to this group
             if (teamStats[homeId] && teamStats[awayId]) {
               const homeScore = parseInt(game.home_score, 10);
               const awayScore = parseInt(game.away_score, 10);

               teamStats[homeId].mp += 1;
               teamStats[homeId].gf += homeScore;
               teamStats[homeId].ga += awayScore;
               teamStats[homeId].gd = teamStats[homeId].gf - teamStats[homeId].ga;
               
               teamStats[awayId].mp += 1;
               teamStats[awayId].gf += awayScore;
               teamStats[awayId].ga += homeScore;
               teamStats[awayId].gd = teamStats[awayId].gf - teamStats[awayId].ga;

               if (homeScore > awayScore) {
                 teamStats[homeId].w += 1;
                 teamStats[homeId].pts += 3;
                 teamStats[awayId].l += 1;
               } else if (homeScore < awayScore) {
                 teamStats[awayId].w += 1;
                 teamStats[awayId].pts += 3;
                 teamStats[homeId].l += 1;
               } else {
                 teamStats[homeId].d += 1;
                 teamStats[homeId].pts += 1;
                 teamStats[awayId].d += 1;
                 teamStats[awayId].pts += 1;
               }
             }
          });

          // Sort teams
          const sortedTeams = Object.values(teamStats).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.gf - a.gf;
          });

          return { ...group, teams: sortedTeams };
        });

        const newData = {
          teams: teamsMap,
          groups: calculatedGroups,
          games: gamesData.games
        };

        const newDataStr = JSON.stringify(newData);

        // 3. Only update state and cache if data has changed
        if (cachedDataStr !== newDataStr) {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(CACHE_KEY, newDataStr);
            } catch (e) {
              console.warn("Failed to write cache", e);
            }
          }
          
          setData({
            ...newData,
            loading: false,
            error: null
          });
        } else if (!cachedDataStr) {
           // Fallback in case cache string was null but we still need to set loading false
           setData({
            ...newData,
            loading: false,
            error: null
          });
        }

      } catch (error) {
        console.error('Error fetching World Cup data:', error);
        // Only set error if we don't have cached data to show
        setData(prev => {
           if (Object.keys(prev.teams).length > 0) return { ...prev, loading: false }; 
           return { ...prev, loading: false, error: error.message };
        });
      }
    }

    fetchData();
  }, []);

  return data;
}
