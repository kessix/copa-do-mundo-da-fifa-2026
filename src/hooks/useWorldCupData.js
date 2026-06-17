import { useState, useEffect } from 'react';

const CACHE_KEY = 'worldcup26_cache';

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
          fetch('https://worldcup26.ir/get/teams'),
          fetch('https://worldcup26.ir/get/groups'),
          fetch('https://worldcup26.ir/get/games')
        ]);

        if (!teamsRes.ok || !groupsRes.ok || !gamesRes.ok) {
          throw new Error('Failed to fetch data from API');
        }

        const teamsData = await teamsRes.json();
        const groupsData = await groupsRes.json();
        const gamesData = await gamesRes.json();

        // Convert teams array to a lookup map
        const teamsMap = {};
        teamsData.teams.forEach(team => {
          teamsMap[team.id] = team;
        });

        const newData = {
          teams: teamsMap,
          groups: groupsData.groups,
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
