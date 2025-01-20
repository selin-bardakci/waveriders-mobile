import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { NavigationContainer, useNavigation, NavigationProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Home from './app/index'; // Ensure this path is correct
import Profile from './app/screens/Profile';
import Listing from './app/screens/Listing';
import ListingCard from './app/screens/ListingCard';
import Business from './app/screens/Business';
import Customer from './app/screens/Customer';
import Favorites from './app/screens/Favorites';
import BusinessListing from './app/screens/BusinessListing';






// Define your screen names as constants to avoid typos
const SCREEN_NAMES = {
  Home: 'Home',
  Trips: 'Trips',
  Favorites: 'Favorites',
  ListingCard: 'ListingCard',
  Profile: 'Profile',
  Customer: 'Customer',
  Business: 'Business',
  BusinessListing: 'BusinessListing',
};



// Async function to check if the app has been opened before
const checkOpen = async (navigation: any) => {
  const hasRefreshed = await AsyncStorage.getItem('hasRefreshed');
  if (!hasRefreshed) {
    await AsyncStorage.setItem('hasRefreshed', 'true');
    navigation.navigate(SCREEN_NAMES.Home); // Navigate to Home or any initial screen
  }
};

// Define the types for your navigation props
interface RootLayoutNavProps {
  isLoggedIn: boolean;
  userType: string | null;
  token: string | null;
}

// Create the Stack Navigator
const Stack = createStackNavigator();

function RootLayoutNav({ isLoggedIn, userType, token }: RootLayoutNavProps) {
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    checkOpen(navigation);
  }, []);

  return (
    <>
      <Stack.Navigator initialRouteName={SCREEN_NAMES.Home} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={SCREEN_NAMES.Home} component={Home} />
        {/* Add other screens here */}
        <Stack.Screen name={SCREEN_NAMES.Trips} component={Listing} />
        <Stack.Screen name={SCREEN_NAMES.Favorites} component={Favorites} />
        <Stack.Screen name={SCREEN_NAMES.Profile} component={Profile} />
        <Stack.Screen name={SCREEN_NAMES.Customer} component={Customer} />
        <Stack.Screen name={SCREEN_NAMES.Business} component={Business} />
        <Stack.Screen name={SCREEN_NAMES.ListingCard} component={ListingCard} />
        <Stack.Screen name={SCREEN_NAMES.BusinessListing} component={BusinessListing} />
      </Stack.Navigator>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {[
          { name: SCREEN_NAMES.Home, icon: 'home-outline', label: 'Home' },
          { name: SCREEN_NAMES.Trips, icon: 'boat-outline', label: 'Trips' },
          { name: SCREEN_NAMES.Favorites, icon: 'heart-outline', label: 'Wishlist' },
         
          { 
            name: SCREEN_NAMES.Profile, 
            icon: 'person-outline', 
            label: 'Profile', 
            conditionalNavigation: () => {
              if (!token && !isLoggedIn) return SCREEN_NAMES.Profile;
              if (token && userType === 'customer') return SCREEN_NAMES.Customer;
              if (token && userType === 'business') return SCREEN_NAMES.Business;
              return SCREEN_NAMES.Profile;
            }
          },
        ].map(({ name, icon, label, conditionalNavigation }) => (
          <TouchableOpacity
            key={name}
            style={styles.footerButton}
            onPress={() =>
              navigation.navigate(conditionalNavigation ? conditionalNavigation() : name)
            }
          >
            <Icon name={icon} size={24} color="#4a5568" />
            <Text style={styles.footerText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);



  // Optionally, load initial state from AsyncStorage or other sources
  useEffect(() => {
    const loadUserData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUserType = await AsyncStorage.getItem('userType');
  
    }
    loadUserData();
    
  }, []);

  return (
    <NavigationContainer>
      <View style={styles.container}>
        
      <RootLayoutNav isLoggedIn={isLoggedIn} userType={userType} token={token} />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute', // Fixes the footer to the bottom
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100, // Ensures it remains above other content
  },
  footerButton: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#4a5568',
  },
  container: {
    flex: 1, // Takes up all available space
    paddingBottom: 60, // Leaves space for the footer
  },
});
