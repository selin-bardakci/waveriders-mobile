import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Alert } from "react-native";
import axios, { AxiosError } from "axios";
import { useRouter } from "expo-router"; // Use expo-router for navigation
import { defaultStyles } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a page component
const Page = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [accountType, setAccountType] = useState<string | null>(null); // account type state
  const [userId, setUserId] = useState<number | null>(null); // user id state
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const navigation = useNavigation();

  const router = useRouter(); // Hook to navigate with expo-router

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  interface ErrorResponse {
    message: string;
  }

  const handleManageButtonClickBusiness = (user_id: number) => {
    AsyncStorage.setItem('user_id', JSON.stringify(user_id));

    // Passing user_id as a query parameter
    router.push("/(modals)/BusinessDashboard?user_id=${userId}");
  };

  const handleSignIn = async () => {
    let valid = true;

    if (!email) {
      setIsEmailValid(false);
      setEmailError("Required Field");
      valid = false;
    } else if (!validateEmail(email)) {
      setIsEmailValid(false);
      setEmailError("Invalid email address");
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

    if (valid) {
      try {
        const response = await axios.post(
          "http://192.168.68.59:8081/api/auth/login",
          { email, password }
        );

        const data = response.data;

        if (data.token) {
          const { account_type, id } = data.user; // account_type ve id'yi al
  
          setAccountType(account_type); // State'e account_type'ı ekle
          setUserId(id); // State'e id'yi ekle

          if (account_type === "customer") {
          // Navigate to CustomerDashboard
          //router.push("/customer-dashboard");
          } else if (account_type === "business") {
          // Navigate to BusinessDashboard
          handleManageButtonClickBusiness(id);
          } else {
            Alert.alert("Error", "Unknown account type");
          }

        Alert.alert("Success", "Logged in successfully!");
        setIsModalVisible(false);
      }
      } catch (error) {
        console.error("Login error:", error);
        const err = error as AxiosError<ErrorResponse>;
        Alert.alert(
          "Login Failed",
          err.response?.data?.message || "An error occurred"
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={defaultStyles.btn}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Log in to your account</Text>

            <TextInput
              style={[styles.input, !isEmailValid && styles.inputError]}
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setIsEmailValid(true);
                setEmailError(null);
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
                setIsPasswordValid(true);
                setPasswordError(null);
              }}
              autoCapitalize="none"
              secureTextEntry
            />
            {passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}

            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={defaultStyles.btn} onPress={handleSignIn}>
              <Text style={styles.btnText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 26,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    alignSelf: "flex-start",
  },
  closeButtonText: {
    color: Colors.gray,
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
    color: "#000",
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#dcdcdc",
    color: "gray",
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    marginLeft: 10,
  },
  forgotPassword: {
    color: "gray",
    marginBottom: 20,
    textAlign: "left",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Page;
