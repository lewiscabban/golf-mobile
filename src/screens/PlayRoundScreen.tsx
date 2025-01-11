import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';
import HoleModal from '../components/HoleModal';

type Score = {
  hole: number;
  score: number | null;
};

type ProfileStackParamList = {
  Profile: undefined;
};

const PlayRoundScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { RoundID } = route.params as { RoundID: number };

  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHole, setSelectedHole] = useState<number | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('scores')
          .select('hole, score')
          .eq('round_id', RoundID);

        if (error) {
          console.error('Error fetching scores:', error);
          Alert.alert('Error', 'Failed to load scores.');
        } else {
          // Sort the holes to always display in order from 1 to 18
          const sortedScores = (data || []).sort((a, b) => a.hole - b.hole);
          setScores(sortedScores);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [RoundID]);

  const handleOpenModal = (hole: number) => {
    setSelectedHole(hole);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedHole(null);
    setModalVisible(false);
  };

  const handleSaveScore = async (holeNumber: number, newScore: number) => {
    try {
      // Update the score for the given hole
      const { error } = await supabase
        .from('scores')
        .update({ score: newScore })
        .eq('round_id', RoundID)
        .eq('hole', holeNumber);

      if (error) {
        console.error('Error updating score:', error);
        Alert.alert('Error', 'Failed to update the score.');
      } else {
        // Update the state with the new score
        setScores((prevScores) =>
          prevScores.map((score) =>
            score.hole === holeNumber ? { ...score, score: newScore } : score
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
        onPress={() => {
          setSelectedHole(item.hole);
          setModalVisible(true);
        }}
      >
        <Text style={styles.holeScore}>{item.score !== null ? item.score : '-'}</Text>
      </TouchableOpacity>
    </View>
  );

  // Add the exit button to reset the stack
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // This removes the back button
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Profile' }],
            });
          }}
          style={styles.exitButton}
        >
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
      <FlatList
        data={scores}
        keyExtractor={(item) => item.hole.toString()}
        renderItem={renderHoleButton}
        horizontal
        contentContainerStyle={styles.holeList}
      />
      <HoleModal
        visible={modalVisible}
        holeNumber={selectedHole}
        onClose={handleCloseModal}
        onSave={handleSaveScore}
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
  exitButton: {
    marginRight: 10,
    padding: 8,
  },
  exitText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlayRoundScreen;
