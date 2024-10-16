import { View, Text } from "react-native";
import React from "react";
import { Tabs, useLocalSearchParams } from "expo-router";

const Page = () => {
    const {id} =useLocalSearchParams<{id:string}>();

    return(
        <View>
            <Text>Listing</Text>
        </View>
    )
}

export default Page;