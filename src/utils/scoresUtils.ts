// utils/scoresUtils.ts

import { supabase } from '../supabase/supabaseClient';
import { ScoresRow } from '../types/supabase';

export type Courses = {
  ClubID: string
  ClubName: string
  CourseID: string
  CourseName: string
  MeasureMeters: number
  NumHoles: number
  Par1: number | null
  Par10: number | null
  Par11: number | null
  Par12: number | null
  Par13: number | null
  Par14: number | null
  Par15: number | null
  Par16: number | null
  Par17: number | null
  Par18: number | null
  Par2: number | null
  Par3: number | null
  Par4: number | null
  Par5: number | null
  Par6: number | null
  Par7: number | null
  Par8: number | null
  Par9: number | null
  ParW1: number | null
  ParW10: number | null
  ParW11: number | null
  ParW12: number | null
  ParW13: number | null
  ParW14: number | null
  ParW15: number | null
  ParW16: number | null
  ParW17: number | null
  ParW18: number | null
  ParW2: number | null
  ParW3: number | null
  ParW4: number | null
  ParW5: number | null
  ParW6: number | null
  ParW7: number | null
  ParW8: number | null
  ParW9: number | null
  TimestampUpdated: number | null
}

// Fetch the scores for a particular round
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

// Fetch course par values for a particular course
export const fetchCoursePar = async (courseId: string): Promise<Record<number, number | null>> => {
  const { data, error } = await supabase
    .from('courses')
    .select('Par1, Par2, Par3, Par4, Par5, Par6, Par7, Par8, Par9, Par10, Par11, Par12, Par13, Par14, Par15, Par16, Par17, Par18, NumHoles')
    .eq('CourseID', courseId)
    .single();

  if (error) {
    console.error('Error fetching course par:', error);
    return [];
  }

  const course = data as Courses
  let holePars: Record<number, number | null> = {};

  for (let i = 1; i <= course.NumHoles; i++) {
    const rawValue = course[`Par${i}` as keyof typeof course];
  
    let parsed: number | null = null;
  
    if (rawValue !== null && rawValue !== undefined) {
      const num = Number(rawValue);
      parsed = isNaN(num) ? null : num;
    }
  
    holePars[i] = parsed;
  }
  return holePars
  };

// Fetch course par values for a particular course
export const fetchCourseNumHoles = async (courseId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('courses')
    .select('NumHoles')
    .eq('CourseID', courseId)
    .single();

  if (error) {
    console.error('Error fetching course par:', error);
    return -1;
  }

  const course = data as Courses

  return course.NumHoles
};

// Function to fetch players for each round
export const fetchPlayersForRound = async (roundId: number): Promise<string[]> => {
  const { data, error } = await supabase
    .from('scores')
    .select('player')
    .eq('round_id', roundId);

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }

  return data?.map((score) => score.player) || [];
};

// Function to calculate total score for a player
export const calculateTotalScore = (scores: ScoresRow[], player: string): number => {
  return scores
    .filter((score) => score.player === player)
    .reduce((total, score) => total + (score.score || 0), 0);
};

// Function to calculate total holes played by a player
export const calculateHolesPlayed = (scores: ScoresRow[], player: string): number => {
  return scores.filter((score) => score.player === player && score.score !== null).length;
};
