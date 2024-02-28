import {View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Platform} from "react-native";
import {UserContext} from "../../../context/UserContext";
import {useContext, useEffect, useState} from "react";
import {Image, ImageBackground} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import axios from "axios";
import {Entypo, Ionicons, Octicons} from "@expo/vector-icons";
import config from "../../../config";

let overserrUrl,
    overseerrApi,
    tmdbApiKey

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey

const Intro = ({navigation}) => {
    const { userDetails, setUserDetails } = useContext(UserContext);
    const [requests, setRequests] = useState([]);
    const [trending, setTrending] = useState([]);
    const [movieRequests, setMovieRequests] = useState(0);
    const [tvRequests, setTvRequests] = useState(0);

    const STATUS_CODES = {
        3: 'Requested',
        1: 'Rejected',
        2: 'Pending',
        4: 'Partially Available',
        5: 'Available',
    };

    function getBackgroundColor(status) {
        switch (status) {
            case 1: return 'rgba(147,51,234,0.73)';
            case 2: return 'rgba(234, 179, 8, 0.8)';
            case 3: return 'rgba(99, 102, 241, 0.8)';
            case 4: return 'rgba(0,255,0,0.65)';
            case 5: return 'rgba(0,255,0,0.43)';
            default: return 'rgba(0,0,0,0.65)';
        }
    }
    const fetchMediaDetails = async (request, tmdbApiKey) => {
        const mediaType = request.type;
        if (!mediaType) return request;

        const url = `https://api.themoviedb.org/3/${mediaType}/${request.media.tmdbId}?api_key=${tmdbApiKey}`;
        //console.log(url);
        const response = await axios.get(url);
        const media = response.data;

        return {
            ...request,
            posterPath: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
            backdropPath: `https://image.tmdb.org/t/p/w500${media.backdrop_path}`,
            year: mediaType === 'movie' ? (media.release_date ? media.release_date.split('-')[0] : 'N/A') : (media.first_air_date ? media.first_air_date.split('-')[0] : 'N/A'),
            name: media.title || media.name,
            description: media.overview,
            genres: media.genres.map(genre => genre.name).join(', '),
        };
    };
    const fetchUserRequests = async () => {
            const response = await fetch(`${overserrUrl}/api/v1/request?skip=0&filter=all&sort=added&requestedBy=${userDetails.id}`, {
                headers: {
                    'X-Api-Key': `${overseerrApi}`,
                },
            });
            const data = await response.json();

            let movieCount = 0;
            let tvCount = 0;

            data.results.forEach(request => {
                if (request.type === 'movie') {
                    movieCount++;
                } else if (request.type === 'tv') {
                    tvCount++;
                }
            });

            setMovieRequests(movieCount);
            setTvRequests(tvCount);

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
    const fetchTrending = async () => {
        const response = await fetch(`${overserrUrl}/api/v1/discover/trending?page=1&language=en`, {
            headers: {
                'X-Api-Key': `${overseerrApi}`,
            },
        });
        const data = await response.json();
        //console.log(data);
        const trending = await Promise.all(data.results.map(request => fetchMediaDetails(request, tmdbApiKey)));
        setTrending(trending);
    };

    useEffect(() => {
        fetchUserRequests()
        fetchTrending()
    }, []);


    const renderRequestItems = ({ item }) => {
        const imageUrl = `https://image.tmdb.org/t/p/w500${item.media.backdropPath}`;
        const posterUrl = `https://image.tmdb.org/t/p/w500${item.media.posterPath}`;
        const name = item.media.name;
        return (
            <ImageBackground
                 style={styles.requestItemContainer}
                 imageStyle={{ borderRadius: 10 }}
                 source={{ uri: imageUrl }}
            >
                <LinearGradient
                    colors={['rgb(40,54,138)', 'rgba(40,54,138,0.57)']}
                    style={styles.linearGradientRequest}
                />

                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('MediaDetails', { id: item.media.tmdbId, mediaType: item.media.mediaType });
                    }}
                    style={styles.requestsContainer}
                >
                    <View style={styles.requestBox}>
                        <Text style={styles.requestTitle}>{name}</Text>
                        <View style={styles.avatarContainerRow}>
                            <Image
                                style={styles.avatarRequests}
                                source={{ uri: item.requestedBy.avatar }}
                            />
                            <Text style={styles.username}>{item.requestedBy.username}</Text>
                        </View>
                        <View style={[styles.statusView, {backgroundColor: getBackgroundColor(item.media.status)}]}>
                            <Text style={styles.statusText}>{`${STATUS_CODES[item.media.status] || 'Unknown'}`}</Text>
                        </View>
                    </View>
                    <Image
                        style={styles.posterRequests}
                        source={{ uri: posterUrl }}
                    />
                </TouchableOpacity>

            </ImageBackground>
        );
    };

    const renderTrendingItems = ({ item }) => {
        return (
            <View style={styles.item}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('MediaDetails', { id: item.id, mediaType: item.mediaType })}
                >
                    {item.posterPath ? (
                        <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w500${item.posterPath}` }}
                            style={styles.poster}
                            contentFit={'cover'}
                            transitionDuration={1000}
                        />
                    ) : (
                        <ImageBackground
                            source={require('../../../assets/icon.png')}
                            style={styles.poster}
                            imageStyle={{ borderRadius: 5 }}  // Apply the border radius to the image
                        >
                            <LinearGradient
                                colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                                style={styles.linearGradient}
                            />
                        </ImageBackground>
                    )}

                    <View style={styles.topTextMediaTextRow}>
                        <View style={[styles.topTextMediaContainer,
                            {borderWidth:2,
                                borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgba(37,99,235,0.99)',
                                backgroundColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.73)' : 'rgba(37,99,235,0.65)'}]}
                        >
                            <Text style={styles.topTextMediaText}>{item.mediaType === 'tv' ? 'SERIES' : item.mediaType}</Text>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            {item.mediaInfo &&
                                <View style={[styles.mediaStatusContainer,{
                                    backgroundColor: item.mediaInfo && item.mediaInfo.status === 3 ? 'rgba(99, 102, 241, 0.8)' : '#dcfce7',
                                    borderWidth: item.mediaInfo && item.mediaInfo.status === 3 ? 0 : 2,
                                    borderColor: item.mediaInfo && item.mediaInfo.status === 3 ? 'transparent' : '#059b2e',
                                }]}>

                                    {item.mediaInfo && item.mediaInfo.status === 5 && <Entypo name="check" size={14} color="#059b2e" />}
                                    {item.mediaInfo && item.mediaInfo.status === 4 && <Octicons name="dash" size={14} color="#059b2e" />}
                                    {item.mediaInfo && item.mediaInfo.status === 3 && <Ionicons name="time-sharp" size={21} color="white" />}
                                </View>
                            }
                            <Text style={styles.title}>{item.status}</Text>
                        </View>

                    </View>
                </TouchableOpacity>
            </View>
        );
    };
    return (
        <ScrollView>
            <ScrollView>
                <View style={styles.rowUser}>
                    <View style={styles.gridRequests}>
                        <Text style={styles.gridTitle}>Total Requests</Text>
                        <Text style={styles.gridNumber}>{userDetails?.requestCount}</Text>
                    </View>
                    <View style={styles.gridRequests}>
                        <Text style={styles.gridTitle}>Movie Requests</Text>
                        <Text style={styles.gridUnlimited}>Unlimited</Text>
                    </View>
                    <View style={styles.gridRequests}>
                        <Text style={styles.gridTitle}>Series Requests</Text>
                        <Text style={styles.gridUnlimited}>Unlimited</Text>

                    </View>
                </View>
            </ScrollView>
            {userDetails?.requestCount > 0 && (
                <>
                    <Text style={styles.Title}>Recent Requests </Text>
                    <FlatList
                        data={requests}
                        renderItem={renderRequestItems}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </>
            )}

            <Text style={styles.Title}>Trending </Text>
            <FlatList
                data={trending}
                renderItem={renderTrendingItems}
                keyExtractor={item => item.id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            />

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    Title: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        marginVertical: 15,
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
        justifyContent: 'center',
        height: 140,
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
    mediaStatusContainer : {
        width: 22,
        height: 22,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
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
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    statusView: {
        borderWidth: 2,
        borderRadius: 50,
        borderColor: 'rgba(29,29,30,0.18)',
        marginTop: 5,
    },
    poster: {
        width: 140,
        height: 210,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    posterStatus: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        borderWidth: 3,
        borderColor: '#059b2e',
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    item: {
        margin: 5,
    },
    gridUnlimited: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linearGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 190,
        borderRadius: 5,
    },
});

export default Intro
