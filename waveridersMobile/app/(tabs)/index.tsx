import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';

export default function HomeScreen() {
  const [location, setLocation] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission to access location was denied");
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

  return (
    <ScrollView style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={location}
          showsUserLocation={true}
        >
        </MapView>
      </View>

      <View style={styles.listingContainer}>
        <Text style={styles.sectionTitle}>Boats in Istanbul</Text>
        <View style={styles.card}>
          <Image
            source={require('assets/images/yacht.png')}
            style={styles.image}
          />
          <Text style={styles.cardTitle}>Yacht in the heart of the city</Text>
          <Text style={styles.cardSubtitle}>5 guests · 2 bedrooms · 2 beds · 2 baths</Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>See all boats in Istanbul</Text>
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
}

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
