import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

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

const checkLoginStatus = async (navigation: any) => {
  try {
    const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
    const userType = await AsyncStorage.getItem("usertype");

    if (isLoggedIn === "true") {
      if (userType === "customer") {
        navigation.navigate("Customer");
      } else {
        navigation.navigate("Business");
      }
    } else {
      await AsyncStorage.removeItem("isLoggedIn");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("usertype");
      await AsyncStorage.removeItem("userId");
    }
  } catch (error) {
    console.error("Error checking login status:", error);
  }
};

const Profile = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkLoginStatus(navigation);
  }, []);

  const handleSignIn = async () => {
    setError(null); // Clear any previous errors

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const response = await axios.post('https://api.waveriders.com.tr/api/auth/login', {
        email,
        password,
      });
      if (response.status === 200) {
        const user = response.data.user;
        const token = response.data.token;

        const userId = user.id || ""; // Default to an empty string if user_id is missing
        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("usertype", user.account_type || "");
        await AsyncStorage.setItem("userId", userId.toString());

        if (user.account_type === "customer") {
          navigation.navigate(SCREEN_NAMES.Customer as never);
        } else {
          navigation.navigate(SCREEN_NAMES.Business as never);
        }
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="E-mail address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry={true}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.btn} onPress={handleSignIn}>
        <Text style={styles.btnText}>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 26,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#388FE6",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;
