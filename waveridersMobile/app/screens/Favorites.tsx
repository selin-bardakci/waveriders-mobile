import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Colors from "../constants/Colors"; // Ensure this path is correct
import { useRouter } from 'expo-router';

// Define the Profile interface based on your backend response
interface Profile {
  id: string; // Assuming 'id' corresponds to 'user_id' in your User model
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  account_type: string;
}

// Define the Boat interface based on your backend response
interface Boat {
  favorite_id: string; // Unique identifier for the favorite entry
  boat_id: string;     // Unique identifier for the boat
  boat_name: string;
  type: string;
  overall_rating: string;
  driver_rating: string;
  cleanliness_rating: string;
  location: string;
  description: string;
  capacity: string;
  photos: string[];
}

const BACKEND_URL = 'http://10.0.2.2:3000'; // Consider using environment variables for flexibility

const Favorites = () => {
  const [selectedItem, setSelectedItem] = useState<Boat | null>(null);
  const [favorites, setFavorites] = useState<Boat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const router = useRouter();

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.get<Profile>(`${BACKEND_URL}/api/users/profile`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });

        const fullName = `${response.data.first_name} ${response.data.last_name}`;
        setName(fullName);
        setUserId(response.data.id);
      } else {
        console.error('No token found');
        Alert.alert("Authentication Error", "No token found. Please log in again.");
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert("Error", "Could not fetch user profile. Please try again later.");
      setLoading(false);
    }
  };

  // Function to fetch all favorites based on userId
  const getAllFavorites = async () => {
    try {
      if (!userId) {
        Alert.alert("Error", "User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get<{ favorites: Boat[] }>(`${BACKEND_URL}/api/auth/favorites?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data.favorites)) {
        setFavorites(response.data.favorites);
      } else {
        Alert.alert("Error", "Unexpected response format from server.");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      Alert.alert("Error", "Could not fetch favorites. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to remove a favorite from favorites table using favorite_id
  const removeFavorite = async (favoriteId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        return;
      }

      await axios.delete(`${BACKEND_URL}/api/auth/favorites/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavorites((prevFavorites) => prevFavorites.filter((boat) => boat.favorite_id !== favoriteId));
      Alert.alert("Success", "Boat removed from favorites.");
    } catch (error) {
      console.error("Error removing favorite:", error);
      Alert.alert("Error", "Could not remove favorite. Please try again.");
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch favorites when userId is set
  useEffect(() => {
    if (userId) {
      getAllFavorites();
    }
  }, [userId]);

  // Render each favorite boat item
  const renderItem = ({ item }: { item: Boat }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={async () => {
        // Save boat_id to AsyncStorage
        const boatid = item.boat_id
        await AsyncStorage.setItem('favorites_boat_id', boatid.toString());
        // Navigate to ListingCard screen
        router.push("/screens/ListingCard");
      }}
    >
      <Image
        source={{ uri: item.photos[0] || 'https://via.placeholder.com/500x300' }}
        style={styles.image}
      />

      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{item.boat_name}</Text>
        <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={16} color="#ffc000" />
          <Text style={styles.ratingText}>{item.overall_rating}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(item.favorite_id)}
      >
        <Text style={styles.removeButtonText}>Remove from wishlist</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Loading indicator
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#388FE6" />
        <Text>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Favorite Listings</Text>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.favorite_id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No favorite listings yet.</Text>}
        contentContainerStyle={favorites.length === 0 && styles.emptyContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  detailsContainer: {
    marginTop: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#888',
  },
  removeButton: {
    backgroundColor: '#2195f3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Favorites;
