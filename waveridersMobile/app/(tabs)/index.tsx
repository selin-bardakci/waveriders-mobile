import React, { useEffect, useRef } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from 'expo-router';

const INITIAL_REGION = {
  latitude: 41.01,
  longitude: 28.97,
  latitudeDelta: 2,
  longitudeDelta: 2
}

const Page = () => {
  const mapRef = useRef <MapView> ();
  const navigation = useNavigation();

  return(
      <View style={styles.container}>
          <MapView 
            style={{width: '100%', height: '50%',}}
            initialRegion={INITIAL_REGION}
            showsUserLocation = {true}
            showsMyLocationButton = {true}
      />
      </View>
  )
}

const styles = StyleSheet.create ({
  container: {
      flex: 1,
      backgroundColor: '#fff', 
      padding: 26,
  }
})
export default Page;
