import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';
import HoleModal from '../components/HoleModal';
import { fetchCoursePar } from '../utils/scoresUtils';

type Score = {
  hole: number;
  score: number | null;
  player: string;
  profiles: { username: string };
};

type Par = {
  hole: number;
  par: number | null;
};

type PlayerScores = {
  player_id: string;
  player_name: string;
  scores: { [hole: number]: number | null };
};

type ProfileStackParamList = {
  PlayRound: { RoundID: number };
};

const PlayRoundScreen: React.FC = () => {
  const route = useRoute<RouteProp<ProfileStackParamList, 'PlayRound'>>();
  const { RoundID } = route.params;

  const [playerScores, setPlayerScores] = useState<PlayerScores[]>([]);
  const [holes, setHoles] = useState<number[]>([]);
  const [parValues, setParValues] = useState<(number | string)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedHole, setSelectedHole] = useState<{ hole: number; player_id: string } | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const { data: scoresData, error } = await supabase
          .from('scores')
          .select('hole, score, player, profiles(username)')
          .eq('round_id', RoundID)
          .order('hole', { ascending: true }) as unknown as { data: Score[]; error: any };

        
        const { data: roundData, error: roundError } = await supabase
          .from('rounds')
          .select('course_id::text')
          .eq('id', RoundID)
    
        if (error) throw error;
        if (roundError) throw roundError;
    
        const scoresByPlayer: { [key: string]: PlayerScores } = {};
        const holeSet = new Set<number>();
        let parMap: Record<number, number | null> = []

        if ( roundData.length === 1 ) {
          parMap = await fetchCoursePar(roundData[0].course_id);
        }
    
        scoresData.forEach((score) => {
          const playerId = score.player;
          const playerName = score.profiles.username;
          
          if (!scoresByPlayer[playerId]) {
            scoresByPlayer[playerId] = { player_id: playerId, player_name: playerName, scores: {} };
          }
          
          scoresByPlayer[playerId].scores[score.hole] = score.score;
          holeSet.add(score.hole);
        });
    
        const sortedHoles = [...holeSet].sort((a, b) => a - b);
        setHoles(sortedHoles);
        setParValues(sortedHoles.map((hole) => parMap[hole] || 'N/A'));
        setPlayerScores(Object.values(scoresByPlayer));
      } catch (err) {
        console.error('Fetch Scores Error:', err);  // Log error for debugging
        Alert.alert('Error', `Something went wrong. Please try again.`);
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

  const handleSaveScore = async (hole: number, player_id: string, newScore: number) => {
    try {
      const { error } = await supabase
        .from('scores')
        .update({ score: newScore })
        .eq('round_id', RoundID)
        .eq('hole', hole)
        .eq('player', player_id);

      if (error) throw error;

      setPlayerScores((prevScores) =>
        prevScores.map((player) =>
          player.player_id === player_id
            ? { ...player, scores: { ...player.scores, [hole]: newScore } }
            : player
        )
      );

      handleCloseModal();
    } catch (err) {
      Alert.alert('Error', `Could not save score. Please try again.`);
    }
  };

  const calculateTotalScore = (player: string): number => {
    let totalScore = 0
    playerScores.filter((score) => score.player_name === player).map((player) => (
        holes.map((hole) => (
          totalScore += player.scores[hole] || 0
        ))
    ))
    return totalScore
  };

  const calculateTotalPar = (): number => {
    let totalPar = 0
    parValues.map((player) => (
      totalPar += Number(player) || 0
    ))
    return totalPar
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={[styles.headerRow, styles.topHeaderRowLeft]}>
          <Text style={styles.playerName}>Holes</Text>
          <Text style={styles.playerScore}>Score</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.playerName}>Par</Text>
          <Text style={styles.playerScore}>{calculateTotalPar()}</Text>
        </View>
        {playerScores.map((player, index) => (
          <View
            key={player.player_id}
            style={[
              styles.playerRow,
              index % 2 === 1 ? styles.alternateRow : null, // Apply alternate color to every second row
              index === playerScores.length - 1 ? styles.lastRow : null
            ]}
          >
            <Text style={[styles.playerName, styles.playerHeigth]}>{player.player_name}</Text>
            <Text style={[styles.playerScore, styles.playerHeigth]}>{calculateTotalScore(player.player_name)}</Text>
          </View>
        ))}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
      >
        <View>
          <View style={[styles.headerRow, styles.topHeaderRowRight]}>
            {holes.map((hole) => (
              <Text key={hole} style={styles.headerCell}>{hole}</Text>
            ))}
          </View>
          <View style={styles.headerRow}>
            {parValues.map((par, index) => (
              <Text key={index} style={styles.headerCell}>{par}</Text>
            ))}
          </View>
          {playerScores.map((player, index) => (
            <View
              key={player.player_id}
              style={[
                styles.playerRow,
                index % 2 === 1 ? styles.alternateRow : null, // Apply alternate color to every second row
                index === playerScores.length - 1 ? styles.lastRow : null
              ]}
            >
              {holes.map((hole) => (
                <TouchableOpacity
                  key={hole}
                  style={styles.scoreCell}
                  onPress={() => handleOpenModal(hole, player.player_id)}
                >
                  <Text style={[styles.scoreText, styles.playerHeigth]}>{player.scores[hole] ?? '-'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

        </View>
        {selectedHole && (
          <HoleModal
            visible={modalVisible}
            holeNumber={selectedHole.hole}
            onClose={handleCloseModal}
            onSave={(holeNumber, newScore) => handleSaveScore(holeNumber, selectedHole.player_id, newScore)}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flexDirection: 'row' },
  headerRow: { flexDirection: 'row', backgroundColor: '#c8f7c5', padding: 10},
  topHeaderRowLeft: { borderTopLeftRadius: 8 },
  topHeaderRowRight: { borderTopRightRadius: 8 },
  headerCell: { width: 50, textAlign: 'center', fontWeight: 'bold' },
  playerRow: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  playerName: { width: 80, fontWeight: 'bold' },
  playerScore: { width: 40, fontWeight: 'bold', textAlign: 'center', },
  playerHeigth: { height: 25 },
  scoreCell: { width: 50, justifyContent: 'center', alignItems: 'center' },
  scoreText: { fontSize: 16, fontWeight: '600' },
  alternateRow: { backgroundColor: '#F1FFF5' },
  lastRow: { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
});

export default PlayRoundScreen;
