import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const yachtImage = require('assets/images/yacht.png');
const zahaImage = require('assets/images/zaha.jpg');
const handleLogout = async (router: any) => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.setItem("isLoggedIn", "false");
  await AsyncStorage.removeItem("usertype");
  router.push('../HomeScreen');
};
interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  account_type: string;
}

type Yacht = {
  id: string;
  name: string;
  image: any;
};

const recentlyViewedYachts: Yacht[] = [
  { id: '4', name: 'Coral Reef', image: yachtImage },
  { id: '5', name: 'Blue Horizon', image: yachtImage },
  { id: '6', name: 'Wave Rider', image: yachtImage },
];

const upcomingTrips: { id: string; name: string; dates: string }[] = [
  { id: '1', name: 'Beach Getaway', dates: 'Jan 8 - Jan 9' },
  { id: '2', name: 'Mountain Retreat', dates: 'Feb 14 - Feb 16' },
  { id: '3', name: 'City Tour', dates: 'Mar 20 - Mar 21' },
];

const Customer: React.FC = () => {
  const router = useRouter();
  const [showBoatDetail, setShowBoatDetail] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Yacht[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const BACKEND_URL = 'http://10.0.2.2:3000';

  // Fetch user profile and the latest 3 favorites
  const fetchUserProfileAndFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const profileResponse = await axios.get<Profile>(`${BACKEND_URL}/api/users/profile`, {
          headers: { Authorization: 'Bearer ' + token },
        });
        const fullName = `${profileResponse.data.first_name} ${profileResponse.data.last_name}`;
        setUserName(fullName);
        setUserId(profileResponse.data.id);
        await fetchLatestFavorites(profileResponse.data.id, token);
      } else {
        router.push('/screens/profile');
      }
    } catch (error) {
      console.error('Error fetching user profile or favorites:', error);
      Alert.alert('Error', 'Could not fetch user profile or favorites. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch the latest 3 favorites based on userId
  const fetchLatestFavorites = async (userId: number, token: string) => {
    try {
      const response = await axios.get<{ favorites: any[] }>(
        `${BACKEND_URL}/api/auth/favorites?user_id=${userId}&limit=3`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && Array.isArray(response.data.favorites)) {
        const mappedFavorites: Yacht[] = response.data.favorites.map((fav) => ({
          id: fav.boat_id.toString(),
          name: fav.boat_name,
          image: fav.photos && fav.photos.length > 0 ? { uri: fav.photos[0] } : yachtImage,
        }));
        setFavorites(mappedFavorites);
      } else {
        Alert.alert('Error', 'Unexpected response format from server.');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Error', 'Could not fetch favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfileAndFavorites();
  }, []);

  // Navigate to ListingCard when a yacht is selected
  const handleYachtPress = async(boatId: string) => {
    await AsyncStorage.setItem('favorites_boat_id', boatId)
    router.push(`/screens/ListingCard`); // Pass the boat ID to the ListingCard screen
  };

  const renderYacht = ({ item }: { item: Yacht }) => (
    <TouchableOpacity onPress={() => handleYachtPress(item.id)} style={styles.yachtItem}>
      <Image source={item.image} style={styles.yachtImage} />
      <Text style={styles.yachtName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleFavoriteToggle = async (boatId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (token && userId) {
        const response = await axios.post(
          `${BACKEND_URL}/api/auth/favorite`,
          { boat_id: boatId, user_id: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Could not toggle favorite. Please try again later.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2195f3" />
        <Text>Loading favourites...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.topHeader}>Dashboard</Text>

      <Image source={zahaImage} style={styles.placeholderImage} />

      <View>
        <Text style={styles.greeting}>Hi, {userName}</Text>
        <Text style={styles.subGreeting}>You're all set to book a boat</Text>
      </View>

      <View style={styles.listingHeaderContainer}>
        <Text style={styles.sectionTitle}>Favorites</Text>
        <TouchableOpacity onPress={() => router.push('/screens/Favorites')}>
          <Ionicons name="arrow-forward" size={24} color="#388FE6" />
        </TouchableOpacity>
      </View>

      {/* FlatList for Favorites */}
      <FlatList
        data={favorites}
        renderItem={renderYacht}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.favouritesList}
      />

      <Text style={styles.sectionTitle}>Recently Viewed</Text>
      <FlatList
        data={recentlyViewedYachts}
        renderItem={renderYacht}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.favouritesList}
      />

      <Text style={styles.sectionTitle}>Upcoming Trips</Text>
      <View style={styles.upcomingTripsContainer}>
        {upcomingTrips.map((trip) => (
          <View key={trip.id} style={styles.tripItem}>
            <Text style={styles.tripName}>{trip.name}</Text>
            <Text style={styles.tripDates}>{trip.dates}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>LogOut</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');
const yachtWidth = width * 0.6;
const yachtHeight = yachtWidth * 0.6;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  topHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    fontFamily: 'mon-b',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    marginBottom: 5,
    alignSelf: 'flex-start',
    fontFamily: 'mon-sb',
  },
  subGreeting: {
    fontSize: 14,
    color: '#888',
    alignSelf: 'flex-start',
    fontFamily: 'mon',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    alignSelf: 'flex-start',
    fontFamily: 'mon-sb',
  },
  favouritesList: {
    paddingVertical: 10,
  },
  yachtItem: {
    width: yachtWidth,
    marginRight: 15,
    alignItems: 'center',
  },
  yachtImage: {
    width: yachtWidth,
    height: yachtHeight,
    borderRadius: 15,
    marginBottom: 10,
  },
  yachtName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'mon-sb',
  },
  logoutButton: {
    backgroundColor: '#388FE6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listingHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Customer;
