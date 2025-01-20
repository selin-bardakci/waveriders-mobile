import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,

} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { format } from 'date-fns';

const placeholderImage = require('../../assets/avatar.png');

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

// Interfaces
interface Profile {
  id: number;
  first_name: string;
  last_name: string;
}

interface Yacht {
  boat_id: number;
  boat_name: string;
  photos: string[];
}

interface Rental {
  rental_id: number;
  boat_id: number;
  boat_name?: string;
  start_date: string;
  end_date?: string;
}

const Customer: React.FC = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState<string>('');
  const [favorites, setFavorites] = useState<Yacht[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [recentlyViewedBoats, setRecentlyViewedBoats] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Logout Function
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate(SCREEN_NAMES.Home as never);
    } catch (error) {
      console.error('Error during logout:', error);

    }
  };

  // Fetch User Profile, Favorites, and Rentals
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate(SCREEN_NAMES.Profile as never);
        return;
      }

      // Fetch User Profile
      const profileResponse = await axios.get('https://api.waveriders.com.tr/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Profile Response:', profileResponse.data);
      const fullName = `${profileResponse.data.first_name} ${profileResponse.data.last_name}`;
      setUserName(fullName);
      setUserId(profileResponse.data.id);

      // Fetch Favorites and Rentals in Parallel
      await Promise.all([
        fetchFavorites(token),
        fetchUpcomingTrips(token),
      ]);

      // Load Recently Viewed Boats
      await loadRecentlyViewed();
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Favorites
  const fetchFavorites = async (token: string) => {
    try {
      const favoriteBoatsResponse = await axios.get(
        'https://api.waveriders.com.tr/api/favorites/dashboard',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (favoriteBoatsResponse.status === 200) {
        const favoriteBoatsData = favoriteBoatsResponse.data;
        console.log('Favorite Boats API Response:', favoriteBoatsData);

        // Assuming the backend sends an array of boat objects
        const formattedFavorites = favoriteBoatsData.boats?.map((boat: Yacht) => ({
          boat_id: boat.boat_id, // Ensure this matches the backend's key for ID
          boat_name: boat.boat_name,
          photos: boat.photos && boat.photos.length > 0 ? boat.photos : ['https://via.placeholder.com/150'], // Always an array
        })) || [];

        setFavorites(formattedFavorites);
        console.log('Formatted Favorites:', formattedFavorites);
      } else {
        console.error('Failed to fetch favorite boats');

      }
    } catch (error) {
      console.error('Error fetching favorites:', error);

    }
  };

  // Fetch Upcoming Rentals with Boat Names
  const fetchUpcomingTrips = async (token: string) => {
    try {
      const response = await axios.get('https://api.waveriders.com.tr/api/rentals/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && response.data && Array.isArray(response.data.rentals)) {
        const rentals: Rental[] = response.data.rentals.slice(0, 3); // Limit to 3 rentals

        // Extract unique boat_ids
        const boatIds = [...new Set(rentals.map((rental) => rental.boat_id))];

        // Fetch boat names in parallel
        const boatPromises = boatIds.map((id) =>
          axios
            .get(`https://api.waveriders.com.tr/api/listings/${id}`)
            .then((res) => ({ id, boat_name: res.data.boat_name }))
            .catch((err) => {
              console.error(`Error fetching boat name for boat_id ${id}:`, err);
              return { id, boat_name: 'Unknown Boat' };
            })
        );

        const boats = await Promise.all(boatPromises);
        const boatMap = new Map<number, string>();
        boats.forEach((boat) => boatMap.set(boat.id, boat.boat_name));

        // Merge boat names into rentals
        const rentalsWithBoatNames: Rental[] = rentals.map((rental) => ({
          ...rental,
          boat_name: boatMap.get(rental.boat_id) || 'Boat Name Unavailable',
        }));

        setUpcomingTrips(rentalsWithBoatNames);
        console.log('Upcoming Trips:', rentalsWithBoatNames);
      } else {
        setUpcomingTrips([]);
      }
    } catch (error) {
      console.error('Error fetching upcoming rentals:', error);

    }
  };

  // Load Recently Viewed Boats from AsyncStorage
  const loadRecentlyViewed = async () => {
    try {
      const storedRecentlyViewed = await AsyncStorage.getItem('recentlyViewed');
      setRecentlyViewedBoats(storedRecentlyViewed ? JSON.parse(storedRecentlyViewed) : []);
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle Press on Favorite Boats
  const handleFavoritePress = async (boatId: number) => {
    try {
      await AsyncStorage.setItem('favorites_boat_id', boatId.toString());
      navigation.navigate(SCREEN_NAMES.ListingCard as never);
    } catch (error) {
      console.error('Error navigating to ListingCard:', error);
      Alert.alert('Error', 'Failed to navigate to ListingCard.');
    }
  };

  // Handle Press on Recently Viewed Boats
  const handleRecentlyViewedPress = (boatId: number) => {
    AsyncStorage.setItem('business_boat_id', boatId.toString());
    navigation.navigate(SCREEN_NAMES.ListingCard as never);
  };

  // Render Function for Favorite Boats
  const renderFavoriteYacht = ({ item }: { item: Yacht }) => {
    const imageUri = item.photos && item.photos.length > 0 ? item.photos[0] : 'https://via.placeholder.com/150';
    console.log('Rendering Favorite Yacht:', item);
    return (
      <TouchableOpacity onPress={() => handleFavoritePress(item.boat_id)} style={styles.yachtItem}>
        <Image
          source={{ uri: imageUri }}
          style={styles.yachtImage}
          resizeMode="cover"
          defaultSource={require('../../assets/avatar.png')} // Optional: Fallback image
        />
        <Text style={styles.yachtName}>{item.boat_name}</Text>
      </TouchableOpacity>
    );
  };

  // Render Function for Upcoming Trips
  const renderTrip = ({ item }: { item: Rental }) => {
    // Format dates using date-fns
    const startDate = format(new Date(item.start_date), 'MMM dd, yyyy');
    const endDate = item.end_date ? format(new Date(item.end_date), 'MMM dd, yyyy') : 'N/A';
    const tripDates = `${startDate} - ${endDate}`;

    return (
      <View key={item.rental_id.toString()} style={styles.tripItem}>
        <Text style={styles.tripName}>{item.boat_name}</Text>
        <Text style={styles.tripDates}>{tripDates}</Text>
      </View>
    );
  };

  // Render Function for Recently Viewed Boats
  const renderRecentlyViewedBoat = ({ item }: { item: any }) => {
      return (
        <TouchableOpacity onPress={() => handleRecentlyViewedPress(item.id)} style={styles.yachtItem}>
          <Image source={ item.image || 'https://via.placeholder.com/150' } style={styles.yachtImage} />
          <Text style={styles.yachtName}>{item.name}</Text>
        </TouchableOpacity>
      );
    }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#388FE6" />
        <Text>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      ListHeaderComponent={
        <View style={styles.container}>
          <Text style={styles.topHeader}>Dashboard</Text>
          <Image source={placeholderImage} style={styles.placeholderImage} />
          <Text style={styles.greeting}>Hi, {userName}</Text>
          <Text style={styles.subGreeting}>Manage your listings and bookings</Text>

          {/* Favorites Section */}
          <Text style={styles.sectionTitle}>Favorites</Text>
          {favorites.length > 0 ? (
            <FlatList
              data={favorites}
              renderItem={renderFavoriteYacht}
              keyExtractor={(item) => item.boat_id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noRecentlyViewedText}>No favorites found</Text>
          )}

          {/* Recently Viewed Section */}
          <Text style={styles.sectionTitle}>Recently Viewed</Text>
          {recentlyViewedBoats.length > 0 ? (
            <FlatList
              data={recentlyViewedBoats}
              renderItem={renderRecentlyViewedBoat}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noRecentlyViewedText}>No recently viewed boats</Text>
          )}

          {/* Upcoming Trips Section */}
          <Text style={styles.sectionTitle}>Upcoming Trips</Text>
          {upcomingTrips.length > 0 ? (
            <FlatList
              data={upcomingTrips}
              renderItem={renderTrip}
              keyExtractor={(item) => item.rental_id.toString()}
            />
          ) : (
            <Text style={styles.noRecentlyViewedText}>No upcoming trips</Text>
          )}

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      }
    />
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
    // fontFamily: 'mon-b', // Ensure the font is loaded or remove if not used
  },
  placeholderImage: {
    width: 170,
    height: 170,
    borderRadius: 75,
    marginBottom: 20,
    alignSelf: 'center',
  },
  greeting: {
    fontSize: 24,
    marginBottom: 5,
    alignSelf: 'center',
    // fontFamily: 'mon-sb', // Ensure the font is loaded or remove if not used
  },
  subGreeting: {
    fontSize: 14,
    color: '#888',
    alignSelf: 'center',
    // fontFamily: 'mon', // Ensure the font is loaded or remove if not used
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    alignSelf: 'flex-start',
    // fontFamily: 'mon-sb', // Ensure the font is loaded or remove if not used
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
    // fontFamily: 'mon-sb', // Ensure the font is loaded or remove if not used
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecentlyViewedText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  tripItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
  },
  tripDates: {
    fontSize: 14,
    color: '#555',
  },
});

export default Customer;
