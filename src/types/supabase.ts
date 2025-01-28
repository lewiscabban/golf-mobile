// Import the Database type
import { Database } from '../../database.types';

// Refer to a specific table type
export type CoursesRow = Database['public']['Tables']['courses']['Row'];
export type ClubRow = Database['public']['Tables']['clubs']['Row'];
export type TeeRow = Database['public']['Tables']['tees']['Row'];
export type CoordinateRow = Database['public']['Tables']['coordinates']['Row'];
export type RoundsRow = Database['public']['Tables']['rounds']['Row'];
export type ScoresRow = Database['public']['Tables']['scores']['Row'];

// Refer to Insert and Update types
type CourseInsert = Database['public']['Tables']['courses']['Insert'];
type CourseUpdate = Database['public']['Tables']['courses']['Update'];
