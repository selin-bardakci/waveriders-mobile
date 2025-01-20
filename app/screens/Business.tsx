import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { format, set } from 'date-fns';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const placeholderImage = require('../../assets/captain.png');

type Yacht = {
  boat_id: number;
  boat_name: string;
  location: string;
  photos: string[];
};

interface Rental {
  rental_id: number;
  boat_id: number;
  boat_name?: string;
  start_date: string;
  end_date: string;
  photos?: string[];
}

interface Rating {
  general_rating: number;
  driver_rating: number;
  cleanliness_rating: number;
  review_text?: string;
}

interface BookingDetails {
  rental_id: string;
  boat_id: string;
  name?: string;
  start_date: string; // 'YYYY-MM-DD' format
  end_date?: string;  // 'YYYY-MM-DD' format, optional
  start_time?: string; // 'HH:mm' format, optional
  end_time?: string;  // 'HH:mm' format, optional
  total_price: number; // Changed from rental_price to total_price
  status: string;
  rating?: Rating | null; // Rating structure
  boat_name?: string; // Added to store boat name
}

const SCREEN_NAMES = {
  Home: 'Home',
  Trips: 'Trips',
  Favorites: 'Favorites',
  ListingCard: 'ListingCard',
  Inbox: 'Inbox',
  Profile: 'Profile',
  Customer: 'Customer',
  Business: 'Business',
  BusinessListing: 'BusinessListing',
};

const Business = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] =useState<{ id: number; business_name: string } | null>(null);
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState<Yacht[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<BookingDetails[]>([]);
  const [recentlyViewedBoats, setRecentlyViewedBoats] = useState([]);

  const fetchProfileAndListings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate(SCREEN_NAMES.Profile as never);
        return;
      }

      const profileResponse = await axios.get('https://api.waveriders.com.tr/api/business/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(profileResponse.data);


      await fetchUpcomingTrips(token);
      await loadRecentlyViewed();
    } catch (error) {
      console.error('Error fetching profile or listings or favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoritePress = async (boatId: number) => {
    try {
      await AsyncStorage.setItem('favorites_boat_id', boatId.toString());
      navigation.navigate(SCREEN_NAMES.ListingCard as never);
    } catch (error) {
      console.error('Error navigating to ListingCard:', error);
      Alert.alert('Error', 'Failed to navigate to ListingCard.');
    }
  };

  const fetchUpcomingTrips = async (token: string) => {
    try {
      const response = await axios.get('https://api.waveriders.com.tr/api/rentals/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if(response.status === 200) {
      setUpcomingTrips(response.data || []);
      } else {
        throw new Error('Failed to fetch recent rentals');
      }
    } catch (error) {
      console.error('Error fetching upcoming trips:', error);

    }
  };

  const loadRecentlyViewed = async () => {
    try {
      const storedRecentlyViewed = await AsyncStorage.getItem('recentlyViewed');
      setRecentlyViewedBoats(storedRecentlyViewed ? JSON.parse(storedRecentlyViewed) : []);
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate(SCREEN_NAMES.Profile as never);
  };

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

  
        // Assuming the backend sends an array of boat objects
        const formattedFavorites = favoriteBoatsData.boats?.map((boat: Yacht) => ({
          boat_id: boat.boat_id, // Adjust if backend uses a different key for ID
          boat_name: boat.boat_name,
          photos: boat.photos || ['https://via.placeholder.com/150'], // Placeholder if no photos
        })) || [];
        setFavorites(formattedFavorites);

      } else {
        console.error('Failed to fetch favorite boats');

      }
    } catch (error) {
      console.error('Error fetching favorites:', error);

    }
  };

  const fetchListing = async (token:string) =>{
    try {
      const response = await axios.get(
        "https://api.waveriders.com.tr/api/business/listings",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setListings(response.data.boats || []);

    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  useEffect(() => {
    fetchProfileAndListings();
    (async () => {
      const token = await AsyncStorage.getItem('token');
      if(token){
        fetchFavorites(token);
        fetchListing(token);
      } else {
        navigation.navigate(SCREEN_NAMES.Profile as never);
      }
    })();
  }, []);

  const renderListingItem = ({ item }: { item: { boat_id: number; boat_name: string; capacity: number; boat_trip_type: string; photos: string[] } }) => (
    <TouchableOpacity style={styles.listingCard} onPress={() => {
      AsyncStorage.setItem('business_boat_id', item.boat_id.toString());
      navigation.navigate(SCREEN_NAMES.ListingCard as never)}}>
      <Image
        source={{ uri: item.photos[0] || 'https://via.placeholder.com/150' }}
        style={styles.listingImage}
      />
      <Text style={styles.listingTitle}>{item.boat_name}</Text>
      <Text style={styles.listingDetails}>{item.capacity} guests · {item.boat_trip_type}</Text>
    </TouchableOpacity>
  );

  const renderFavoriteItem = ({ item }: { item: Yacht }) => (
    <TouchableOpacity style={styles.favoriteItem} onPress={() => {handleFavoritePress(item.boat_id)}}>
      <Image
        source={{ uri: item.photos[0] || 'https://via.placeholder.com/150' }}
        style={styles.favoriteImage}
      />
      <Text style={styles.favoriteName}>{item.boat_name}</Text>
    </TouchableOpacity>
  );

  const handleRecentlyViewedPress = (boatId: number) => {
    AsyncStorage.setItem('business_boat_id', boatId.toString());
    navigation.navigate(SCREEN_NAMES.ListingCard as never);
  };

  const renderRecentlyViewedBoat = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity onPress={() => handleRecentlyViewedPress(item.id)} style={styles.yachtItem}>
        <Image source={ item.image || 'https://via.placeholder.com/150' } style={styles.yachtImage} />
        <Text style={styles.yachtName}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  const renderTrip = ({ item }: { item: BookingDetails }) => {
    // Format dates using date-fns
    const startDate = format(new Date(item.start_date), 'MMM dd, yyyy');
    const endDate = item.end_date ? format(new Date(item.end_date), 'MMM dd, yyyy') : 'N/A';
    const tripDates = `${startDate} - ${endDate}`;

    return (
      <View key={item.rental_id.toString()} style={styles.tripItem}>
        <Text style={styles.tripName}>{item.boat_name || 'Boat Name Unavailable'}</Text>
        <Text style={styles.tripDates}>{tripDates}</Text>
      </View>
    );
  };

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
          <Text style={styles.greeting}>Hi, {profile?.business_name}</Text>
          <Text style={styles.subtitle}>Manage your listings and bookings</Text>

          <View style={styles.listingsHeader}>
            <Text style={styles.sectionTitle}>Listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.BusinessListing as never)} style={styles.arrowIconContainer}>
              <Ionicons name="arrow-forward" size={24} color="#388FE6" />
            </TouchableOpacity>
          </View>
          {listings.length > 0 ? (
            <FlatList
              data={listings}
              renderItem={renderListingItem}
              keyExtractor={(item) => item.boat_id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noRecentlyViewedText}>No listings found</Text>
          )}

          <View style={styles.listingsHeader}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.Favorites as never)} style={styles.arrowIconContainer}>
              <Ionicons name="arrow-forward" size={24} color="#388FE6" />
            </TouchableOpacity>
          </View>
          {favorites.length > 0 ? (
            <FlatList
              data={favorites}
              renderItem={renderFavoriteItem}
              keyExtractor={(item) => item.boat_id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noRecentlyViewedText}>No favorites found</Text>
          )}

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

          <Text style={styles.sectionTitle}>Upcoming Trips</Text>
          {upcomingTrips.length > 0 ? (
            <FlatList
              data={upcomingTrips}
              renderItem={renderTrip}
              keyExtractor={(item) => item.rental_id}
            />
          ) : (
            <Text style={styles.noRecentlyViewedText}>No upcoming trips</Text>
          )}

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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
    alignSelf: 'center',
  },
  listingHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  listingsList: {
    paddingVertical: 10,
  },
  listingCard: {
    width: 300,
    marginRight: 15,
  },
  listingImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  favouritesList: {
    paddingVertical: 10,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  listingDetails: {
    fontSize: 14,
    color: '#666',
  },
  favoritesList: {
    paddingVertical: 10,
  },
  favoriteItem: {
    width: 200,
    marginRight: 15,
  },
  favoriteImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
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
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  upcomingTripsContainer: {
    marginBottom: 20,
  },
  noTripsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  arrowIconContainer: {
    paddingLeft: 10,
  },
  noRecentlyViewedText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default Business;