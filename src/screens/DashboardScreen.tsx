import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Button } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ScoresRow, ProfilesRow } from '../types/supabase';
import { Courses } from "../utils/scoresUtils"
import { fetchRounds, Round, INITIAL_ITEMS, calculateTotalScore, calculateParThroughHolesPlayed, calculateHolesPlayed, fetchMoreRounds } from "../utils/dashboardUtils"
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for the friends icon

type DashboardStackParamList = {
  ProfileStack: { screen: string; params: { RoundID: number } };
  Friends: undefined; // Define the FriendRequests screen
  PlayRound: { RoundID: number }; // Define the FriendRequests screen
};

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const [userId, setUserId] = useState<string | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [scoresMap, setScoresMap] = useState<Record<number, ScoresRow[]>>({});
  const [totalParMap, setTotalParMap] = useState<Record<number, number>>({});
  const [courseNames, setCourseNames] = useState<Record<string, string>>({});
  const [courseHoles, setCourseHoles] = useState<Record<string, number>>({});
  const [clubNames, setClubNames] = useState<Record<string, string>>({});
  const [courseClubMap, setCourseClubMap] = useState<Record<string, string>>({});
  const [playersMap, setPlayersMap] = useState<Record<number, ProfilesRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(INITIAL_ITEMS);

  useEffect(() => {
    if (userId) {
      fetchRounds(
        userId,
        itemsPerPage,
        setLoading,
        setMoreLoading,
        setRefreshing,
        setRounds,
        setScoresMap,
        setTotalParMap,
        setCourseNames,
        setCourseHoles,
        setCourseClubMap,
        setClubNames,
        setPlayersMap
      );
    }
  }, [userId]);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user ID:', error);
      } else {
        setUserId(data.user?.id || null);
      }
    };
    fetchUserId();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await fetchRounds(
        userId,
        itemsPerPage,
        setLoading,
        setMoreLoading,
        setRefreshing,
        setRounds,
        setScoresMap,
        setTotalParMap,
        setCourseNames,
        setCourseHoles,
        setCourseClubMap,
        setClubNames,
        setPlayersMap
      );
    }
  };

  const renderRound = ({ item }: { item: Round }) => {
    const courseName = courseNames[item.course_id] || 'Loading';
    const clubId = item.course_id ? courseClubMap[item.course_id] : null;
    const clubName = clubId ? clubNames[clubId] : 'Loading';
    const createdAt = new Date(item.created_at).toLocaleDateString(); // Format date
    const players = playersMap[item.id] || []; // List of players
    let totalPar = `${totalParMap[item.id]}`;
    const holes = courseHoles[item.course_id]
  
    return (
      <TouchableOpacity 
        style={styles.roundContainer} 
        onPress={() => handleNavigateToPlayRound(item.id)}
      >
        <View style={styles.roundHeader}>
          <Text style={styles.clubName}>{clubName}</Text>
          <Text style={styles.roundInfo}>{createdAt} - {courseName} - {holes} Holes</Text>
        </View>
  
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Player</Text>
          <Text style={styles.headerText}>Score</Text>
          <Text style={styles.headerText}>Gross</Text>
          <Text style={styles.headerText}>Holes</Text>
        </View>
  
        {players.map((player) => {
          const totalScore = calculateTotalScore(scoresMap[item.id], player);
          const parThroughHolesPlayed = calculateParThroughHolesPlayed(scoresMap[item.id], item.id, player)
          const score = (totalScore - (parThroughHolesPlayed || 0))
          const holesPlayed = calculateHolesPlayed(scoresMap[item.id], item.id, player)
          let grossScore = score < 1 ? `${score}` : `+${score}`;
          if (parThroughHolesPlayed == 0) {
            grossScore = "N/A";
            totalPar = "N/A";
          }
  
          return (
            <View key={player.id} style={styles.tableRow}>
              <Text style={styles.rowText}>{player.username}</Text>
              <Text style={styles.rowText}>{totalScore}</Text>
              <Text style={styles.rowText}>{grossScore}</Text>
              <Text style={styles.rowText}>{holesPlayed}/{holes}</Text>
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
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={rounds}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRound}
            contentContainerStyle={styles.list}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => (
              <View>
                {hasMore && !moreLoading && (
                  <Button
                    title="Load More"
                    onPress={() =>
                      userId &&
                      fetchMoreRounds(
                        userId,
                        itemsPerPage,
                        hasMore,
                        setMoreLoading,
                        setRefreshing,
                        setRounds,
                        setScoresMap,
                        setTotalParMap,
                        setCourseNames,
                        setCourseHoles,
                        setCourseClubMap,
                        setClubNames,
                        setPlayersMap,
                        setItemsPerPage,
                        setHasMore
                      )
                    }
                  />
                )}
                {moreLoading && <ActivityIndicator size="large" />}
              </View>
            )}
          />
        )}
      </View>
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
