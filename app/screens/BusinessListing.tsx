import React, { useState, useEffect } from "react";
import { 
  TouchableOpacity, 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import Listing from "./Listing";


interface Boat {
  boat_id: number;
  boat_business_id: number;
  boat_name: string;
  description: string;
  boat_registration: string;
  trip_types: string;
  price_per_hour: number;
  price_per_day: number;
  capacity: number;
  boat_type: string;
  location: string;
  available: boolean;
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
  BusinessListing: 'BusinessListing',
};



const BusinessListing = () => {
  const [boats, setBoats] = useState<Boat[]>([]); // State to store boat data
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState<string | null>(null); // State for errors
  const router = useNavigation();

  // Fetch boat data from the backend
  const fetchBoats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setError("Missing business ID or authentication token.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "https://api.waveriders.com.tr/api/business/listings",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      setBoats(response.data.boats || []);
    } catch (error) {
      console.error("Error fetching boats:", error);
      setError("Failed to load boats. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const storeBoat = async (boatId: number) => {
    try {
      await AsyncStorage.setItem('listing_boat_id', JSON.stringify(boatId));
    } catch (error) {
      console.error("Error storing boat ID:", error);
    }
  };

  const handleDeleteBoat = (boatId: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this boat?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                Alert.alert("Error", "Authentication token not found.");
                return;
              }

              await axios.delete(`https://api.waveriders.com.tr/api/boats/${boatId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setBoats((prevBoats) => prevBoats.filter((boat) => boat.boat_id !== boatId));
              Alert.alert("Success", "Boat deleted successfully.");
            } catch (error) {
              console.error("Error deleting boat:", error);
              Alert.alert("Error", "Failed to delete the boat. Please try again.");
            }
          },
        },
      ]
    );
    router.navigate(SCREEN_NAMES.BusinessListing as never);
  };

  const renderBoat = ({ item }: { item: Boat }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.photos?.[0] || 'https://via.placeholder.com/500x300' }}
        style={styles.image}
      />
      <Text style={styles.title}>{item.boat_name}</Text>
      <Text style={styles.price}>
        {item.price_per_hour ? `$${item.price_per_hour}/hour ` : ''} 
        {item.price_per_day ? `$${item.price_per_day}/day ` : ''} 
        - {item.capacity} guests
      </Text>
      <Text style={styles.price}>{item.location}</Text>
      <Text style={styles.price}>{item.trip_types}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            storeBoat(item.boat_id);
            router.navigate(SCREEN_NAMES.ListingCard as never);
          }}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteBoat(item.boat_id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
    <View style={styles.container}>
      <Text style={styles.topHeader}>Your Listing</Text>
      {boats.length > 0 ? (
        <FlatList
          data={boats}
          renderItem={renderBoat}
          keyExtractor={(item) => item.boat_id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noRecentlyViewedText}>No listings found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#F7FAFC",
  },
  topHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#388FE6",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#d9534f",
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  noRecentlyViewedText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
});

export default BusinessListing;
