import { defaultStyles } from "../constants/Styles";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import Colors from "../constants/Colors";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Await } from "react-router-dom";

const Profile = () => {
  const router = useRouter();  // Using Expo Router
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const handleSignIn = async () => {
    AsyncStorage.getItem('isLoggedIn').then((value) => {
      console.log(value);
      if (value === 'true') {
        AsyncStorage.getItem('usertype').then((value) => {
          console.log(value);
          if (value === 'customer') {
            router.push('/screens/Customer');
          } else {
            router.push('/screens/Business');
          }
          
        });
      }
    }
    
    );
    let valid = true;

    if (!email) {
      setIsEmailValid(false);
      setEmailError("Required Field");
      valid = false;
    } else if (!validateEmail(email)) {
      setIsEmailValid(false);
      setEmailError("Wrong e-mail address");
      valid = false;
    } else {
      setIsEmailValid(true);
      setEmailError(null);
    }
    
    if (!password) {
      setIsPasswordValid(false);
      setPasswordError("Required Field");
      valid = false;
    } else {
      setIsPasswordValid(true);
      setPasswordError(null);
    }
    
    if (!valid) return;

    try {
      console.log(email, password);
      const response = await axios.post('http://10.0.2.2:3000/api/auth/login', {
        email,
        password,
      });
    
      if (response.status === 200) {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('token', response.data.token);
        console.log('Token:',response.data.user.account_type);
        await AsyncStorage.setItem('usertype', response.data.user.account_type);
        console.log('Login successful:', response.data);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, !isEmailValid && styles.inputError]}
        placeholder="E-mail address"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (!text) {
            setIsEmailValid(false);
            setEmailError("Required Field");
          } else {
            setIsEmailValid(true);
            setEmailError(null);
            if (!validateEmail(text)) {
              setIsEmailValid(false);
              setEmailError("Wrong e-mail address");
            } else {
              setEmailError(null);
            }
          }
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError && <Text style={styles.errorText}>{emailError}</Text>}

      <TextInput
        style={[styles.input, !isPasswordValid && styles.inputError]}
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (!text) {
            setIsPasswordValid(false);
            setPasswordError("Required Field");
          } else {
            setIsPasswordValid(true);
            setPasswordError(null);
          }
        }}
        autoCapitalize="none"
        secureTextEntry
      />
      {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={defaultStyles.btn} onPress={handleSignIn}>
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
    backgroundColor: Colors.primary,
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

export default Profile;