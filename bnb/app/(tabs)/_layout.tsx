import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';

const Layout = () => {
    return <Tabs screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarLabelStyle: {
            fontFamily: 'mon-sb'
        }
    }}>
        <Tabs.Screen name="index" options={{
            tabBarLabel: 'Explore',
            tabBarIcon: ({color, size}) => <Ionicons name='search' color={color} size={size}/>
        }}/>

        <Tabs.Screen name="favorites" options={{
            tabBarLabel: 'Favorites',
            tabBarIcon: ({color, size}) => <AntDesign name="heart" color={color} size={size}/>
        }}/>

        <Tabs.Screen name="inbox" options={{
            tabBarLabel: 'Inbox',
            tabBarIcon: ({color, size}) => <MaterialCommunityIcons name="message-outline" color={color} size={size}/>
        }}/>

        <Tabs.Screen name="profile" options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({color, size}) => <Ionicons name="person-circle-outline" color={color} size={size}/>
        }}/>
    </Tabs>;
};

export default Layout;