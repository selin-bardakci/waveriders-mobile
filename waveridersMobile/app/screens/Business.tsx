import { Ionicons } from '@expo/vector-icons'; // Import the Ionicons library
import axios from 'axios'; // Import the axios library
import { useRouter } from 'expo-router'; // Import the useRouter hook
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const rafaImage = require("assets/images/zaha.jpg");

type Yacht = {
  id: string;
  name: string;
  image: any;
};

interface Profile {
  user_id: number;
  business_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_address: string;
  user_image: string;
  business_name: string;
  user_profile_picture: string;
}

interface Boat {
  boat_id: number;
  boat_business_id: number;
  boat_name: string;
  boat_description: string;
  boat_registration: string;
  boat_trip_type: string;
  boat_price_per_hour: number;
  boat_price_per_day: number;
  boat_capacity: number;
  boat_type: string;
  boat_location: string;
  boat_available: boolean;
  boat_created_at: string;
  boat_image: string;
}

const handleLogout = async (router: any) => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.setItem("isLoggedIn", "false");
  await AsyncStorage.removeItem("usertype");
  router.push('/screens/profile');
};

const getProfile = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await axios.get('http://10.0.2.2:3000/api/users/business', {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
  console.log('Profile data:', response.data);
  return response.data;
};

const getBoats = async (b_id: number) => {
  const token = await AsyncStorage.getItem('token');
  try {
    const response = await axios.get("http://10.0.2.2:3000/api/auth/boat", {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      params: {
        business_id: b_id,
      },
    });
    console.log('Boats data:', response.data);
    return response.data.boats || []; // Ensure it always returns an array
  } catch (error) {
    console.error('Error fetching boats data:', error);
    return []; // Return empty array in case of error
  }
};

const BusinessDashboard = () => {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [boats, setBoats] = React.useState<Boat[]>([]);
  const [favorites, setFavorites] = React.useState<Yacht[]>([]); // Updated type to Yacht[]
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const [businessID, setBusinessID] = React.useState<number | null>(null);

  const fetchUserProfileAndFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Fetch profile data
      const profileData = await getProfile();
      console.log('Profile data:', profileData);
      setProfile(profileData);

      // Fetch business ID and boats data
        const businessID = await profileData.user_id;
        console.log('Business ID:', businessID);
        setBusinessID(businessID);

        const boatData = await getBoats(businessID);
        setBoats(boatData);

        await fetchLatestFavorites(profileData.user_id, token);
      
    } catch (error) {
      console.error('Error fetching user profile and favorites:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestFavorites = async (userId: number, token: string) => {
    try {
      const response = await axios.get<{ favorites: any[] }>(
        'http://10.0.2.2:3000/api/auth/favorites?user_id=${userId}&limit=3', // Ensure your backend supports the 'limit' parameter
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      // Map the fetched favorites to match the Yacht type
      if (response.data && Array.isArray(response.data.favorites)) {
        const mappedFavorites: Yacht[] = response.data.favorites.map((fav) => ({
          id: fav.boat_id.toString(),
          name: fav.boat_name,
          image: fav.photos && fav.photos.length > 0 ? { uri: fav.photos[0] } : { uri: 'https://via.placeholder.com/160x90' },
        }));
        setFavorites(mappedFavorites);
      } else {
        Alert.alert("Error", "Unexpected response format from server.");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      Alert.alert("Error", "Could not fetch favorites. Please try again later.");
    }
  };

  const handleManageButtonClick = () => {
    AsyncStorage.setItem('business_boat_id', JSON.stringify(boats[0].boat_id));
    console.log('Boat details stored in AsyncStorage:', boats[0].boat_id);
    router.push('/screens/ListingCard');
  };


  useEffect(() => {
    console.log('Dashboard screen loaded');
    fetchUserProfileAndFavorites();
  }, []);


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#388FE6" />
      </View>
    );
  }
  function renderYacht({ item }: { item: any }) {
    return (
      <TouchableOpacity style={styles.yachtItem}>
        <Image source={{ uri: item.image }} style={styles.yachtImage} />
        <Text style={styles.yachtName}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.topHeader}>Dashboard</Text>

      <Image source={rafaImage} style={styles.placeholderImage} />

      <View>
        <Text style={styles.greeting}>Hi, {profile?.business_name}</Text>
        <Text style={styles.subtitle}>You're all set to book a boat</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>Average Rating</Text>
          <Text style={styles.statValue}>4.9</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>Customers</Text>
          <Text style={styles.statValue}>1,400</Text>
        </View>
      </View>

      {/* Listings Section with Arrow */}
      <View style={styles.listingHeaderContainer}>
        <Text style={styles.sectionTitle}>Listings</Text>
        <TouchableOpacity onPress={() => router.push('/screens/BusinessListing')}>
          <Ionicons name="arrow-forward" size={24} color="#388FE6" />
        </TouchableOpacity>
      </View>

      {/* Boat listings */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listingsContainer}>
        {boats.map((boat) => (
          <View key={boat.boat_id} style={styles.listingCard}>
            <Image
              source={{ uri: boat.photos[0] || 'https://via.placeholder.com/358x201' }} // Boat image
              style={styles.listingImage}
            />
            <View style={styles.listingContent}>
              <Text style={styles.listingTitle}>{boat.boat_name}</Text>
              <Text style={styles.listingDetails}>{boat.boat_capacity} guests · {boat.boat_trip_type}</Text>
              <Text style={styles.listingLocation}>{boat.boat_location}</Text>
            </View>
          </View>
        ))}
      </ScrollView>


{/* Add Arrow to Favorites */}
<View style={styles.listingHeaderContainer}>
  <Text style={styles.sectionTitle}>Favorites</Text>
  <TouchableOpacity onPress={() => router.push('/screens/Favorites')}>
    <Ionicons name="arrow-forward" size={24} color="#388FE6" />
  </TouchableOpacity>
</View>

{/* FlatList for Favorites */}
<FlatList
  data={favorites} // Changed from favouriteYachts to fetched favorites
  renderItem={renderYacht}
  keyExtractor={(item) => item.id}
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.favouritesList}
/>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => handleLogout(router)}>
        <Text style={styles.logoutButtonText}>LogOut</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    fontFamily: 'mon-sb',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'mon',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statBox: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1DBE6',
  },
  statTitle: {
    fontSize: 16,
    color: '#0D141C',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D141C',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D141C',
    marginVertical: 16,
  },
  listingHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingsContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listingCard: {
    width: 300,
    marginRight: 16,
    backgroundColor: '#F7FAFA',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  listingImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  listingContent: {
    marginTop: 16,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D141C',
  },
  listingDetails: {
    fontSize: 16,
    color: '#4F7396',
    marginTop: 4,
  },
  listingLocation: {
    fontSize: 16,
    color: '#4F7396',
    marginTop: 4,
    marginBottom: 16,
  },
  yachtItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  yachtImage: {
    width: 160,
    height: 90,
    borderRadius: 15,
    marginBottom: 10,
  },
  yachtName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  favouritesList: {
    paddingVertical: 10,
  },
  logoutButton: {
    backgroundColor: '#388FE6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 60,
    alignSelf: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BusinessDashboard;
