import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

interface Boat {
  boat_id: number;
  boat_business_id: number;
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

export const Home = () => {
  const [location, setLocation] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [hasLocation, setHasLocation] = useState(false);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [boat, setBoat] = useState<Boat | null>(null);
  const [boatIds, setBoatIds] = useState<number[]>([]);
  const [selectedBoatId, setSelectedBoatId] = useState<number | null>(null);

  const navigation = useNavigation();

  const fetchBoats = async () => {
    try {
      const response = await fetch('https://api.waveriders.com.tr/api/listings/random');
      const data = await response.json();
      setBoats(data);

      const ids = data.map((boat: Boat) => boat.boat_id);
      setBoatIds(ids);
    } catch (error) {
      console.error('Error fetching boats:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need access to your location to show boats nearby',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
            setHasLocation(true);
          },
          (error) => {
            Alert.alert('Error getting location', error.message);
            setHasLocation(false);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      } else {

        setHasLocation(false);
      }
    } catch (err) {
      console.warn(err);
      setHasLocation(false);
    }
  };

  const selectRandomBoat = () => {
    if (boatIds.length > 0) {
      const randomIndex = Math.floor(Math.random() * boatIds.length);
      const randomBoatId = boatIds[randomIndex];
      setSelectedBoatId(randomBoatId);
    }
  };

  const saveBoatID = async (boatId: number | undefined) => {
    await AsyncStorage.setItem('listing_boat_id', JSON.stringify(boatId));
  };

  const setRandomBoat = (boatId: number) => {
    const selectedBoat = boats.find((boat) => boat.boat_id === boatId);
    if (selectedBoat) {
      setBoat(selectedBoat);
    }
  };

  useEffect(() => {
    fetchBoats();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (boatIds.length > 0) {
      selectRandomBoat();
    }
  }, [boatIds]);

  useEffect(() => {
    if (selectedBoatId !== null) {
      setRandomBoat(selectedBoatId);
    }
  }, [selectedBoatId]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          region={hasLocation ? location : { latitude: 41.0082, longitude: 28.9784, latitudeDelta: 0.05, longitudeDelta: 0.05 }} 
          showsUserLocation={true} 
        />
      </View>

      <View style={styles.listingContainer}>
        <Text style={styles.sectionTitle}>Waveriders Recommends</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            saveBoatID(boat?.boat_id);
            navigation.navigate(SCREEN_NAMES.ListingCard as never);
          }}
        >
          <Image
            source={{ uri: boat?.photos?.[0] || 'https://via.placeholder.com/500x300' }}
            style={styles.image}
          />
          <Text style={styles.cardTitle}>{boat?.boat_name || 'Yacht in the heart of the city'}</Text>
          <Text style={styles.cardSubtitle}>
            {boat?.description || '5 guests · 2 bedrooms · 2 beds · 2 baths'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate(SCREEN_NAMES.Trips as never)}
        >
          <Text style={styles.buttonText}>See all boats</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2023 Boatbnb, Inc. All rights reserved.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mapContainer: {
    height: 300,
    margin: 10,
    padding: 5,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  
  listingContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#4a5568',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#a0aec0',
  },
});

export default Home;
