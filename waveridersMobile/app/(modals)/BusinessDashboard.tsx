import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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


const getBusinessID = async (u_id : number) => {
  console.log('Fetching business ID...',u_id);
  const token = await AsyncStorage.getItem('token');

  try {
    const response = await axios.get(`http://10.0.2.2:3000/api/auth/businessID`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      params: {
        user_id: u_id,
      },
    });

    console.log('Business ID:', response.data.business_id);
    return response.data.business_id;
  } catch (error) {
    console.error('Error fetching business ID:', error);
    return null;
  }
};

const getBoats = async (b_id: number) => {
  const token = await AsyncStorage.getItem('token');
  b_id = 130;

  try {
    const response = await axios.get(`http://10.0.2.2:3000/api/auth/boat`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      params: {
        business_id: b_id,
      },
    });

    console.log('Boats data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching boats data:', error);
    return [];  // Return empty array in case of error
  }
};

const BusinessDashboard = () => {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [boats, setBoats] = React.useState<Boat[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const [businessID, setBusinessID] = React.useState<number | null>(null);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile data
        const profileData = await getProfile();

        setProfile(profileData);

        if (profileData?.id) {
          // Get the business ID using user_id
          const businessID = await getBusinessID(profileData.id);
          setBusinessID(businessID);
        }
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);

      }

        console.log('Fetching boats...');

        // Fetch boats using business_id
        const boatData = await getBoats(businessID);
        setBoats(boatData.boats);
      
    };
    fetchData();
  }, []);

  const handleManageButtonClick = () => {
    AsyncStorage.setItem('business_boat_id', JSON.stringify(boats[0].boat_id));
    console.log('Boat details stored in AsyncStorage:', boats[0].boat_id);
    router.push('/ListingCard');
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#388FE6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: profile.user_image || 'https://via.placeholder.com/80' }} // Profile image URL
            style={styles.profilePicture}
          />

          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hi, {profile.user_name} {profile.business_name}</Text>
            <Text style={styles.subtitle}>You're all set to book a boat</Text>
          </View>
        </View>
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

      {/* Listings Section */}
      <Text style={styles.sectionTitle}>Listings</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listingsContainer}>
        {boats.map((boat) => (
          <View key={boat.boat_id} style={styles.listingCard}>
            <Image
              source={{ uri: boat.boat_image || 'https://via.placeholder.com/358x201' }} // Boat image
              style={styles.listingImage}
            />
            <View style={styles.listingContent}>
              <Text style={styles.listingTitle}>{boat.boat_name}</Text>
              <Text style={styles.listingDetails}>{boat.boat_capacity} guests · {boat.boat_trip_type}</Text>
              <Text style={styles.listingLocation}>{boat.boat_location}</Text>
              <TouchableOpacity style={styles.manageButton} onPress={handleManageButtonClick}>
                <Text style={styles.manageButtonText}>Manage</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Favorites Section */}
      <Text style={styles.sectionTitle}>Favorites</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listingsContainer}>
        {/* Repeat for dynamic favorites */}
        <View style={styles.favoriteCard}>
          <Image
            source={{ uri: 'https://via.placeholder.com/160x90' }}
            style={styles.favoriteImage}
          />
          <View style={styles.favoriteContent}>
            <Text style={styles.favoriteTitle}>Beneteau Oceanis 46.1</Text>
            <TouchableOpacity style={styles.favoriteButton}>
              <Text style={styles.favoriteButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* More favorite cards can be added here */}
      </ScrollView>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F7FAFC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  headerContent: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D141C',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A789C',
    marginTop: 4,
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
  manageButton: {
    backgroundColor: '#388FE6',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F7FAFA',
  },
  favoriteCard: {
    width: 160,
    height: 205,
    backgroundColor: '#F7FAFA',
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  favoriteContent: {
    flex: 10,
    justifyContent: 'space-between',
  },
  favoriteImage: {
    width: '100%',
    height: 90,
    borderRadius: 12,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D141C',
    marginTop: 8,
  },
  favoriteButton: {
    backgroundColor: '#388FE6',
    borderRadius: 11,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-end',
  },
  favoriteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F7FAFA',
  },
});

export default BusinessDashboard;
