import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';
import HoleModal from '../components/HoleModal';

type Score = {
  hole: number;
  score: number | null;
  player: string;
  profiles: { username: string };
};


type PlayerScores = {
  player_id: string;
  player_name: string;
  scores: Score[];
};

type ProfileStackParamList = {
  Profile: undefined;
};

const PlayRoundScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { RoundID } = route.params as { RoundID: number };

  const [playerScores, setPlayerScores] = useState<PlayerScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHole, setSelectedHole] = useState<{ hole: number; player_id: string } | null>(
    null
  );

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const { data: scoresData, error } = await supabase
          .from('scores')
          .select('hole, score, player, profiles(username)')
          .eq('round_id', RoundID)
          .order('hole', { ascending: true }) as unknown as { data: Score[]; error: any };
    
        if (error) {
          console.error('Error fetching scores:', error);
          Alert.alert('Error', 'Failed to load scores.');
          return;
        }
    
        const scoresByPlayer: { [key: string]: PlayerScores } = {};
        scoresData.forEach((score) => {
          const playerId = score.player;
          const playerName = score.profiles.username;
    
          if (!scoresByPlayer[playerId]) {
            scoresByPlayer[playerId] = {
              player_id: playerId,
              player_name: playerName,
              scores: [],
            };
          }
          scoresByPlayer[playerId].scores.push(score);
        });
    
        setPlayerScores(Object.values(scoresByPlayer));
      } catch (err) {
        console.error('Unexpected error:', err);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    

    fetchScores();
  }, [RoundID]);

  const handleOpenModal = (hole: number, player_id: string) => {
    setSelectedHole({ hole, player_id });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedHole(null);
    setModalVisible(false);
  };

  const handleSaveScore = async (holeNumber: number, player: string, newScore: number) => {
    try {
      const { error } = await supabase
        .from('scores')
        .update({ score: newScore })
        .eq('round_id', RoundID)
        .eq('hole', holeNumber)
        .eq('player', player); // Use `player` instead of `player_id`
  
      if (error) {
        console.error('Error updating score:', error);
        Alert.alert('Error', 'Failed to update the score.');
      } else {
        setPlayerScores((prevScores) =>
          prevScores.map((p) =>
            p.player_id === player
              ? {
                  ...p,
                  scores: p.scores.map((score) =>
                    score.hole === holeNumber ? { ...score, score: newScore } : score
                  ),
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      handleCloseModal();
    }
  };

  const renderHoleButton = ({ item }: { item: Score }) => (
    <View style={styles.holeContainer}>
      <Text style={styles.holeLabel}>Hole {item.hole}</Text>
      <TouchableOpacity
        style={styles.holeButton}
        onPress={() => handleOpenModal(item.hole, item.player)}
      >
        <Text style={styles.holeScore}>{item.score !== null ? item.score : '-'}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading scores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play Round</Text>
      {playerScores.map((player) => (
        <View key={player.player_id} style={styles.playerContainer}>
          <Text style={styles.playerName}>{player.player_name}</Text>
          <FlatList
            data={player.scores}
            keyExtractor={(item) => `${player.player_id}-${item.hole}`}
            renderItem={renderHoleButton}
            horizontal
            contentContainerStyle={styles.holeList}
          />
        </View>
      ))}
      <HoleModal
        visible={modalVisible}
        holeNumber={selectedHole?.hole ?? null} // Ensure it’s either a number or null
        onClose={handleCloseModal}
        onSave={(hole, newScore) =>
          handleSaveScore(hole, selectedHole?.player_id ?? '', newScore)
        }
      />
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
  playerContainer: {
    marginBottom: 20,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  holeList: {
    paddingVertical: 16,
  },
  holeContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  holeLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  holeButton: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 2,
  },
  holeScore: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default PlayRoundScreen;
