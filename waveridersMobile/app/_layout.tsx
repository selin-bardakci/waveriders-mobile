import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { SplashScreen, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import axios from 'axios';

// Token cache for secure storage
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async setToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Function to check token validity (you can replace this with your actual token validation API call)
async function validateToken(token: string) {
  console.log('Token31:', token);
  if(token){
  try {
    // Mock token validation API call, replace with actual API
    const response = await axios.post('http://10.0.2.2:3000/api/auth/authenticate',{
      params: {
        Authorization: `Bearer ${token}`
      }
    });    

    if (response.status === 200) {
      return true;  // Token is valid
    } else {
      return false; // Token is invalid
    }
  } catch (error) {
    console.error('Error validating token', error);
    return false; // In case of error, consider token invalid
  }
}
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'mon': require('../assets/fonts/Montserrat-Regular.ttf'),
    'mon-sb': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'mon-b': require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [token, setToken] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLogged = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(isLogged === 'true');
      console.log('Logged in:', isLogged);
      const type = await AsyncStorage.getItem('usertype');
      setUserType(type);

      // Check if token is valid
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const valid = await validateToken(token);
        console.log('Token valid:', valid);
        setToken(valid);
        if (!valid) {
          // Token is invalid or expired, log out the user
          await SecureStore.deleteItemAsync('auth_token');
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    

    checkLoginStatus();
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav isLoggedIn={isLoggedIn} userType={userType} router={router} token={token} />;
}

function RootLayoutNav({ isLoggedIn, userType, router, token }: any) {
  return (
    <View style={styles.container}>
      {/* Content area */}
      <Stack initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="HomeScreen"
          options={{
            // This headerRight was left if you want to still include a home button,
            // but you can remove it entirely if not needed.
            headerRight: () => (
              <TouchableOpacity onPress={() => router.push('/HomeScreen')}>
                <Ionicons name="home" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => router.push('/HomeScreen')}>
          <Ionicons name="home" size={24} color="black" />
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>
        

        <TouchableOpacity style={styles.footerButton} onPress={() => router.push('/screens/trips')}>
          <Ionicons name="boat" size={24} color="black" />
          <Text style={styles.footerText}>Trips</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={() => router.push('/screens/Favorites')}>
          <Ionicons name="heart" size={24} color="black" />
          <Text style={styles.footerText}>Wishlist</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => {
            if (!token && isLoggedIn === false) {
              router.push('/screens/Login');
            }
            if (token && userType === 'customer' && isLoggedIn === true) {
              router.push('/screens/Customer');
            } else if (token && userType === 'business') {
              router.push('/screens/Business');
            } else if (!token && userType === null) {
              router.push('/screens/profile');
            } else {
              router.push('/screens/profile');
            }
          }}
        >
          <Ionicons name="person" size={24} color="black" />
          <Text style={styles.footerText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerButton: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#4a5568',
  },
});
