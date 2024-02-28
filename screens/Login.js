import React, {useContext, useEffect, useState} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import { Button, TextInput,Text } from 'react-native-paper';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Image, ImageBackground} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from "@expo/vector-icons";
import config from "../config";

let overserrUrl,
    overseerrApi,
    tmdbApiKey,
    pocketBaseUrl,
    pocketBaseToken,
    serverPlex,
    serverJellyfin,
    serverOverseerr

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey
pocketBaseUrl = config.pocketBaseURL
pocketBaseToken = config.pocketBasetokenID
serverPlex = config.serverPLEX
serverJellyfin = config.serverJELLYFIN
serverOverseerr = config.serverOVERSEER

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {setUserDetails } = useContext(UserContext);
    const [trending, setTrending] = useState([]);
    const [backgroundIndex, setBackgroundIndex] = useState(0);
    const [error, setError] = useState(null);
    const [emailError, setEmailError] = useState('');
    const [userInfo, setUserInfo] = useState('');

    const [status, setStatus] = useState({
        Plex: 'Offline',
        Jellyfin: 'Offline',
        Overseer: 'Offline',
    });

    useEffect(() => {
        // Replace with your server URLs
        const servers = {
            Plex: serverPlex,
            Jellyfin: serverJellyfin,
            Overseer: serverOverseerr,
        };

        const checkServerStatus = async (server, url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                setStatus((prevStatus) => ({
                    ...prevStatus,
                    [server]: 'Online',
                }));
            } catch (error) {
                console.log(`${server} error:`, error);
                setStatus((prevStatus) => ({
                    ...prevStatus,
                    [server]: 'Offline',
                }));
            }
        };

        Object.keys(servers).forEach((server) => {
            checkServerStatus(server, servers[server]);
        });
    }, []);

    const validateEmail = (text) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Simple email regex
        if (emailRegex.test(text)) {
            setEmailError('');  // Clear the error message
        } else {
            setEmailError('Please enter a valid email.');
        }
    };
    useEffect(() => {
        const timer = setInterval(() => {
            setBackgroundIndex((backgroundIndex + 1) % trending.length);
        }, 20000);  // Change image every 5 seconds

        return () => clearInterval(timer);  // Clean up the timer
    }, [backgroundIndex, trending]);

    useEffect(() => {
        fetchTrending();
    }
    , []);

    const fetchTrending = async () => {
        //fetch trending movies and tv shows in tmdb
        const response = await axios.get('https://api.themoviedb.org/3/trending/all/day?language=en-US', {
            params: {
                api_key: `${tmdbApiKey}`,
                language: 'en-US',
                page: 1,
            },
        });

        const data = response.data.results;
        setTrending(data);
    }

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userDetails = await AsyncStorage.getItem('userDetails');
                if (userDetails) {
                    setUserDetails(JSON.parse(userDetails));
                    navigation.replace('Main');
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchUserDetails();

    }
    , []);
    const handleLogin = async () => {
        try {
            const response = await axios.post(`${overserrUrl}/api/v1/auth/local`, {
                email: email,
                password: password
            }, {
                headers: {
                    'Authorization': `Bearer ${overseerrApi}`,
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                // Additional request to get the user's information
                const userInfoResponse = await axios.get(`${overserrUrl}/api/v1/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${response.data.accessToken}`,
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (userInfoResponse.status === 200) {
                    // Merge userDetails and userInfo into a single object
                    const user = { ...response.data, ...userInfoResponse.data };

                    // Store the merged user object in your context
                    setUserDetails(user);

                    // Store the merged user object in AsyncStorage
                    await AsyncStorage.setItem('userDetails', JSON.stringify(user));

                    navigation.replace('Main');
                }
            }
        } catch (error) {
            console.error(`Error: ${error}`);
            if (error.response.status === 403) {
                setError('Invalid email or password');
            } else if (error.response.status === 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('An error occurred. Please try again.');
            }
            console.log( error.response);
        }
    };
    const handleRegistration = async () => {
        try {

            const response = await axios.post(`${overserrUrl}/api/v1/user`, {
                email: email,
                password: password
            }, {
                headers: {
                    'Authorization': `Bearer ${overseerrApi}`,
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                }

            });
            console.log('Registration response:', response);

            if (response.status === 200) {
                // Store the user object in your context
                setUserDetails(response.data);

                // Store the user object in AsyncStorage
                await AsyncStorage.setItem('userDetails', JSON.stringify(response.data));

                navigation.replace('Main');
            }
        } catch (error) {
            console.error(`Error: ${error}`);
            if (error.response && error.response.status === 403) {
                setError('Invalid email or password');
                console.log('error - 403 - Registration response:', error.response); // Log the registration response
            } else if (error.response && error.response.status === 500) {
                setError('Server error. Please try again later.');
                console.log('error 500 - Registration response:', error.response); // Log the registration response
            } else {
                setError('An error occurred. Please try again.');
                console.log('error else - Registration response:', error.response); // Log the registration response
            }
        }
    }
    const logos = {
        Plex: require('../assets/icons/plex.png'),
        Jellyfin: require('../assets/icons/jellyfin.png'),
        Overseer: require('../assets/icons/overserr.png'),
    };

    return (
        <ImageBackground
            source={{
                uri: `https://image.tmdb.org/t/p/original${trending[backgroundIndex]?.poster_path}`,
            }}
            contentFit={'cover'}
            style={styles.imageBackground}>
            <LinearGradient
                colors={['transparent', '#03103a']}
                style={styles.linearGradient}
            />
            <View style={styles.padding}>
                <Image
                    source={require('../assets/icon.png')}
                    style={styles.logo}
                    contentFit={'contain'}
                />
                <View style={styles.statusContainer}>
                    {Object.keys(status).map((server, index) => (
                        <View key={index} style={[styles.statusContent, {backgroundColor: status[server] === 'Online' ? 'green' : 'red'}]}>
                            <Image
                                source={logos[server]}
                                style={styles.serverLogos}
                                contentFit={'contain'}
                            />
                            <Text style={styles.textServer}>
                                {status[server]}
                            </Text>
                        </View>
                    ))}
                </View>
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        validateEmail(text);
                    }}
                    mode="flat"
                    style={styles.input}
                    keyboardType="email-address"
                    placeholderTextColor={'rgba(164,164,164,0.73)'}
                    underlineColor={'transparent'}
                    activeUnderlineColor={'transparent'}
                    textColor={'rgba(224,222,222,0.96)'}
                    theme={{ colors: { primary: '#ffffff' } }}
                />

                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    mode="flat"
                    secureTextEntry
                    style={styles.input}
                    underlineColor={'transparent'}
                    activeUnderlineColor={'transparent'}
                />
                <Button
                    mode="elevated"
                    onPress={handleLogin}
                    textColor={'rgba(224,222,222,0.96)'}
                    font
                    style={styles.loginButton}
                >
                    <View style={styles.loginView}>
                        <Ionicons name={'log-in-outline'} size={20} color={'rgba(224,222,222,0.96)'} style={{marginRight: 5}} />
                        <Text style={styles.signText}> Sign in</Text>
                    </View>
                </Button>
                <Button
                    mode="elevated"
                    onPress={handleRegistration}
                    textColor={'rgba(224,222,222,0.96)'}
                    font
                    style={styles.loginButton}
                >
                    <View style={styles.loginView}>
                        <Ionicons name={'log-in-outline'} size={20} color={'rgba(224,222,222,0.96)'} style={{marginRight: 5}} />
                        <Text style={styles.signText}> Sign Up</Text>
                    </View>
                </Button>
                {error &&
                    <View style={styles.errorView}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                }
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.textMovieTitle}>
                    {trending[backgroundIndex]?.media_type === 'movie' ? trending[backgroundIndex]?.title : trending[backgroundIndex]?.name}
                </Text>
            </View>
        </ImageBackground>
    );
};
const styles = StyleSheet.create({
    imageBackground: {
        flex: 1, justifyContent: 'center', height:'100%'
    },
    textContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 16,
    },
    textMovieTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loginButton: {
        marginTop: 16,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(124,123,123,0.68)',
        backgroundColor: 'rgba(11,11,14,0.91)',
        flexDirection: 'row',
    },
    padding: {
        padding: 16,
    },
    input: {
        marginBottom: 8,
        backgroundColor: 'rgba(93,91,91,0.84)',
        borderWidth: 0,
    },
    linearGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    errorView: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    errorText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 15,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(154,152,152,0.54)",
        alignSelf: 'center',
        marginBottom: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'center',
    },
    statusContent: {
        padding: 5,
        borderRadius: 5,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(124,123,123,0.68)',
        flexDirection: 'row',

    },
    signText: {
        color: 'rgba(224,222,222,0.96)',
        fontWeight: 'bold',
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginView: {
        color: 'rgba(224,222,222,0.96)',
        fontWeight: 'bold',
        paddingTop: 5,
        flexDirection: 'row',
    },
    serverLogos :{
        width: 16, height: 16,
        marginRight: 5,
        marginTop: 2,
    },
    textServer: {
        color: 'rgba(224,222,222,0.96)',
        fontWeight: 'bold',
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
}
);
export default Login;
