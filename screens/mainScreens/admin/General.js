import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform} from "react-native";
import {UserContext} from "../../../context/UserContext";
import {useContext, useEffect, useState} from "react";
import {TextInput} from "react-native-paper";
import axios from "axios";
import {Ionicons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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


const General = ({navigation}) => {
    const { userDetails, setUserDetails } = useContext(UserContext);
    const [requests, setRequests] = useState([]);

    const fetchUserRequests = async () => {
        const response = await fetch(`${overserrUrl}/api/v1/request?skip=0&filter=all&sort=added&requestedBy=${userDetails.id}`, {
            headers: {
                'X-Api-Key': `${overseerrApi}`,
            },
        });
        const data = await response.json();

        // Fetch additional details for each request
        const updatedResults = await Promise.all(data.results.map(async (request) => {
            const tmdbId = request.media.tmdbId;
            const url = `https://api.themoviedb.org/3/${request.type}/${tmdbId}?api_key=${tmdbApiKey}`;
            const response = await axios.get(url);
            const media = response.data;

            // Merge the additional details into the media object
            return {
                ...request,
                media: {
                    ...request.media,
                    name: media.title || media.name,
                    posterPath: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
                    backdropPath: `https://image.tmdb.org/t/p/w500${media.backdrop_path}`,
                },
            };
        }));

        setRequests(updatedResults);
    }
    async function handleUpdateUserDetails(updatedUserDetails) {
        try {
            const response = await axios.put(`${overserrUrl}/api/v1/user/${userDetails.id}`, updatedUserDetails, {
                headers: {
                    'Authorization': `Bearer ${userDetails.accessToken}`,
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                // Update the user details in your context and AsyncStorage
                const updatedUser = { ...userDetails, ...updatedUserDetails };
                setUserDetails(updatedUser);
                await AsyncStorage.setItem('userDetails', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    useEffect(() => {
        fetchUserRequests()
    }, []);

    return (
        <ScrollView>
            <View style={styles.rowUser}>
                <View>
                    <Text style={styles.title}>Account Type</Text>
                    <Text style={styles.userType}>
                        {userDetails.userType === '1' ? 'Plex User' : 'Local User'}
                    </Text>
                </View>
                <View>
                    <Text style={styles.title}>Role</Text>
                    <Text style={styles.userType}>
                        {userDetails.permissions === 16777504 ? 'User' : 'Admin'}
                    </Text>
                </View>
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.title}>Display Name</Text>
                <TextInput
                    value={userDetails.displayName}
                    mode={'flat'}
                    style={styles.input}
                    onChangeText={text => setUserDetails({...userDetails, displayName: text})}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.title}>Discord Id</Text>
                <TextInput
                    mode={'flat'}
                    value={userDetails.displayName}
                    style={styles.input}
                    onChangeText={text => setUserDetails({...userDetails, plexId: text})}
                    placeholderTextColor={'rgba(164,164,164,0.73)'}
                    underlineColor={'transparent'}
                    activeUnderlineColor={'transparent'}
                    textColor={'rgba(224,222,222,0.96)'}
                    theme={{ colors: { primary: '#ffffff' } }}
                />
            </View>
            <View style={styles.divider}/>
            <TouchableOpacity
                mode={'outlined'}
                style={styles.requestButton}
                onPress={() => handleUpdateUserDetails(userDetails.id, userDetails)}
            >
                <View style={styles.rowCenterCenter}>
                    <Ionicons name={'download-outline'} size={22} color={'#fff'} />
                    <Text style={styles.requestButtonText}>Save Changes</Text>
                </View>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
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
    userType: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    rowUser: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 30,
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
    },
    gridRequests: {
        backgroundColor: '#1c2732',
        padding: 20,
        borderRadius: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        width: '31.5%',
    },
    gridTitle: {
        color: '#dedcdc',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    gridNumber: {
        color: '#fff',
        fontSize: 23,
        fontWeight: 'bold',
    },
    requestItemContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 290,
        height: 130,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
        borderRadius: 10,
        marginRight: 10,
    },
    linearGradientRequest: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        height: 130,
        width: 290,
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    posterRequests: {
        width: 80,
        height: 120,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    requestTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    requestsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        margin: 10
    },
    requestBox: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    avatarRequests: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 5,
    },
    avatarContainerRow: {
        flexDirection: 'row',
        marginTop: 5,
    },
    username: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        padding: 5,
        paddingTop: 0,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        padding: 5,
    },
    statusView: {
        borderWidth: 2,
        borderRadius: 50,
        borderColor: 'rgba(29,29,30,0.18)',
        marginTop: 5,
    },
    topTextMediaContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        margin: 7,
    },
    topTextMediaText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        paddingHorizontal: 5,
    },
    topTextMediaTextRow: {
        position: 'absolute', // Position the view on top of the image
        top: 0, // Position it at the top of the image
        left: 0, // Position it at the left of the image
        right: 0, // Position it at the right of the image
        flexDirection: 'row', // Arrange the texts horizontally
        justifyContent: 'space-between', // Distribute the texts evenly across the main axis
    },
    item: {
        margin: 5,
    },
    rowCenterCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    requestButton: {
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        marginBottom: 10,
        marginLeft: 10,
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 1,
        padding: 7,
        justifyContent: 'center',
    },
    requestButtonText: {
        color: '#fff',
        fontSize: 17,
        marginLeft: 10,
        marginRight: 10,
    },
    divider: {
        borderBottomColor: 'rgba(255,255,255,0.22)',
        borderBottomWidth: 1,
        marginBottom: 20,
    },
});

export default General
