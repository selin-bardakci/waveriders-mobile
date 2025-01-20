import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, TextInput, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from "axios";

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

interface Boat {
  boat_id: string;
  boat_name: string;
  price_per_hour?: number;
  price_per_day?: number;
  trip_types: string[];
  boat_type: string;
  photos?: string[];
  capacity: number;
}

const Listing = () => {
  const [filteredBoats, setFilteredBoats] = useState<Boat[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [vehicleType, setVehicleType] = useState('');
  const [filterModal, setFilterModal] = useState(false);
  const [boats, setBoats] = useState<Boat[]>([]);

  const navigation = useNavigation();


  const fetchBoats = async () => {
    try {
      const response = await axios.get('https://api.waveriders.com.tr/api/listings/');
      const sanitizedData = response.data.map((boat: Boat) => ({
        ...boat,
        trip_types: typeof boat.trip_types === "string" ? (boat.trip_types as string).split(",") : boat.trip_types || [], // Convert string to array
      }));
      setBoats(sanitizedData);
      setFilteredBoats(sanitizedData); // Initially show all boats
    } catch (error) {
      console.error('Error fetching boats:', error);
    }
  };
  

  useEffect(() => {
    fetchBoats();
  }, []);

  const storeBoat = async (boat: Boat) => {
    try {
      await AsyncStorage.setItem('listing_boat_id', JSON.stringify(boat.boat_id));
    } catch (error) {
      console.error(error);
    }
  };

  const tripTypes = [
    { id: 1, name: 'Short Trips', type: 'short' },
    { id: 2, name: 'Day Trips', type: 'day' },
    { id: 3, name: 'Sunrise & Sunset Trips', type: 'sunrise' },
    { id: 4, name: 'Overnight Adventures', type: 'overnight' }
  ];

  const handleTripSelection = (tripType: string) => {
    setSelectedTrips((prev) =>
      prev.includes(tripType)
        ? prev.filter((type) => type !== tripType)
        : [...prev, tripType]
    );
  };


  const handleApplyFilters = () => {
    setShowDropdown(false);
  
    const filtered = boats.filter((boat) => {
      const withinPriceRange =
        (boat.price_per_hour !== undefined && boat.price_per_hour >= priceRange[0] && boat.price_per_hour <= priceRange[1]) ||
        (boat.price_per_day !== undefined && boat.price_per_day >= priceRange[0] && boat.price_per_day <= priceRange[1]);
  
      const matchesTripType =
        selectedTrips.length === 0 ||
        (Array.isArray(boat.trip_types) && boat.trip_types.some((trip) => selectedTrips.includes(trip)));
  
      const matchesVehicleType =
        vehicleType === '' || (boat.boat_type && boat.boat_type.toLowerCase() === vehicleType.toLowerCase());

      
  
      return withinPriceRange && matchesTripType && matchesVehicleType;
    });
    
    setFilteredBoats(filtered);

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

  const handlePriceChange = (index: number, value: string) => {
    const newPriceRange = [...priceRange];
    const numValue = parseInt(value, 10);

    if (!isNaN(numValue)) {
      newPriceRange[index] = numValue;
      setPriceRange(newPriceRange);
    }
  };

  const renderBoat = ({ item }: { item: Boat }) => {
    return (
      <TouchableOpacity
        key={item.boat_id}
        style={styles.card}
        onPress={async () => {
          await storeBoat(item);
          await addToRecentlyViewed(item);
          navigation.navigate(SCREEN_NAMES.ListingCard as never);
        }}
      >
        <Image
          source={item.photos?.[0] ? { uri: item.photos[0] } : { uri: "https://via.placeholder.com/500x300" }}
          style={styles.image}
        />
        <Text style={styles.title}>{item.boat_name}</Text>
        <Text style={styles.price}>
          {item.price_per_hour ? `${item.price_per_hour} per hour `  : ''}
          {item.price_per_hour && item.price_per_day ? ' | ' : ''}
          {item.price_per_day ? `${item.price_per_day} per day `  : ''}
          {item.capacity} guests
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => {
          storeBoat(item)
          navigation.navigate(SCREEN_NAMES.ListingCard as never);
        }}>
          <Text style={styles.buttonText}>Check availability</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Top rated boats</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => {
              handleApplyFilters();
              setShowDropdown(!showDropdown);
              }}>
            <Icon name="filter" size={20} color="#388FE6" />
          </TouchableOpacity>
      </View>

        {showDropdown && (
          <View style={styles.dropdown}>
            <ScrollView style={styles.scrollableDropdown}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Filter Options</Text>

                <Text style={styles.filterTitle}>Price Range: ${priceRange[0]} - ${priceRange[1]}</Text>
                <MultiSlider
                  values={priceRange}
                  onValuesChange={(values) => setPriceRange(values)}
                  min={0}
                  max={5000}
                  step={50}
                  selectedStyle={styles.sliderSelectedStyle}
                  unselectedStyle={styles.sliderUnselectedStyle}
                />

                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={styles.priceInput}
                    value={priceRange[0].toString()}
                    keyboardType="numeric"
                    onChangeText={(value) => handlePriceChange(0, value)}
                  />
                  <Text style={styles.priceInputText}>$</Text>
                  <Text style={styles.priceInputText}>-</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={priceRange[1].toString()}
                    keyboardType="numeric"
                    onChangeText={(value) => handlePriceChange(1, value)}
                  />
                  <Text style={styles.priceInputText}>$</Text>
                </View>

                <Text style={styles.filterTitle}>Vehicle Type</Text>
                <TouchableOpacity
                  style={styles.dropdownMenu}
                  onPress={() => setFilterModal(!filterModal)}
                >
                  <Text style={styles.dropdownText}>
                    {vehicleType || "Select Vehicle Type"}
                  </Text>
                </TouchableOpacity>
                {filterModal && (
                  <View style={styles.dropdownOptions}>
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => {
                        setVehicleType("Boat");
                        setFilterModal(false);
                      }}
                    >
                      <Text style={styles.optionText}>Boat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => {
                        setVehicleType("Yacht");
                        setFilterModal(false);
                      }}
                    >
                      <Text style={styles.optionText}>Yacht</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.filterTitle}>Trip Type</Text>
                {tripTypes.map((trip) => (
                <View key={trip.id} style={styles.tripTypeButton}>
                  <TouchableOpacity
                    onPress={() => handleTripSelection(trip.type)}
                    style={[
                      styles.checkbox,
                      selectedTrips.includes(trip.type) && styles.checkboxSelected,
                    ]}
                  />
                  <Text style={styles.buttonText}>{trip.name}</Text>
                </View>
              ))}
                <TouchableOpacity onPress={handleApplyFilters} style={styles.applyButton}>
                  <Text style={styles.buttonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      
      {filteredBoats.length > 0 ? (
        <FlatList
          data={filteredBoats}
          renderItem={renderBoat}
          keyExtractor={(item) => item.boat_id.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noBoatText}>No boats found</Text>
      )}

    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFA",
    paddingHorizontal: 5,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: '#388FE6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row', // Align items in a row
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Adjust spacing between items
    marginBottom: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D141C',
  },
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scrollableDropdown: {
    maxHeight: 550, // Set a maximum height for the dropdown
    paddingHorizontal: 41,
  },
  dropdown: {
    position: "absolute",
    top: 39,
    right: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  sliderSelectedStyle: {
    backgroundColor: '#388FE6',
  },
  sliderUnselectedStyle: {
    backgroundColor: '#ddd',
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 41,
    fontSize: 14,
    color: "#4F7396",
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  changedropdownMenu: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#388FE6',
  },
  dropdownText: {
    fontSize: 16,
    color: '#555',
  },
  dropdownOptions: {
    position: 'absolute',
    top: 298,
    marginHorizontal: 19,
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    zIndex: 100,
  },
  dropdownOption: {
    padding: 10,
    backgroundColor:"388FE6",
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    marginVertical: 10,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  priceInput: {
    width: 100,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  priceInputText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tripTypeButton: {
    flexDirection: 'row', // Aligning the checkboxes and text horizontally
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  applyButton: {
    backgroundColor: '#388FE6',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
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
  tripTypeText: {
    fontSize: 16,
    color: '#555',
  },
  button: {
    backgroundColor: "#388FE6",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
    margin: 10,
  },
  noBoatText: {
    fontSize: 16,
    color: "#ff0000",
    textAlign: "center",
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginVertical: 20,
  },
});

export default Listing;