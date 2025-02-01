import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, List, Avatar, Switch, Portal, Modal, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, logout } from '../../store/slices/authSlice';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editableProfile, setEditableProfile] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
  });
  const [notifications, setNotifications] = useState(true);

  const handleUpdateProfile = async () => {
    try {
      await dispatch(updateProfile(editableProfile)).unwrap();
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      // Navigation will be handled by auth listener
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfilePicture = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets?.[0]?.uri) {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      try {
        await dispatch(updateProfilePicture(formData));
      } catch (error) {
        console.error('Failed to update profile picture:', error);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image
          size={100}
          source={user.profilePicture ? { uri: user.profilePicture } : require('../../assets/default-avatar.png')}
        />
        <Button onPress={handleProfilePicture}>
          Modifier la photo
        </Button>
        <Text variant="headlineSmall" style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text variant="bodyLarge" style={styles.rating}>
          ⭐ {user.rating || '4.5'} ({user.totalDeliveries || '0'} livraisons)
        </Text>
      </View>

      <List.Section>
        <List.Subheader>Informations personnelles</List.Subheader>
        <List.Item
          title="Email"
          description={user.email}
          left={props => <List.Icon {...props} icon="email" />}
        />
        <List.Item
          title="Téléphone"
          description={user.phone}
          left={props => <List.Icon {...props} icon="phone" />}
        />
        <List.Item
          title="Véhicule"
          description={user.vehicle?.model || 'Non spécifié'}
          left={props => <List.Icon {...props} icon="car" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Paramètres</List.Subheader>
        <List.Item
          title="Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
            />
          )}
        />
        <List.Item
          title="Documents"
          description="Gérer vos documents"
          left={props => <List.Icon {...props} icon="file-document" />}
          onPress={() => navigation.navigate('Documents')}
        />
        <List.Item
          title="Statistiques"
          description="Voir vos performances"
          left={props => <List.Icon {...props} icon="chart-bar" />}
          onPress={() => navigation.navigate('Statistics')}
        />
      </List.Section>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => setShowEditModal(true)}
          style={styles.button}
        >
          Modifier le profil
        </Button>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.button}
        >
          Se déconnecter
        </Button>
      </View>

      <Portal>
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Modifier le profil
          </Text>
          <TextInput
            label="Prénom"
            value={editableProfile.firstName}
            onChangeText={value => setEditableProfile(prev => ({ ...prev, firstName: value }))}
            style={styles.input}
          />
          <TextInput
            label="Nom"
            value={editableProfile.lastName}
            onChangeText={value => setEditableProfile(prev => ({ ...prev, lastName: value }))}
            style={styles.input}
          />
          <TextInput
            label="Téléphone"
            value={editableProfile.phone}
            onChangeText={value => setEditableProfile(prev => ({ ...prev, phone: value }))}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={editableProfile.email}
            onChangeText={value => setEditableProfile(prev => ({ ...prev, email: value }))}
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleUpdateProfile}
            style={styles.button}
          >
            Enregistrer
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  rating: {
    marginTop: 5,
    color: '#666',
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginVertical: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
});

export default ProfileScreen;
