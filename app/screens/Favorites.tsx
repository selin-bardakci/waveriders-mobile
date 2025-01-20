import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';


const SCREEN_NAMES = {
  Home: 'Home',
  Trips: 'Trips',
  Favorites: 'Favorites',
  ListingCard: 'ListingCard',
  Inbox: 'Inbox',
  Profile: 'Profile',
  Customer: 'Customer',
  Business: 'Business',
};

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Boat {
  favorite_id: string;
  boat_id: string;
  boat_name: string;
  overall_rating: string;
  photos: string[];
}



const Favorites = () => {
  const [favorites, setFavorites] = useState<Boat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const navigation = useNavigation();

  const fetchFavorites = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      
      if (!token || !userId) {
        Alert.alert('Error', 'You must be logged in to view favorites.');
        navigation.navigate(SCREEN_NAMES.Profile as never);
        return;
      }

      const response = await axios.get('https://api.waveriders.com.tr/api/favorites/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.favorites) {
        setFavorites(response.data.favorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      setFavorites([]);
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to perform this action.');
        return;
      }

      await axios.delete("https://api.waveriders.com.tr/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
        data: { boat_id: favoriteId },
      });

      setFavorites((prevFavorites) => prevFavorites.filter((item) => item.favorite_id !== favoriteId));
      Alert.alert('Success', 'Favorite removed successfully.');
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Unable to remove favorite. Please try again.');
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#388FE6" />
        <Text>Loading favorites...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Boat }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.setItem('favorites_boat_id', item.boat_id.toString());
          navigation.navigate('ListingCard' as never);
        }}
      >
        <Image
          source={{ uri: item.photos[0] || 'https://via.placeholder.com/500x300' }}
          style={styles.image}
        />
        <View style={styles.details}>
          <Text style={styles.boatName}>{item.boat_name}</Text>
          <View style={styles.rating}>
            <FontAwesome name="star" size={16} color="#ffc000" />
            <Text style={styles.ratingText}>{item.overall_rating || 'N/A'}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(item.favorite_id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Favorite Boats</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.favorite_id}
        renderItem={renderItem}
        contentContainerStyle={favorites.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={<Text style={styles.emptyText}>No favorites found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginVertical: 8,
    padding: 12,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  details: {
    marginTop: 8,
  },
  boatName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#888',
  },
  removeButton: {
    backgroundColor: '#388FE6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Favorites;
