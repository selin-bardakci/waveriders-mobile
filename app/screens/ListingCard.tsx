import React, { useState, useEffect } from 'react';
import { Linking,View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

interface Boat {
  boat_id: number;
  business_id: number;
  boat_name: string;
  description: string;
  boat_registration: string;
  trip_types: string;
  price_per_hour: number;
  price_per_day: number;
  capacity: number;
  boat_type: string;
  location: string;
  boat_available: boolean;
  boat_created_at: string;
  boat_image: string;
  photos: string[];
  reviews: Review[];
}

interface Review {
  boat_id: number;
  cleanliness_rating: number;
  created_at: string;
  driver_rating: number;
  overall_rating: number;
  review_id: number;
  review_text: string;
  user_id: number;
}

type RecentlyViewedBoat = {
  boat_id: string;
  boat_name: string;
  price_per_hour?: number;
  price_per_day?: number;
  trip_types: string[];
  boat_type: string;
  photos?: string[];
  capacity: number;
};

const getReviews = async (boat_id: number): Promise<Review[]> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`https://api.waveriders.com.tr/api/boats/${boat_id}/reviews`);
    return response.data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};


const getBoat = async (): Promise<Boat | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const boat_id = 
      await AsyncStorage.getItem('listing_boat_id') ||
      await AsyncStorage.getItem('business_boat_id') ||
      await AsyncStorage.getItem('favorites_boat_id');

    if (!boat_id) return null;
    
    const response = await axios.get(`https://api.waveriders.com.tr/api/listings/${boat_id}`);


    const boatData = response.data;

    const boatReviews = await getReviews(Number(boat_id));

    return { ...boatData, reviews: boatReviews };
  } catch (error) {
    console.error('Error fetching boat details:', error);
    return null;
  }
};



const ListingCard = () => {
  const navigation = useNavigation(); // React Navigation hook
  const [loading, setLoading] = useState(true);
  const [boat, setBoat] = useState<Boat | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const clearStorage = async () => {
    await AsyncStorage.removeItem('listing_boat_id');
    await AsyncStorage.removeItem('business_boat_id');
    await AsyncStorage.removeItem('favorites_boat_id');
  };

  const fetchBoat = async () => {
    setLoading(true);
    const data = await getBoat();
    setBoat(data);
    if (data) {
      addToRecentlyViewed(data);
    }
    setReviews(data?.reviews || []);
    setLoading(false);
    clearStorage();
  };

  const addToRecentlyViewed = async (boat: Boat) => {
    try {
      const storedRecentlyViewed = await AsyncStorage.getItem('recentlyViewed');
      let recentlyViewed = storedRecentlyViewed ? JSON.parse(storedRecentlyViewed) : [];

      recentlyViewed = recentlyViewed.filter((item: { id: string }) => item.id !== boat.boat_id.toString());
      recentlyViewed.unshift({
        id: boat.boat_id.toString(),
        name: boat.boat_name,
        image: (boat.photos?.length ?? 0) > 0 ? { uri: (boat.photos ?? [])[0] } : { uri: "https://via.placeholder.com/500x300" },
      });
      if (recentlyViewed.length > 3) recentlyViewed = recentlyViewed.slice(0, 3);
      await AsyncStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch (error) {
      console.error('Error updating Recently Viewed:', error);
    }
  };

  const calculateAverageRating = (reviews: Review[], type: keyof Review) => {
    if (reviews.length === 0) return 'Not Rated';
    const total = reviews.reduce((sum, review) => sum + Number(review[type] || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  useEffect(() => {
    fetchBoat();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingtext}>Loading boat details...</Text>
      </View>
    );
  }

  if (!boat) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Boat details not found.</Text>
      </View>
    );
  }

  const averageOverallRating = calculateAverageRating(reviews, 'overall_rating');
  const averageDriverRating = calculateAverageRating(reviews, 'driver_rating');
  const averageCleanlinessRating = calculateAverageRating(reviews, 'cleanliness_rating');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{boat.boat_name || 'Unnamed Boat'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-forward" size={24} color="#0D141C" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainImageContainer}>
        <Image
          style={styles.mainImage}
          source={{ uri: boat.photos?.[0] || 'https://via.placeholder.com/500x300' }}
        />
      </View>

      <View style={styles.boxesSection}>
        <View style={styles.box}>
          <Icon name="star-outline" size={24} color="#388FE6" />
          <Text style={styles.boxLabel}>Overall Rating</Text>
          <Text style={styles.boxContent}>{averageOverallRating}</Text>
        </View>
        <View style={styles.box}>
          <Icon name="person-outline" size={24} color="#388FE6" />
          <Text style={styles.boxLabel}>Driver Rating</Text>
          <Text style={styles.boxContent}>{averageDriverRating}</Text>
        </View>
        <View style={styles.box}>
          <Icon name="boat-outline" size={24} color="#388FE6" />
          <Text style={styles.boxLabel}>Comfort Rating</Text>
          <Text style={styles.boxContent}>{averageCleanlinessRating}</Text>
        </View>
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>About this boat</Text>
        <Text style={styles.aboutDescription}>{boat.description || 'No description provided.'}</Text>
      </View>

      <View style={styles.detailsSection}>
  <Text style={styles.detailsTitle}>Details</Text>

  <View style={styles.detailBox}>
    <View style={styles.iconContainer}>
      <Icon name="boat-sharp" size={24} color="#388FE6" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.detailLabel}>Boat Type</Text>
      <Text style={styles.detailValue}>{boat.boat_type || 'N/A'}</Text>
    </View>
  </View>

  <View style={styles.detailBox}>
    <View style={styles.iconContainer}>
      <Icon name="people" size={24} color="#388FE6" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.detailLabel}>Capacity</Text>
      <Text style={styles.detailValue}>{boat.capacity || 'N/A'}</Text>
    </View>
  </View>

  <View style={styles.detailBox}>
    <View style={styles.iconContainer}>
      <Icon name="pin" size={24} color="#388FE6" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.detailLabel}>Location</Text>
      <Text style={styles.detailValue}>{boat.location || 'N/A'}</Text>
    </View>
  </View>

  {boat.price_per_day && (
    <View style={styles.detailBox}>
      <View style={styles.iconContainer}>
        <Icon name="cash" size={24} color="#388FE6" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detailLabel}>Price Per Day</Text>
        <Text style={styles.detailValue}>{boat.price_per_day}</Text>
      </View>
    </View>
  )}

  {boat.price_per_hour && (
    <View style={styles.detailBox}>
      <View style={styles.iconContainer}>
        <Icon name="cash" size={24} color="#388FE6" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detailLabel}>Price Per Hour</Text>
        <Text style={styles.detailValue}>{boat.price_per_hour}</Text>
      </View>
    </View>
  )}

  <View style={styles.detailBox}>
    <View style={styles.iconContainer}>
      <Icon name="calendar" size={24} color="#388FE6" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.detailLabel}>Trip Types</Text>
      <Text style={styles.detailValue}>{boat.trip_types || 'N/A'}</Text>
    </View>
  </View>
</View>


      <View style={styles.contactSection}>
        <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('https://waveriders.com.tr/auth/sign-in')}>
          <Text style={styles.contactButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures proper spacing
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7FAFA',
  },
  backButton: {
    marginRight: 1,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center', // Center text in the remaining space
    fontFamily: 'mon-sb',
    fontWeight: '700',
    fontSize: 18,
    color: '#0D141C',
  },

  
  mainImageContainer: {
    width: '100%',
    height: 218,
    backgroundColor: '#F7FAFA',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  aboutSection: {
    padding: 16,
  },
  aboutTitle: {
    fontFamily: 'mon-sb',
    fontWeight: '700',
    fontSize: 18,
    color: '#0D141C',
  },
  aboutDescription: {
    fontFamily: 'mon-sb',
    fontWeight: '400',
    fontSize: 16,
    color: '#0D141C',
    marginTop: 8,
  },
  boxesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    marginTop: 12,
  },
  box: {
    flexDirection: 'column',
    alignItems: 'center',
    width: 120,
    height: 120,
    backgroundColor: '#F7FAFA',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#D1DBE6',
  },
  boxLabel: {
    fontFamily: 'mon-sb',
    fontSize: 12,
    color: '#0D141C',
    marginTop: 8,
  },
  boxContent: {
    fontFamily: 'mon-sb',
    fontWeight: '700',
    alignItems: 'center',
    fontSize: 16,
    color: '#4F7396',
  },
  detailsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    borderRadius: 8,
  },
  detailsTitle: {
    fontFamily: 'mon-sb',
    fontWeight: '700',
    fontSize: 18,
    color: '#0D141C',
    marginBottom: 8,
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F7FAFA',
    borderRadius: 8,
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: 'mon-sb',
    fontWeight: '500',
    fontSize: 16,
    color: '#0D141C',
  },
  detailValue: {
    fontFamily: 'mon-sb',
    fontWeight: '400',
    fontSize: 14,
    color: '#4F7396',
  },
  contactSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  contactButton: {
    backgroundColor: '#388FE6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  contactButtonText: {
    fontFamily: 'mon-sb',
    fontWeight: '700',
    fontSize: 14,
    color: '#F7FAFA',
  },
  errorText: {
    fontFamily: 'mon-sb',
    fontWeight: '400',
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingtext: {
    fontFamily: 'mon-sb',
    fontWeight: '400',
    fontSize: 16,
    color: '#388FE6',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ListingCard;
