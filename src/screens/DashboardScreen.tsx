import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ScoresRow, ProfilesRow } from '../types/supabase';
import { Courses } from "../utils/scoresUtils"
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for the friends icon

type Round = {
  course_id: string
  created_at: string
  id: number
}

type DashboardStackParamList = {
  ProfileStack: { screen: string; params: { RoundID: number } };
  Friends: undefined; // Define the FriendRequests screen
  PlayRound: { RoundID: number }; // Define the FriendRequests screen
};

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [scoresMap, setScoresMap] = useState<Record<number, ScoresRow[]>>({});
  const [holesPlayedMap, setHolesPlayedMap] = useState<Record<number, number>>({});
  const [parMap, setParMap] = useState<Record<number, number>>({});
  const [courseNames, setCourseNames] = useState<Record<string, string>>({});
  const [clubNames, setClubNames] = useState<Record<string, string>>({});
  const [courseClubMap, setCourseClubMap] = useState<Record<string, string>>({});
  const [playersMap, setPlayersMap] = useState<Record<number, ProfilesRow[]>>({}); // For storing player names for each round
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRounds = async () => {
    // TODO: split up per player
    setLoading(true);
    const { data, error } = await supabase
      .from('rounds')
      .select('course_id::text, created_at, id')
      .order('created_at', { ascending: false });


    if (error) {
      console.error('Error fetching rounds:', error);
      Alert.alert('Error', 'Failed to fetch rounds. Please try again.');
    } else {
      setRounds(data || []);
      await fetchAllScoresAndPars(data || []);
      await fetchCourseAndClubNames(data || []);
      await fetchPlayers(data || []); // Fetch players for each round
    }
    setLoading(false);
    setRefreshing(false);
  };

  const fetchCourseAndClubNames = async (rounds: Round[]) => {
    const courseIds = rounds.map((round) => round.course_id).filter((id) => id != null);

    if (courseIds.length > 0) {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('CourseID::text, CourseName, ClubID::text')
        .in('CourseID', courseIds);

      if (coursesError) {
        console.error('Error fetching course names:', coursesError);
        Alert.alert('Error', 'Failed to fetch course names.');
        return;
      }

      const courseNameMap: Record<string, string> = {};
      const clubIdSet = new Set<string>();
      const courseClubMap: Record<string, string> = {};

      (coursesData as Partial<Courses>[]).forEach((course) => {
        if (course.CourseID && course.CourseName) {
          courseNameMap[course.CourseID] = course.CourseName;
          if (course.ClubID) {
            courseClubMap[course.CourseID] = course.ClubID;
            clubIdSet.add(course.ClubID);
          }
        }
      });

      setCourseNames(courseNameMap);
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

  const fetchScores = async (roundId: number): Promise<ScoresRow[]> => {
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

  const calculateTotalScore = (scores: ScoresRow[], player: ProfilesRow | null = null): number => {
    if (player) {
      scores = scores.filter(score => score.player === player.id)
    }
    return scores.reduce((total, score) => total + (score.score || 0), 0);
  };

  const calculateHolesPlayed = (scores: ScoresRow[], player: ProfilesRow | null = null): number => {
    if (player) {
      scores = scores.filter(score => score.player === player.id)
    }
    return scores.filter(score => score.score !== null).length;
  };

  const fetchAllScoresAndPars = async (rounds: Round[]) => {
    const scores: Record<number, ScoresRow[]> = {};
    const pars: Record<number, number> = {};

    for (const round of rounds) {
      scores[round.id] = await fetchScores(round.id);

      if (round.course_id) {
        const coursePar = await fetchCoursePar(round.course_id, scores[round.id]);
        pars[round.id] = coursePar;
      }
    }

    setScoresMap(scores);
    setParMap(pars);
  };

  const fetchPlayers = async (rounds: Round[]) => {
    const playersMap: Record<number, ProfilesRow[]> = {};

    for (const round of rounds) {
      const { data, error } = await supabase
        .from('scores')
        .select('player')
        .eq('round_id', round.id);

      if (error) {
        console.error('Error fetching players:', error);
        continue;
      }

      const playerIds: string[] = data?.map((score) => score.player);
      if (playerIds?.length) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', playerIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          continue;
        }

        playersMap[round.id] = profilesData || [];
      }
    }

    setPlayersMap(playersMap);
  };

  const fetchCoursePar = async (courseId: string, scores: ScoresRow[]): Promise<number> => {
    const { data, error } = await supabase
      .from('courses')
      .select('Par1, Par2, Par3, Par4, Par5, Par6, Par7, Par8, Par9, Par10, Par11, Par12, Par13, Par14, Par15, Par16, Par17, Par18')
      .eq('CourseID', courseId)
      .single();

    if (error) {
      console.error('Error fetching course par:', error);
      return 0;
    }

    const course = data as Courses;
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

  useEffect(() => {
    fetchRounds();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRounds();
  };

  const renderRound = ({ item }: { item: Round }) => {
    const courseName = courseNames[item.course_id] || 'ADD LATER';
    const clubId = item.course_id ? courseClubMap[item.course_id] : null;
    const clubName = clubId ? clubNames[clubId] : 'ADD LATER';
    const createdAt = new Date(item.created_at).toLocaleDateString(); // Format date
    const players = playersMap[item.id] || []; // List of players
  
    return (
      <TouchableOpacity 
        style={styles.roundContainer} 
        onPress={() => handleNavigateToPlayRound(item.id)}
      >
        <View style={styles.roundHeader}>
          <Text style={styles.clubName}>{clubName}</Text>
          <Text style={styles.roundInfo}>{createdAt} - {courseName} - 18 Holes</Text>
        </View>
  
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Player</Text>
          <Text style={styles.headerText}>Score</Text>
          <Text style={styles.headerText}>Gross</Text>
          <Text style={styles.headerText}>Par</Text>
        </View>
  
        {players.map((player) => {
          const totalScore = calculateTotalScore(scoresMap[item.id], player);
          const grossScore = `+${(totalScore - (parMap[item.id] || 0))}`;
          const totalPar = parMap[item.id];
  
          return (
            <View key={player.id} style={styles.tableRow}>
              <Text style={styles.rowText}>{player.username}</Text>
              <Text style={styles.rowText}>{totalScore}</Text>
              <Text style={styles.rowText}>{grossScore}</Text>
              <Text style={styles.rowText}>{totalPar}</Text>
            </View>
          );
        })}
  
        <Ionicons name="chevron-forward" size={24} color="#000" style={styles.arrowIcon} />
      </TouchableOpacity>
    );
  };

  const handleNavigateToPlayRound = (roundID: number) => {
    navigation.navigate('PlayRound', { RoundID: roundID });
  };

  const navigateToFriendRequests = () => {
    navigation.navigate('Friends');
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={navigateToFriendRequests} style={styles.headerButton}>
          <Ionicons name="people" size={30} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={rounds}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRound}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  list: {
    paddingBottom: 16,
  },
  roundItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  roundText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerButton: {
    paddingRight: 10,
    paddingVertical: 10,
  },
  roundContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative', // For the icon positioning
  },
  roundHeader: {
    marginBottom: 8,
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  roundInfo: {
    fontSize: 14,
    color: '#666',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0, // Only this border remains
    borderBottomColor: '#ccc',
    paddingBottom: 4,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  arrowIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
});

export default DashboardScreen;
