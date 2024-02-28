import {View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity, Platform} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {UserContext} from "../../../context/UserContext";
import {useContext, useEffect, useState} from "react";
import * as Notifications from "expo-notifications";
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

const Notification = () => {
    const { userDetails, setUserDetails } = useContext(UserContext);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    async function sendPushNotification(expoPushToken, title, content) {
        console.log('expoPushToken:', expoPushToken);
        console.log('title:', title);
        console.log('content:', content);
        const message = {
            to: expoPushToken,
            sound: 'default',
            title: title,
            body: content,
            data: { someData: 'goes here' },
        };

        try {
            await Notifications.scheduleNotificationAsync({
                content: message,
                trigger: null,
            });
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }

    }

    const handleSubmit = async () => {
        console.log('handleSubmit called');

        try {
            console.log('About to fetch tokens');
            const response = await fetch(`${pocketBaseUrl}/api/collections/tokenUsers/records`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${pocketBaseToken}`,
                },
            });

            if (!response.ok) {
                console.error('Error fetching tokens:', response);
                return;
            }

            const data = await response.json();
            console.log('Fetched tokens:', data);

            if (!data || !data.items || !Array.isArray(data.items)) {
                console.error('Invalid data format:', data);
                return;
            }

            for (const item of data.items) {
                if (!item.pushToken) {
                    console.error('Invalid push token:', item.pushToken);
                    continue;
                }

                console.log('Sending push notification to:', item.pushToken);
                await sendPushNotification(item.pushToken, title, content);
            }

            setTitle('');
            setContent('');
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };


    return (
        <ScrollView>
            <View style={styles.inputContainer}>
                <Text style={styles.title}>Content Title</Text>
                <TextInput
                    mode={'flat'}
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.title}>Content Message</Text>
                <TextInput
                    mode={'flat'}
                    style={styles.input}
                    value={content}
                    onChangeText={setContent}
                    multiline={true}
                />
            </View>
            <View style={styles.divider}/>
            <TouchableOpacity
                mode={'outlined'}
                style={styles.requestButton}
                onPress={handleSubmit}
            >
                <View style={styles.rowCenterCenter}>
                    <Ionicons name={'download-outline'} size={22} color={'#fff'} />
                    <Text style={styles.requestButtonText}>Send Update</Text>
                </View>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    rowUser: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    userType: {
        color: 'rgba(224,222,222,0.96)',
        fontSize: 14,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        marginBottom: 2,
        backgroundColor: 'rgb(55 65 81)',
        opacity: 0.8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        borderRadius: 5,
        color: '#939191',
        fontSize: 16,
        height: 45,
        paddingHorizontal: 10,
    },
    requestButton: {
        backgroundColor: '#2b2b2b',
        paddingVertical: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    requestButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    rowCenterCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    Title: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    title: {
        color: '#8d8989',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    divider: {
        borderBottomColor: 'rgba(255,255,255,0.22)',
        borderBottomWidth: 1,
        marginBottom: 20,
    },
})

export default Notification
