import React, {useContext, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, ScrollView, Platform} from 'react-native';
import {UserContext} from "../../../context/UserContext";
import {Image, ImageBackground} from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SegmentedControlTab from 'react-native-segmented-control-tab';
import Intro from './Intro';
import Notification from './Notification';
import Password from './Password';
import Settings from './Settings';
import {LinearGradient} from "expo-linear-gradient";
import General from "./General";
import config from "../../../config";

let overserrUrl,
    overseerrApi,
    tmdbApiKey,
    pocketBaseUrl,
    pocketBaseToken,
    serverPlex,
    serverJellyfin,
    serverOverseerr,
    tautulliUrl,
    tautulliApi

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey
pocketBaseUrl = config.pocketBaseURL
pocketBaseToken = config.pocketBasetokenID
serverPlex = config.serverPLEX
serverJellyfin = config.serverJELLYFIN
serverOverseerr = config.serverOVERSEER
tautulliUrl = config.tautulliUrl
tautulliApi = config.tautulliApiKey

const Profile = ({navigation}) => {
    const { userDetails, setUserDetails } = useContext(UserContext);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleLogout = async () => {
        setUserDetails(null);
        await AsyncStorage.removeItem('userDetails');
        navigation.navigate('Login');
    }
    const handleIndexChange = (index) => {
        setSelectedIndex(index);
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollContainer}>
                <ImageBackground
                    source={{ uri: `${overserrUrl}/imageproxy/t/p/w1920_and_h800_multi_faces//oQ429AcD85ttxvOxAaYpETnAsW0.jpg` }}
                    style={styles.image}
                    contentFit={'cover'}
                >
                    <LinearGradient
                        colors={['#161F2EE4', 'rgb(22,31,46)']}
                        style={styles.linearGradient}
                    />
                    <View style={styles.profileInfo}>
                        <Image
                            style={styles.avatar}
                            source={{
                                uri: userDetails ? userDetails.avatar : null,
                            }}
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.displayName}>{userDetails ? userDetails.displayName : 'Guest'}</Text>
                            <Text style={styles.otherDet}>{userDetails ? userDetails.email : ''}</Text>
                            <Text style={styles.otherDet}>
                                Joined {userDetails ? new Date(userDetails.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                            </Text>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleLogout}
                            >
                                <Text style={styles.buttonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
                <View style={styles.content}>
                    {selectedIndex === 0 && <Intro navigation={navigation} />}
                    {selectedIndex === 1 && <General navigation={navigation} />}
                    {selectedIndex === 2 && <Notification navigation={navigation} />}
                    {selectedIndex === 3 && <Password navigation={navigation} />}
                    {selectedIndex === 4 && <Settings navigation={navigation} />}
                </View>
            </ScrollView>
            <View style={[styles.bottomContainer,
                {
                    paddingBottom: Platform.OS === 'ios' ? 85 : 52,
                }]}
            >
                <SegmentedControlTab
                    values={['Profile','General', 'Notification', 'Password', 'Settings']}
                    selectedIndex={selectedIndex}
                    onTabPress={handleIndexChange}
                    borderRadius={5}
                    tabsContainerStyle={styles.segmentContainer}
                    tabStyle={styles.segmentTab}
                    activeTabStyle={styles.segmentTabActive}
                    tabTextStyle={styles.segmentTabText}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#161f2e',
    },
    content: {
        flex: 1,
        paddingHorizontal: 10,
    },
    bottomContainer: {
        paddingHorizontal: 10,
        backgroundColor: '#161f2e',
        paddingVertical: 10,

    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '20%',
        paddingHorizontal: 10,
    },
    textContainer: {
        marginLeft: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 200 / 2,
        overflow: "hidden",
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.36)",
    },
    displayName: {
        color: '#818cf8',
        fontSize: 22,
        fontWeight: 'bold',
    },
    segmentedControl: {
        width: '100%',
        marginBottom: 50, // Adjust this value as needed
    },
    button: {
        padding: 3,
        borderRadius: 5,
        backgroundColor: '#444343',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.23)',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    linearGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: "100%",
    },
    segmentTab: {
        borderColor: '#161f2e',
    },
    segmentTabActive: {
        color: '#fff',
        backgroundColor: 'rgba(43,53,72,0.73)',

    },
    segmentTabText: {
        color: '#161f2e',
    },
    segmentContainer: {
        borderColor: '#ffffff',
    },
    otherDet: {
        color: '#fff',
        fontSize: 19,
    },
    scrollContainer: {
        flex: 1,
    },
    image: {
        height: 300,
        width: '100%',
        justifyContent: 'center',
    },


});

export default Profile;
