import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

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
  photos: string[];
}

const HomeScreen = () => {
  const [location, setLocation] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [hasLocation, setHasLocation] = useState(false);
  const [boats, setBoats] = useState<Boat[]>([]); // Store all boats data[]
  const [boat, setBoat] = useState<Boat | null>(null); // Store selected boat
  const [boatIds, setBoatIds] = useState<number[]>([]); // Store boat IDs
  const [selectedBoatId, setSelectedBoatId] = useState<number | null>(null); // Store randomly selected boat ID

  // Fetch the list of boats
  const fetchBoats = async () => {
    console.log('fetching boats');
    try {
      const response = await fetch('http://10.0.2.2:3000/api/listings/listing');
      const data = await response.json();
      setBoats(data); // Set fetched data to state

      // Extract boat IDs and store them in an array
      const ids = data.map((boat: Boat) => boat.boat_id);
      setBoatIds(ids); // Store all boat IDs in state
      console.log("ID", ids);
      console.log("Fetched boats");
    } catch (error) {
      console.error('Error fetching boats:', error);
      Alert.alert('Error', 'Could not fetch boat listings.');
    }
  };

  // Randomly select a boat ID from the boatIds array
  const selectRandomBoat = () => {
    console.log("BJK", boatIds);
    if (boatIds.length > 0) {
      const randomIndex = Math.floor(Math.random() * boatIds.length);
      const randomBoatId = boatIds[randomIndex];
      setSelectedBoatId(randomBoatId); // Set the selected boat ID
      console.log('Randomly selected boat ID:', randomBoatId);
    } else {
      console.log('No boats available to select.');
    }
  };
  const saveBoatID = async (boatId: number | undefined) => {
    await AsyncStorage.setItem('listing_boat_id', JSON.stringify(boatId));
  }
  // Fetch the boat details for the randomly selected boat
  const setRandomBoat = (boatId: number) => {
    const selectedBoat = boats.find((boat) => boat.boat_id === boatId);
    if (selectedBoat) {
      setBoat(selectedBoat); // Set the selected boat details to the state
      console.log('Selected Boat:', selectedBoat);
    }
  };

  useEffect(() => {
    fetchBoats();

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setHasLocation(true);
    })();
  }, []);

  // Run the random boat selection after boatIds are updated
  useEffect(() => {
    if (boatIds.length > 0) {
      selectRandomBoat(); // Select a random boat once boatIds are updated
    }
  }, [boatIds]);

  // After selecting a boat, fetch its details
  useEffect(() => {
    if (selectedBoatId !== null) {
      setRandomBoat(selectedBoatId); // Fetch and display the selected boat's details
    }
  }, [selectedBoatId]);

  return (
    <ScrollView style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={location}
          showsUserLocation={true}
        />
      </View>

      <View style={styles.listingContainer}>
        <Text style={styles.sectionTitle}>Waveriders Recomends</Text>
        <TouchableOpacity style={styles.card} onPress={() => {
          
          saveBoatID(boat?.boat_id);
          router.push('/screens/ListingCard')}}>
          <Image
            source={{ uri: boat?.photos?.[0] || 'https://via.placeholder.com/500x300' }} // Fallback image
            style={styles.image}
          />
          <Text style={styles.cardTitle}>{boat?.boat_name || 'Yacht in the heart of the city'}</Text>
          <Text style={styles.cardSubtitle}>{boat?.description || '5 guests · 2 bedrooms · 2 beds · 2 baths'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/trips')}>
          <Text style={styles.buttonText}>See all boats</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.socialIcons}>
          <FontAwesome name="facebook" size={24} color="black" />
          <FontAwesome name="instagram" size={24} color="black" />
          <FontAwesome name="twitter" size={24} color="black" />
        </View>
        <Text style={styles.footerText}>© 2023 Boatbnb, Inc. All rights reserved.</Text>
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
  },
  map: {
    width: '100%',
    height: '100%',
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
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '40%',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#a0aec0',
  },
});

export default HomeScreen;
