import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, ScrollView, Image, ActivityIndicator } from "react-native";
import axios from 'axios';

const { width: screenWidth } = Dimensions.get("window");

const BusinessListing = () => {
  const [boats, setBoats] = useState([]); // State to store boat data
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State to store any potential errors

  // Fetch boat data from the backend
  const fetchBoats = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:3000/api/auth/boat'); // Replace with your backend API endpoint
      setBoats(response.data.boats); // Set the fetched boat data to the state
    } catch (error) {
      console.error("Error fetching boats:", error);
      setError('Failed to load boats data'); // Handle error if API request fails
    } finally {
      setLoading(false); // Stop the loading spinner once the request is done
    }
  };

  // Fetch the boat data when the component mounts
  useEffect(() => {
    fetchBoats();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#388FE6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.topHeader}>Dashboard</Text>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Listings Grid */}
        <View style={styles.listingsGrid}>
          {boats.map((boat, index) => (
            <View style={styles.listingCard} key={boat.boat_id}>
              <View style={styles.listingImage}>
                <Image
                  source={{ uri: boat.photos[0] || 'https://via.placeholder.com/500x300' }}
                  style={styles.image}
                />
              </View>
              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle}>{boat.boat_name}</Text>
                <Text style={styles.listingRating}>4.92 (25)</Text>
                <Text style={styles.listingDetails}>{boat.boat_description}</Text>
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.editButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  topHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  content: {
    padding: 16,
  },
  listingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  listingCard: {
    width: (screenWidth - 64) / 2, // Responsive two-column layout
    marginBottom: 16,
  },
  listingImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#E8EDF2",
    borderRadius: 12,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  listingInfo: {
    paddingHorizontal: 8,
  },
  listingTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: "500",
    fontSize: 16,
    color: "#0D141C",
  },
  listingRating: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: "400",
    fontSize: 14,
    color: "#4A789C",
    marginVertical: 4,
  },
  listingDetails: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: "400",
    fontSize: 14,
    color: "#4A789C",
  },
  editButton: {
    backgroundColor: "#E8EDF5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  editButtonText: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: "500",
    fontSize: 14,
    color: "#0D141C",
  },
});

export default BusinessListing;
