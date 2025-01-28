import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Button,
  Modal,
} from 'react-native';
import { supabase } from '../supabase/supabaseClient';

const SettingsScreen = () => {
  const [profile, setProfile] = useState<{
    first_name: string;
    full_name: string | null;
    id: string;
    last_name: string;
    updated_at: string | null;
    username: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState('');
  const [updatedProfile, setUpdatedProfile] = useState({
    first_name: '',
    last_name: '',
    username: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching user:', userError);
        Alert.alert('Error', 'Failed to get user data.');
        setLoading(false);
        return;
      }

      const user = userData?.user;
      if (!user) {
        Alert.alert('Error', 'No authenticated user found.');
        setLoading(false);
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to fetch profile.');
      } else {
        setProfile(profileData);
        setUpdatedProfile({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          username: profileData.username,
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    setEditing(!editing);
    if (!editing && profile) {
      setUpdatedProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        username: profile.username,
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: updatedProfile.first_name,
        last_name: updatedProfile.last_name,
        username: updatedProfile.username,
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } else {
      Alert.alert('Success', 'Profile updated successfully.');
      setProfile((prev) => ({
        ...prev!,
        ...updatedProfile,
      }));
      setEditing(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profile) return;
  
    if (confirmUsername !== profile.username) {
      Alert.alert('Error', 'Username does not match. Please try again.');
      return;
    }
  
    try {
      // Update the profile to set `to_be_deleted` to true
      const { error } = await supabase
        .from('profiles')
        .update({ to_be_deleted: true })
        .eq('id', profile.id);
  
      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to mark profile for deletion.');
        return;
      }
  
      Alert.alert(
        'Account Marked for Deletion',
        'Your account has been marked for deletion. You will be logged out.'
      );
  
      // Log the user out
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) {
        console.error('Error signing out:', logoutError);
        Alert.alert('Error', 'Failed to log out. Please try again.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };
  

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Failed', error.message);
    } else {
      Alert.alert('Logged Out', 'You have been logged out successfully.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No profile found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>First Name:</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={updatedProfile.first_name}
              onChangeText={(text) =>
                setUpdatedProfile((prev) => ({ ...prev, first_name: text }))
              }
            />
          ) : (
            <Text style={styles.value}>{profile.first_name}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Last Name:</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={updatedProfile.last_name}
              onChangeText={(text) =>
                setUpdatedProfile((prev) => ({ ...prev, last_name: text }))
              }
            />
          ) : (
            <Text style={styles.value}>{profile.last_name}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Username:</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={updatedProfile.username}
              onChangeText={(text) =>
                setUpdatedProfile((prev) => ({ ...prev, username: text }))
              }
            />
          ) : (
            <Text style={styles.value}>{profile.username}</Text>
          )}
        </View>

        {editing ? (
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleUpdateProfile}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleEditToggle}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setDeleteModalVisible(true)}
      >
        <Text style={styles.buttonText}>Delete Profile</Text>
      </TouchableOpacity>

      <Button title="Logout" onPress={handleLogout} />

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Profile Deletion</Text>
            <Text>Enter your username to confirm:</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={confirmUsername}
              onChangeText={setConfirmUsername}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleDeleteProfile}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  profileSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
});

export default SettingsScreen;
