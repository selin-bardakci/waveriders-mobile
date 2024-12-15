import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Boat {
  boat_id: number;
  business_id: number;
  boat_name: string;
  description: string;
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
  photos: string[];
}

const getBoat = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const listing_boat_id = await AsyncStorage.getItem('listing_boat_id');
    const business_boat_id = await AsyncStorage.getItem('business_boat_id');
    
    if (listing_boat_id) {
      const response = await axios.get(`http://10.0.2.2:3000/api/auth/boat/${listing_boat_id}`, {
        headers: {
          Authorization: 'Bearer ' + token,
        }
      });
      console.log(response.data[0]);
      return response.data; // Return the first boat in the data
    }
    
    if (business_boat_id) {
      const response = await axios.get(`http://10.0.2.2:3000/api/auth/boat/${business_boat_id}`, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      return response.data; // Return the first boat in the data
      
    }
    
  } catch (error) {
    console.error('Error fetching boat data:', error);
    return null;
  }
};

const ListingCard = () => {
  const [loading, setLoading] = useState(true); // Loading state
  const [boat, setBoat] = useState<Boat | null>(null);

  const fetchBoat = async () => {
    setLoading(true);  // Start loading
    try {
      const data = await getBoat();
      console.log("Fetched boat data:", data);
      if (data && data.boat && data.boat.length > 0) {
        console.log("Setting boat data:", data.boat[0]); // Access the first boat object
        setBoat(data.boat[0]);  // Set the first boat object in the array
      } else {
        setBoat(null);  // Handle case where no data is returned
      }
    } catch (error) {
      console.error('Error fetching boat data:', error);
      setBoat(null);  // Handle error
    } finally {
      setLoading(false);  // Set loading to false once the fetch is complete
    }
  };
  // Watch for changes in the `boat` state and log it
  useEffect(() => {
    if (boat) {
      console.log("Boat data updated:", boat);
    }
  }, [boat]);  // This will run whenever `boat` state changes

  useEffect(() => {
    fetchBoat();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading boat details...</Text>
      </View>
    );
  }
  console.log("Boat name is:", boat?.boat_name);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{boat?.boat_name}</Text>
      </View>

      <View style={styles.mainImageContainer}>
        <Image
          style={styles.mainImage}
          source={{ uri: boat?.photos?.[0] || 'https://via.placeholder.com/500x300' }}
        />
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>About this boat</Text>
        <Text style={styles.aboutDescription}>{boat?.description}</Text>
      </View>

      <View style={styles.typeOfTripsSection}>
        <Text style={styles.typeOfTripsTitle}>Type of Trips</Text>
        <View style={styles.tripType}>
          <Text style={styles.tripText}>• {boat?.boat_trip_type}</Text>
        </View>
      </View>

      <View style={styles.contactSection}>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Go To Web</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7FAFA',
  },
  headerTitle: {
    fontFamily: 'Plus Jakarta Sans',
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
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fontSize: 18,
    color: '#0D141C',
  },
  aboutDescription: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    fontSize: 16,
    color: '#0D141C',
    marginTop: 8,
  },
  typeOfTripsSection: {
    padding: 16,
    backgroundColor: '#F7FAFA',
    marginVertical: 8,
    borderRadius: 8,
  },
  typeOfTripsTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fontSize: 18,
    color: '#0D141C',
    marginBottom: 8,
  },
  tripType: {
    marginBottom: 4,
  },
  tripText: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    fontSize: 16,
    color: '#0D141C',
  },
  contactSection: {
    padding: 16,
    backgroundColor: '#F7FAFA',
  },
  contactButton: {
    backgroundColor: '#388FE6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  contactButtonText: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fontSize: 14,
    color: '#F7FAFA',
  },
  errorText: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ListingCard;
