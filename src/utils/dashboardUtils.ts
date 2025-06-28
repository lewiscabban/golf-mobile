import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Button } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ScoresRow, ProfilesRow } from '../types/supabase';
import { Courses } from "../utils/scoresUtils"
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for the friends icon

export type Round = {
  course_id: string
  created_at: string
  id: number
}

export const INITIAL_ITEMS = 20;

export const fetchRounds = async (
  userId: string,
  itemsPerPage: number,
  setLoading: (val: boolean) => void,
  setMoreLoading: (val: boolean) => void,
  setRefreshing: (val: boolean) => void,
  setRounds: (rounds: Round[]) => void,
  setScoresMap: (map: Record<number, ScoresRow[]>) => void,
  setTotalParMap: (map: Record<number, number>) => void,
  setCourseNames: (map: Record<string, string>) => void,
  setCourseHoles: (map: Record<string, number>) => void,
  setCourseClubMap: (map: Record<string, string>) => void,
  setClubNames: (map: Record<string, string>) => void,
  setPlayersMap: (map: Record<number, ProfilesRow[]>) => void,
) => {
  setLoading(true); // Start loading
  try {
    const { data: friendsData, error: friendsError } = await supabase
      .from('friendships')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (friendsError) {
      console.error('Error fetching friends:', friendsError);
      return;
    }

    // Extract friend IDs
    const friendIds = friendsData?.flatMap(friend =>
      friend.sender_id === userId ? friend.receiver_id : friend.sender_id
    ) || [];
    const allPlayerIds = [userId, ...friendIds];
    const { data: allRoundsData, error: friendRoundsError } = await supabase
      .from('scores')
      .select('round_id')
      .in('player', allPlayerIds);

    if (friendRoundsError) {
      console.error('Error fetching rounds for friends:', friendRoundsError);
      return;
    }
    const allRoundIds = allRoundsData?.map(score => score.round_id) || [];

    // Now fetch the rounds based on the combined round IDs
    if (allRoundIds.length > 0) {
      const { data: finalRoundsData, error: finalRoundsError } = await supabase
        .from('rounds')
        .select('course_id::text, created_at, id')
        .order("created_at", { ascending: false })
        .in('id', allRoundIds)
        .limit(itemsPerPage);
      if (finalRoundsError) {
        console.error('Error fetching final rounds:', finalRoundsError);
      } else {
        setRounds(finalRoundsData || []);
        await fetchAllScoresAndPars(setScoresMap, setTotalParMap, finalRoundsData || []);
        await fetchCourseAndClubNames(setCourseNames, setCourseHoles, setCourseClubMap, setClubNames, finalRoundsData || []);
        await fetchPlayers(setPlayersMap, finalRoundsData || []);
      }
    } else {
      console.error('No rounds found for friends or user.');
    }
  } finally {
    setLoading(false); // Done loading
    setMoreLoading(false);
    setRefreshing(false);
  }
};

export const fetchMoreRounds = async (
  userId: string,
  itemsPerPage: number,
  hasMore: boolean,
  setMoreLoading: (val: boolean) => void,
  setRefreshing: (val: boolean) => void,
  setRounds: (rounds: Round[]) => void,
  setScoresMap: (map: Record<number, ScoresRow[]>) => void,
  setTotalParMap: (map: Record<number, number>) => void,
  setCourseNames: (map: Record<string, string>) => void,
  setCourseHoles: (map: Record<string, number>) => void,
  setCourseClubMap: (map: Record<string, string>) => void,
  setClubNames: (map: Record<string, string>) => void,
  setPlayersMap: (map: Record<number, ProfilesRow[]>) => void,
  setItemsPerPage: (val: number) => void,
  setHasMore: (val: boolean) => void,
) => {
  if (!hasMore) return;
  setMoreLoading(true)
  const nextItemsPerPage = itemsPerPage + INITIAL_ITEMS

  const { data: friendsData, error: friendsError } = await supabase
    .from('friendships')
    .select('sender_id, receiver_id')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (friendsError) {
    console.error('Error fetching friends:', friendsError);
    return;
  }

  // Extract friend IDs
  const friendIds = friendsData?.flatMap(friend =>
    friend.sender_id === userId ? friend.receiver_id : friend.sender_id
  ) || [];

  if (friendIds.length > 0 || userId) {
    // Fetch round IDs for friends
    const { data: friendRoundsData, error: friendRoundsError } = await supabase
      .from('scores')
      .select('round_id')
      .in('player', friendIds);

    if (friendRoundsError) {
      console.error('Error fetching rounds for friends:', friendRoundsError);
      return;
    }

    const friendRoundIds = friendRoundsData?.map(score => score.round_id) || [];

    // Fetch round IDs for the current user
    const { data: userRoundsData, error: userRoundsError } = await supabase
      .from('scores')
      .select('round_id')
      .eq('player', userId);

    if (userRoundsError) {
      console.error('Error fetching rounds for user:', userRoundsError);
      return;
    }

    const userRoundIds = userRoundsData?.map(score => score.round_id) || [];

    // Combine both friend and user round IDs
    const allRoundIds = Array.from(new Set([...friendRoundIds, ...userRoundIds]));

    // Now fetch the rounds based on the combined round IDs
    if (allRoundIds.length > 0) {
      const { data: finalRoundsData, error: finalRoundsError } = await supabase
        .from('rounds')
        .select('course_id::text, created_at, id')
        .order("created_at", { ascending: false })
        .in('id', allRoundIds)
        .limit(nextItemsPerPage);

      if (finalRoundsError) {
        console.error('Error fetching final rounds:', finalRoundsError);
      } else {
        setRounds(finalRoundsData || []);
        await fetchAllScoresAndPars(setScoresMap, setTotalParMap, finalRoundsData || []);
        await fetchCourseAndClubNames(setCourseNames, setCourseHoles, setCourseClubMap, setClubNames, finalRoundsData || []);
        await fetchPlayers(setPlayersMap, finalRoundsData || []); // Fetch players for each round
        setItemsPerPage(nextItemsPerPage);

        if (finalRoundsData.length < nextItemsPerPage) {
          setHasMore(false);
        }
      }
    } else {
      console.error('No rounds found for friends or user.');
    }
  } else {
    console.error('No friends found.');
  }

  setMoreLoading(false);
  setRefreshing(false);
};

export const fetchCourseAndClubNames = async (
  setCourseNames: (map: Record<string, string>) => void,
  setCourseHoles: (map: Record<string, number>) => void,
  setCourseClubMap: (map: Record<string, string>) => void,
  setClubNames: (map: Record<string, string>) => void,
  rounds: Round[]
) => {
  const courseIds = rounds.map((round) => round.course_id).filter((id) => id != null);

  if (courseIds.length > 0) {
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('CourseID::text, CourseName, ClubID::text, NumHoles')
      .in('CourseID', courseIds);

    if (coursesError) {
      console.error('Error fetching course names:', coursesError);
      Alert.alert('Error', 'Failed to fetch course names.');
      return;
    }

    const courseNameMap: Record<string, string> = {};
    const courseHoleMap: Record<string, number> = {};
    const clubIdSet = new Set<string>();
    const courseClubMap: Record<string, string> = {};

    (coursesData as Partial<Courses>[]).forEach((course) => {
      if (course.CourseID && course.CourseName) {
        courseNameMap[course.CourseID] = course.CourseName;
        courseHoleMap[course.CourseID] = course.NumHoles || 0;
        if (course.ClubID) {
          courseClubMap[course.CourseID] = course.ClubID;
          clubIdSet.add(course.ClubID);
        }
      }
    });
    setCourseNames(courseNameMap);
    setCourseHoles(courseHoleMap);
    setCourseClubMap(courseClubMap);

    if (clubIdSet.size > 0) {
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('ClubID::text, ClubName')
        .in('ClubID', Array.from(clubIdSet));

      if (clubsError) {
        console.error('Error fetching club names:', clubsError);
        Alert.alert('Error', 'Failed to fetch club names.');
        return;
      }

      const clubNameMap: Record<string, string> = {};
      clubsData?.forEach((club) => {
        clubNameMap[club.ClubID] = club.ClubName;
      });

      setClubNames(clubNameMap);
    }
  }
};

export const fetchScores = async (roundId: number): Promise<ScoresRow[]> => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('round_id', roundId)
    .order('hole', { ascending: true });
  if (error) {
    console.error('Error fetching scores:', error);
    return [];
  }

  return data as ScoresRow[];
};

export const calculateTotalScore = (scores: ScoresRow[], player: ProfilesRow | null = null): number => {
  let player_scores: ScoresRow[] = []
  if (player) {
    player_scores = scores.filter(score => score.player === player.id)
  }
  const totalScore = player_scores.reduce((total, score) => total + (score.score || 0), 0);
  return totalScore
};

export const calculateParThroughHolesPlayed = (scores: ScoresRow[], roundId: number, player: ProfilesRow | null = null): number => {
  let player_scores: ScoresRow[] = []
  if (player) {
    player_scores = scores.filter(score => score.player === player.id)
  }
  let scoreThroughHolesPlayed = player_scores.filter(score => score.score !== null);
  let scoreThroughHolesPlayedAndParSet = scoreThroughHolesPlayed.filter(score => score.par !== null);
  let parThroughHolesPlayed = scoreThroughHolesPlayedAndParSet.reduce((total, score) => total + (score.par || 0), 0)
  return parThroughHolesPlayed;
};

export const calculateHolesPlayed = (scores: ScoresRow[], roundId: number, player: ProfilesRow | null = null): number => {
  let player_scores: ScoresRow[] = []
  if (player) {
    player_scores = scores.filter(score => score.player === player.id)
  }
  let scoreThroughHolesPlayed = player_scores.filter(score => score.score !== null);
  return scoreThroughHolesPlayed.length;
};

export const fetchAllScoresAndPars = async (
  setScoresMap: (map: Record<number, ScoresRow[]>) => void,
  setTotalParMap: (map: Record<number, number>) => void,
  rounds: Round[]
) => {
  const scores: Record<number, ScoresRow[]> = {};
  const pars: Record<number, number> = {};
  const newscores: Record<number, ScoresRow[]> = {};
  const newpars: Record<number, number> = {};
  const courses: Record<number, Courses> = {};
  const roundIds: number[] = []
  const courseIds: string[] = []


  for (const round of rounds) {
    roundIds.push(round.id)
    courseIds.push(round.course_id)
    newscores[round.id] = []
  }

  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .in('CourseID', courseIds)

  for (const round of rounds) {
    if (coursesData) {
      for (const course of coursesData) {
        if (round.course_id == course.id) {

        }
      }
    }
  }


  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .in('round_id', roundIds)
    .order('hole', { ascending: true });

  if (data) {
    for (const score of data) {
      newscores[score.round_id].push(score)
    }
  }


  for (const round of rounds) {
    if (coursesData) {
      for (const course of coursesData) {
        if (round.course_id == course.id) {
          const coursePar = await fetchCoursePar(course, newscores[round.id], round.id);
          pars[round.id] = coursePar;
        }
      }
    }
  }
  let count = 0
  setScoresMap(newscores);
  setTotalParMap(pars);
};

const fetchPlayers = async (setPlayersMap: (
  map: Record<number, ProfilesRow[]>) => void,
  rounds: Round[]
) => {
  const roundIds = rounds.map(round => round.id);

  // Fetch all scores for the given round IDs
  const { data: scoresData, error: scoresError } = await supabase
    .from('scores')
    .select('round_id, player')
    .in('round_id', roundIds);

  if (scoresError) {
    console.error('Error fetching scores:', scoresError);
    return;
  }

  // Build a map from round_id -> Set of player IDs
  const roundToPlayerIds: Record<number, Set<string>> = {};
  const allPlayerIdsSet = new Set<string>();

  scoresData?.forEach(({ round_id, player }) => {
    if (!roundToPlayerIds[round_id]) roundToPlayerIds[round_id] = new Set();
    roundToPlayerIds[round_id].add(player);
    allPlayerIdsSet.add(player);
  });

  const allPlayerIds = Array.from(allPlayerIdsSet);

  // Fetch all player profiles in one call
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', allPlayerIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }

  // Map player ID to profile
  const profileMap: Record<string, ProfilesRow> = {};
  profilesData?.forEach(profile => {
    profileMap[profile.id] = profile;
  });

  // Build final playersMap: round_id -> [ProfilesRow]
  const playersMap: Record<number, ProfilesRow[]> = {};
  for (const roundId of roundIds) {
    const playerIds = Array.from(roundToPlayerIds[roundId] || []);
    playersMap[roundId] = playerIds.map(id => profileMap[id]).filter(Boolean);
  }

  setPlayersMap(playersMap);
};


const fetchCoursePar = async (course: Courses, scores: ScoresRow[], round_id: number): Promise<number> => {
  const holePars: Record<number, number | null> = {
    1: course.Par1,
    2: course.Par2,
    3: course.Par3,
    4: course.Par4,
    5: course.Par5,
    6: course.Par6,
    7: course.Par7,
    8: course.Par8,
    9: course.Par9,
    10: course.Par10,
    11: course.Par11,
    12: course.Par12,
    13: course.Par13,
    14: course.Par14,
    15: course.Par15,
    16: course.Par16,
    17: course.Par17,
    18: course.Par18,
  };

  const totalPar = scores.reduce((total, score) => {
    if (score.score != null) {
      let hole = holePars[score.hole]
      if (hole != null) {
        return total + hole
      }
    }
    return total
  }, 0);

  return totalPar;
};
