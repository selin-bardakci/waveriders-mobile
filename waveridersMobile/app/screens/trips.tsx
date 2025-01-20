import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet, Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

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

const categories = ["All boats", "Sailboats", "Yachts", "Catamarans", "Motorboats", "Houseboats"];

const Listing = () => {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All boats");

  // Fetch boat data from API
  const fetchBoats = async () => {
    console.log('fetching boats');
    const response = await fetch('http://10.0.2.2:3000/api/listings/listing');
    const data = await response.json();
    setBoats(data); // Set fetched data to state
  };

  useEffect(() => {
    fetchBoats(); // Fetch boats when the component mounts
  }, []);

  // Filter boats based on selected category
  const filteredBoats = selectedCategory === "All boats"
    ? boats
    : boats.filter((boat) => boat.boat_type === selectedCategory);

  // Render category buttons dynamically
  const renderCategory = (category: string) => (
    <TouchableOpacity
      key={category}
      onPress={() => setSelectedCategory(category)}
      style={[
        styles.filterButton,
        selectedCategory === category && styles.filterButtonSelected,
      ]}
    >
      <Text style={[styles.filterText, selectedCategory === category && styles.filterTextSelected]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const storeBoat = async (boat: Boat) => {
    try {
      await AsyncStorage.setItem('listing_boat_id', JSON.stringify(boat.boat_id));
    } catch (error) {
      console.error(error);
    }
  };

  // Generate the cards using map() and render them
  const renderBoat = ({ item }: { item: Boat }) => (
    <View key={item.boat_id} style={styles.card}>
      <Image
          source={{ uri: item.photos && item.photos.length > 0 ? item.photos[0] : 'https://via.placeholder.com/500x300' }} 
          style={styles.image}
        />
      <Text style={styles.title}>{item.boat_name}</Text>
      <Text style={styles.price}>${item.boat_price_per_hour} per hour</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          storeBoat(item)
          router.push("/screens/ListingCard")
        }}
      >
        <Text style={styles.buttonText}>Check availability</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.heading}>Top rated boats</Text>

      {/* Category filter section */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {categories.map(renderCategory)}
        </ScrollView>
      </View>

      {/* Boat listing section */}
      <FlatList
        data={filteredBoats}
        renderItem={renderBoat}
        keyExtractor={(item) => item.boat_id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFA",
    paddingHorizontal: 5,
    marginTop: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0D141C",
  },
  filterWrapper: {
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: "#E6E8EB",
    marginRight: 10, // Spacing between categories
  },
  filterButtonSelected: {
    borderBottomColor: "#0D141C",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4F7396",
  },
  filterTextSelected: {
    color: "#0D141C",
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 10,
  },
  price: {
    fontSize: 14,
    color: "#555",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Listing;
