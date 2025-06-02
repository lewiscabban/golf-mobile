import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Modal, Pressable } from 'react-native';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseClient';
import HoleModal from '../components/HoleModal';
import { fetchCoursePar } from '../utils/scoresUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileModal from '../components/ProfileModal';

type Score = {
  hole: number;
  score: number | null;
  par: number | null;
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
  pars: { [hole: number]: number | null };
  scores: { [hole: number]: number | null };
};

type ProfileStackParamList = {
  PlayRound: { RoundID: number };
};

const PlayRoundScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const route = useRoute<RouteProp<ProfileStackParamList, 'PlayRound'>>();
  const { RoundID } = route.params;
  const [userId, setUserId] = useState<string | null>(null);
  const [playerScores, setPlayerScores] = useState<PlayerScores[]>([]);
  const [holes, setHoles] = useState<number[]>([0,1,2,3,4,5,6,7,8,9]);
  const [parValues, setParValues] = useState<(number | string)[]>(["...", "...", "...", "...", "...", "...", "...", "...", "..."]);
  const [loading, setLoading] = useState<boolean>(true);
  const [holeModalVisible, setHoleModalVisible] = useState<boolean>(false);
  const [profileModalVisible, setProfileModalVisible] = useState<boolean>(false);
  const [selectedHole, setSelectedHole] = useState<{ hole: number; player_id: string } | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setOptionsModalVisible(true)} style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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

  const confirmDeleteRound = async () => {
    setOptionsModalVisible(false);

    Alert.alert(
      "Delete Round?",
      "Are you sure you want to delete this round? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              if (!userId) {
                Alert.alert("Error", "User not authenticated.");
                return;
              }
              const { error } = await supabase.from('scores').delete().eq('round_id', RoundID).eq('player', userId);
              if (error) throw error;
              Alert.alert("Round Deleted", "The round has been successfully deleted.");
              const { data, error: scoresError } = await supabase.from('scores').select('*').eq('round_id', RoundID);
              if ( data && data.length === 0 ) {
                const { error } = await supabase.from('rounds').delete().eq('id', RoundID);
                if (error) throw error;
              }
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", "Failed to delete round. Please try again.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const { data: scoresData, error } = await supabase
          .from('scores')
          .select('hole, par, score, player, profiles(username)')
          .eq('round_id', RoundID)
          .order('hole', { ascending: true }) as unknown as { data: Score[]; error: any };

        console.log("setting up subscription!")
        const subscription = supabase
        .channel(`scores-updates-${RoundID}`) // Unique channel for this round
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "scores", filter: `round_id=eq.${RoundID}` },
          (payload) => {
            console.log("Received score update:", payload);
            console.log(playerScores)
            let newPlayerScores = [...playerScores]
            for (let i = 0; i < newPlayerScores.length; i++) {
              if (newPlayerScores[i].player_id == payload.new.player) {
                console.log("received update from player: ", newPlayerScores[i].player_id)
                newPlayerScores[i].scores[payload.new.hole] = payload.new.score
              }
            }
            setPlayerScores(newPlayerScores)
          }
        )
        .subscribe();
        console.log("set up subscription!")

        
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
            scoresByPlayer[playerId] = { player_id: playerId, player_name: playerName, pars: {}, scores: {} };
          }
          
          scoresByPlayer[playerId].scores[score.hole] = score.score;
          scoresByPlayer[playerId].pars[score.hole] = score.par;
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

  useEffect(() => {
    const fetchScores = async () => {
        const subscription = supabase
        .channel(`scores-updates-${RoundID}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "scores", filter: `round_id=eq.${RoundID}` },
          (payload) => {
            let newPlayerScores = [...playerScores]
            for (let i = 0; i < newPlayerScores.length; i++) {
              if (newPlayerScores[i].player_id == payload.new.player) {
                newPlayerScores[i].scores[payload.new.hole] = payload.new.score
              }
            }
            setPlayerScores(newPlayerScores)
          }
        )
        .subscribe();
      }
    fetchScores();
  }, [playerScores]);

  const handleOpenHoleModal = (hole: number, player_id: string) => {
    setSelectedHole({ hole, player_id });
    setHoleModalVisible(true);
  };

  const handleCloseHoleModal = () => {
    setSelectedHole(null);
    setHoleModalVisible(false);
  };

  const handleOpenProfileModal = (player_id: string) => {
    setSelectedPlayer(player_id);
    setProfileModalVisible(true);
  };

  const handleCloseProfileModal = () => {
    setSelectedPlayer(null);
    setProfileModalVisible(false);
  };

  const handleSaveScore = async (hole: number, player_id: string, newScore: number) => {
    try {
      let userCanEdit = false
      for (let i = 0; i < playerScores.length; i++) {
        if (playerScores[i].player_id === userId) {userCanEdit = true}
      }
      if (!userCanEdit) {
        Alert.alert('Error', `Only players can edit scores in this game.`)
      } else {
        const { data, error } = await supabase
          .from('scores')
          .update({ score: newScore, par: parValues[hole-1] })
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
      }

      handleCloseHoleModal();
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
    {/* Options Modal */}
    <Modal 
      visible={optionsModalVisible} 
      transparent 
      animationType="fade"
      onRequestClose={() => setOptionsModalVisible(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setOptionsModalVisible(false)}>
        <View style={styles.optionsModal}>
          <TouchableOpacity style={styles.optionButton} onPress={confirmDeleteRound}>
            <Text style={styles.optionText}>Delete Round</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>

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
            <TouchableOpacity
              key={player.player_id}
              // style={styles.scoreCell}
              onPress={() => handleOpenProfileModal(player.player_id)}
            >
              <Text style={[styles.playerName, styles.playerHeigth]}>{player.player_name}</Text>
            </TouchableOpacity>
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
                  onPress={() => handleOpenHoleModal(hole, player.player_id)}
                >
                  <Text style={[styles.scoreText, styles.playerHeigth]}>{player.scores[hole] ?? '-'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

        </View>
        {selectedHole && (
          <HoleModal
            visible={holeModalVisible}
            holeNumber={selectedHole.hole}
            onClose={handleCloseHoleModal}
            onSave={(holeNumber, newScore) => handleSaveScore(holeNumber, selectedHole.player_id, newScore)}
          />
        )}

        {selectedPlayer && (
          <ProfileModal
            visible={profileModalVisible}
            playerId={selectedPlayer}
            onClose={handleCloseProfileModal}
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
  headerButton: { paddingRight: 10, paddingVertical: 10 },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    justifyContent: 'flex-start', 
    alignItems: 'flex-end' 
  },
  optionsModal: { 
    backgroundColor: '#fff', 
    padding: 10, 
    borderRadius: 8, 
    marginTop: 60, 
    marginRight: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 5 
  },
  optionButton: { paddingVertical: 10, paddingHorizontal: 15 },
  optionText: { fontSize: 16, color: 'red' },
});

export default PlayRoundScreen;
