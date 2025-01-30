import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RoundsRow, ScoresRow, CoursesRow } from '../types/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for the friends icon

type DashboardStackParamList = {
  ProfileStack: { screen: string; params: { RoundID: number } };
  Friends: undefined; // Define the FriendRequests screen
};

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const [rounds, setRounds] = useState<RoundsRow[]>([]);
  const [scoresMap, setScoresMap] = useState<Record<number, number>>({});
  const [parMap, setParMap] = useState<Record<number, number>>({});
  const [courseNames, setCourseNames] = useState<Record<number, string>>({});
  const [clubNames, setClubNames] = useState<Record<number, string>>({});
  const [courseClubMap, setCourseClubMap] = useState<Record<number, number>>({});
  const [playersMap, setPlayersMap] = useState<Record<number, string[]>>({}); // For storing player names for each round
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRounds = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('rounds').select('*');

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

  const fetchCourseAndClubNames = async (rounds: RoundsRow[]) => {
    const courseIds = rounds.map((round) => round.course_id).filter((id) => id != null);

    if (courseIds.length > 0) {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('CourseID, CourseName, ClubID')
        .in('CourseID', courseIds);

      if (coursesError) {
        console.error('Error fetching course names:', coursesError);
        Alert.alert('Error', 'Failed to fetch course names.');
        return;
      }

      const courseNameMap: Record<number, string> = {};
      const clubIdSet = new Set<number>();
      const courseClubMap: Record<number, number> = {};

      (coursesData as Partial<CoursesRow>[]).forEach((course) => {
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
          .select('ClubID, ClubName')
          .in('ClubID', Array.from(clubIdSet));

        if (clubsError) {
          console.error('Error fetching club names:', clubsError);
          Alert.alert('Error', 'Failed to fetch club names.');
          return;
        }

        const clubNameMap: Record<number, string> = {};
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

  const calculateTotalScore = (scores: ScoresRow[]): number => {
    return scores.reduce((total, score) => total + (score.score || 0), 0);
  };

  const fetchAllScoresAndPars = async (rounds: RoundsRow[]) => {
    const scores: Record<number, number> = {};
    const pars: Record<number, number> = {};

    for (const round of rounds) {
      const roundScores = await fetchScores(round.id);
      scores[round.id] = calculateTotalScore(roundScores);

      if (round.course_id) {
        const coursePar = await fetchCoursePar(round.course_id, roundScores);
        pars[round.id] = coursePar;
      }
    }

    setScoresMap(scores);
    setParMap(pars);
  };

  const fetchPlayers = async (rounds: RoundsRow[]) => {
    const playersMap: Record<number, string[]> = {};

    for (const round of rounds) {
      const { data, error } = await supabase
        .from('scores')
        .select('player')
        .eq('round_id', round.id);

      if (error) {
        console.error('Error fetching players:', error);
        continue;
      }

      const playerIds = data?.map((score) => score.player);
      if (playerIds?.length) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('username')
          .in('id', playerIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          continue;
        }

        const playerNames = profilesData?.map((profile) => profile.username);
        playersMap[round.id] = playerNames || [];
      }
    }

    setPlayersMap(playersMap);
  };

  const fetchCoursePar = async (courseId: number, scores: ScoresRow[]): Promise<number> => {
    const { data, error } = await supabase
      .from('courses')
      .select('Par1, Par2, Par3, Par4, Par5, Par6, Par7, Par8, Par9, Par10, Par11, Par12, Par13, Par14, Par15, Par16, Par17, Par18')
      .eq('CourseID', courseId)
      .single();

    if (error) {
      console.error('Error fetching course par:', error);
      return 0;
    }

    const course = data as CoursesRow;
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

  const renderRound = ({ item }: { item: RoundsRow }) => {
    const totalScore = scoresMap[item.id] || 0;
    const totalPar = parMap[item.id] || 0;
    const golfScore = totalPar > 0 ? totalScore - totalPar : 'Loading...'; //TODO: this will calculate for all players in the round need to make a score per player
    const courseName = courseNames[item.course_id] || 'Loading...';
    const clubId = item.course_id ? courseClubMap[item.course_id] : null;
    const clubName = clubId ? clubNames[clubId] : 'No Club';
    const players = playersMap[item.id]?.join(', ') || 'Loading...'; // Display player names

    return (
      <TouchableOpacity
        style={styles.roundItem}
        onPress={() => handleNavigateToPlayRound(item.id)}
      >
        <Text style={styles.roundText}>Course: {courseName}</Text>
        <Text style={styles.roundText}>Club: {clubName}</Text>
        <Text style={styles.roundText}>Players: {players}</Text>
        <Text style={styles.roundText}>Golf Score: {golfScore}</Text>
      </TouchableOpacity>
    );
  };

  const handleNavigateToPlayRound = (roundID: number) => {
    navigation.navigate('ProfileStack', {
      screen: 'PlayRound',
      params: { RoundID: roundID },
    });
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
      <Text style={styles.title}>Welcome to Your Dashboard!</Text>
      <Text style={styles.subtitle}>Track your golf scores and manage your account here.</Text>

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
    paddingTop: 50,
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
});

export default DashboardScreen;
