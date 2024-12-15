import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ScrollView, Linking, Modal } from 'react-native';
import Colors from "@/constants/Colors";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';

interface Boat {
  id: string;
  boat_name: string;
  type: string;
  overall_rating: string;
  driver_rating: string;
  cleanliness_rating: string;
  location: string;
  description: string;
  capacity: string;
  photo_url: string;
}

const App = () => {
  const [selectedItem, setSelectedItem] = useState<Boat | null>(null); // Detayları göstermek için seçilen öğe
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal görünürlük durumu
  const [boats, setBoats] = useState<Boat[]>([]); // Tekne verilerini tutmak için
  const [loading, setLoading] = useState(true); // Yükleme durumunu takip etmek için

  // API'den verileri alma fonksiyonu
  const fetchBoats = () => {
    fetch('http://192.168.68.59:8081/boats') // API çağrısı
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // Gelen veriyi kontrol et
      setBoats(data); // API'den gelen veriyi state'e kaydet
      setLoading(false); // Yükleme tamamlandı
    })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false); // Hata durumunda da yüklemeyi durdur
      });
  };

  // Component mount edildiğinde (sayfa açıldığında) verileri getir
  useEffect(() => {
    fetchBoats();
    console.log('Boats:', boats);  // boats array'ini kontrol et
  }, []);

  // Yükleniyor ekranı
  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Veriler yükleniyor...</Text>
      </View>
    );
  }

  // Tekne çıkarma fonksiyonu
  const removeBoat = (id: string) => {
    setBoats((prevBoats) => prevBoats.filter((boat) => boat.id !== id));
    setIsModalVisible(false);
  };

  const renderItem = ({ item }: { item: Boat }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedItem(item)} // Detay görünümüne geçmek için
    >
      <Image source={{ uri: item.photo_url }} style={styles.image} />
      <Text style={styles.name}>{item.boat_name}</Text>
      <Text style={styles.rating}>
        <FontAwesome name="star" size={16} color="#ffc000" /> {item.overall_rating}
      </Text>
      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => setIsModalVisible(true)} // Modal'ı açmak için
      >
        <Text style={styles.contactButtonText}>Remove from wishlist</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Başlık */}
      <Text style={styles.title}>Your favorite listings</Text>

      {/* Favori listesi */}
      <FlatList
        data={boats}
        keyExtractor={(item) => item.id.toString()} // Benzersiz bir key için ID kullanımı
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No favorite listings yet.</Text>} // Boş liste durumu
      />

      {/* Seçilen öğe detayları */}
      {selectedItem && (
        <View style={styles.detailsContainer}>
          {/* Detay görünümünü kapatmak için X butonu */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedItem(null)}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          <ScrollView style={styles.container}>
            {/* Başlık */}
            <View style={styles.header}>
              <Text style={styles.detailsTitle}>{selectedItem.boat_name}</Text>
            </View>

            {/* Ana görsel */}
            <View style={styles.mainImageContainer}>
              <Image source={{ uri: selectedItem.photo_url }} style={styles.detailsImage} />
            </View>

            {/* İstatistikler */}
            <Text style={styles.statsTitle}>Ratings</Text>
            <View style={styles.statsSection}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{selectedItem.overall_rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{selectedItem.driver_rating}</Text>
                <Text style={styles.statLabel}>Driver</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{selectedItem.cleanliness_rating}</Text>
                <Text style={styles.statLabel}>Boat</Text>
              </View>
            </View>

            {/* Tekne hakkında bilgi */}
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>About this boat</Text>
              <Text style={styles.aboutDescription}>
                This {selectedItem.boat_name} is located in {selectedItem.location} and has{" "}
                {selectedItem.description}, and accommodates {selectedItem.capacity} people.
              </Text>
            </View>

            {/* Seyahat türleri */}
            <View style={styles.typeOfTripsSection}>
              <Text style={styles.typeOfTripsTitle}>Type of Trips</Text>
              <View style={styles.tripType}>
                <Text style={styles.tripText}>• Day Trips</Text>
              </View>
              <View style={styles.tripType}>
                <Text style={styles.tripText}>• Weekend Getaways</Text>
              </View>
              <View style={styles.tripType}>
                <Text style={styles.tripText}>• Extended Cruises</Text>
              </View>
            </View>

            {/* Web sayfasına yönlendirme */}
            <View style={styles.contactSection}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => {
                  Linking.openURL("https://www.waveriders.com.tr/");
                }}
              >
                <Text style={styles.contactButtonText}>Go To Web</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Favorilerden çıkarma modal'ı */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.removeModalContainer}>
            <Text style={styles.modalTitle}>
              Are you sure you want to remove this listing from your favourites?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.removeButton]}
                onPress={() => {
                  if (selectedItem?.id) {
                    removeBoat(selectedItem.id); // `id` değerinin var olduğunda fonksiyonu çağır
                  } else {
                    console.log("Selected item id is missing"); // Hata durumu için loglama
                  }
                }}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)} // Modal'ı kapatır
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 10,
  },
  rating: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    left: 10,
    color: '#000',
  },
  detailsContainer: {
    width: "100%",
    height: "100%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    position: "absolute",
  },
  closeButton: {
    alignSelf: "flex-start",
  },
  closeButtonText: {
    color: Colors.gray,
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  detailsFeaturesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  featureItem: {
    fontSize: 14,
    marginLeft: 10,
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7FAFA',
  },
  headerTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fontSize: 18,
    color: '#0D141C',
  },
  mainImageContainer: {
    width: '100%',
    height: 218,
    backgroundColor: '#F7FAFA',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  statsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statsTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fontSize: 18,
    color: '#0D141C',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1DBE6',
    borderRadius: 8,
  },
  statValue: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fontSize: 24,
    color: '#0D141C',
  },
  statLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    fontSize: 14,
    color: '#4F7396',
  },
  aboutSection: {
    padding: 16,
  },
  aboutTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fontSize: 18,
    color: '#0D141C',
  },
  aboutDescription: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    fontSize: 16,
    color: '#0D141C',
    marginTop: 8,
  },
  typeOfTripsSection: {
    padding: 16,
    backgroundColor: '#F7FAFA',
    marginVertical: 8,
    borderRadius: 8,
  },
  typeOfTripsTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fontSize: 18,
    color: '#0D141C',
    marginBottom: 8,
  },
  tripType: {
    marginBottom: 4,
  },
  tripText: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    fontSize: 16,
    color: '#0D141C',
  },
  contactSection: {
    padding: 16,
    backgroundColor: '#F7FAFA',
  },
  contactButton: {
    backgroundColor: '#388FE6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  contactButtonText: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fontSize: 14,
    color: '#F7FAFA',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Arka planı koyulaştırır
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  removeButton: {
    backgroundColor: '#007BFF', // Mavi renk
  },
  cancelButton: {
    backgroundColor: '#e0e0e0', // Gri renk
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default App;
