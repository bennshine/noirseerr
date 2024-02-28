import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator, RefreshControl, Platform, Alert
} from 'react-native';
import {Image, ImageBackground} from 'expo-image';
import {UserContext} from "../../../context/UserContext";
import axios from "axios";
import MaskedView from "@react-native-masked-view/masked-view";
import {LinearGradient} from "expo-linear-gradient";
import {Entypo, Ionicons, Octicons} from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as BackgroundFetch from "expo-notifications";
import * as TaskManager from 'expo-task-manager';
import Animated from "react-native-reanimated";
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


const BACKGROUND_FETCH_TASK = 'background-fetch';

const Discover = ({navigation}) => {
    const { userDetails } = useContext(UserContext);
    const [media, setMedia] = useState([]);
    const [requests, setRequests] = useState([]);
    const [trending, setTrending] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [genreMovies, setGenreMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [upcomingTV, setUpcomingTV] = useState([]);
    const [studios, setStudios] = useState([]);
    const [networks, setNetworks] = useState([]);
    const [popularTV, setPopularTV] = useState([]);
    const [genreTV, setGenreTV] = useState([]);
    const [actors, setActors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [expoPushToken, setExpoPushToken] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [totalRequests, setTotalRequests] = useState(0);
    const [totalMovies, setTotalMovies] = useState(0);
    const [totalSeries, setTotalSeries] = useState(0);
    const [serverStatus, setServerStatus] = useState({});

    //genres movies
    const genreFilters = {
        28: 'w1280_filter(duotone,991B1B,FCA5A5)', // Action
        12: 'w1280_filter(duotone,480c8b,a96bef)', // Adventure
        16: 'w1280_filter(duotone,032541,01b4e4)', // Animation
        35: 'w1280_filter(duotone,92400E,FCD34D)', // Comedy
        80: 'w1280_filter(duotone,1F2937,2864d2)', // Crime
        99: 'w1280_filter(duotone,065F46,6EE7B7)', // Documentary
        18: 'w1280_filter(duotone,9D174D,F9A8D4)', // Drama
        10751: 'w1280_filter(duotone,777e0d,e4ed55)', // Family
        14: 'w1280_filter(duotone,1F2937,60A5FA)', // Fantasy
        36: 'w1280_filter(duotone,92400E,FCD34D)', // History
        27: 'w1280_filter(duotone,1F2937,D1D5DB)', // Horror
        10402: 'w1280_filter(duotone,032541,01b4e4)', // Music
        9648: 'w1280_filter(duotone,5B21B6,C4B5FD)', // Mystery
        10749: 'w1280_filter(duotone,9D174D,F9A8D4)', // Romance
        878: 'w1280_filter(duotone,1F2937,60A5FA)', // Science Fiction
        10770: 'w1280_filter(duotone,991B1B,FCA5A5)', // TV Movie
        53: 'w1280_filter(duotone,1F2937,D1D5DB)', // Thriller
        10752: 'w1280_filter(duotone,1F2937,F87171)', // War
        37: 'w1280_filter(duotone,92400E,FCD34D)', // Western
    };
   //genres tv
    const tvGenreFilters = {
        10759: 'w1280_filter(duotone,480c8b,a96bef)', // Action & Adventure
        16: 'w1280_filter(duotone,032541,01b4e4)', // Animation
        35: 'w1280_filter(duotone,92400E,FCD34D)', // Comedy
        80: 'w1280_filter(duotone,1F2937,2864d2)', // Crime
        99: 'w1280_filter(duotone,065F46,6EE7B7)', // Documentary
        18: 'w1280_filter(duotone,9D174D,F9A8D4)', // Drama
        10751: 'w1280_filter(duotone,777e0d,e4ed55)', // Family
        10762: 'w1280_filter(duotone,032541,01b4e4)', // Kids
        9648: 'w1280_filter(duotone,5B21B6,C4B5FD)', // Mystery
        10763: 'w1280_filter(duotone,1F2937,D1D5DB)', // News
        10764: 'w1280_filter(duotone,552c01,d47c1d)', // Reality
        10765: 'w1280_filter(duotone,1F2937,60A5FA)', // Sci-Fi & Fantasy
        10766: 'w1280_filter(duotone,9D174D,F9A8D4)', // Soap
        10767: 'w1280_filter(duotone,065F46,6EE7B7)', // Talk
        10768: 'w1280_filter(duotone,1F2937,F87171)', // War & Politics
        37: 'w1280_filter(duotone,92400E,FCD34D)', // Western
    };
    //check server status
    const checkServerStatus = async () => {
        const servers = {
            Plex: config.serverPLEX,
            Jellyfin: config.serverJELLYFIN,
            Overseer: config.serverOVERSEER
        };

        let newStatus = {};

        for (const server of Object.keys(servers)) {
            try {
                const response = await fetch(servers[server]);
                newStatus[server] = response.ok ? 'Online' : 'Offline';
            } catch (error) {
                newStatus[server] = 'Offline';
            }

            // If the server status has changed, send a notification
            if (newStatus[server] !== serverStatus[server]) {
                const message = newStatus[server] === 'Online' ? `${server} is back online` : `${server} is offline`;
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: message,
                        body: `The server is currently ${newStatus[server]}.`,
                    },
                    trigger: null,
                });
            }
        }

        setServerStatus(newStatus);
    };

    useEffect(() => {
        checkServerStatus();
        const intervalId = setInterval(checkServerStatus, 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
        await checkServerStatus();
        return BackgroundFetch.Result.NewData;
    });

    const registerBackgroundFetch = async () => {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
            minimumInterval: 60, // 1 minute
            stopOnTerminate: false,
            startOnBoot: true,
        });
    };

    useEffect(() => {
        registerBackgroundFetch();
    }, []);

    const logos = {
        Plex: require('../../../assets/icons/plex.png'),
        Jellyfin: require('../../../assets/icons/jellyfin.png'),
        Overseer: require('../../../assets/icons/overserr.png'),
    };

    const STATUS_CODES = {
        3: 'Requested',
        1: 'Rejected',
        2: 'Pending',
        4: 'Partially Available',
        5: 'Available',
    };
    const fetchData = async () => {
        setRefreshing(true);
        // Call your data fetching functions here
        fetchTotalMedia();
        fetchMedia();
        fetchCounts();
        fetchRequests();
        fetchNetworks();
        fetchTrending();
        fetchPopularMovies();
        fetchGenreMovies();
        fetchUpcomingMovies();
        fetchUpcomingTV();
        fetchStudios();
        fetchPopularTV();
        fetchGenreTV();
        fetchPopularActors();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchData();
    }, []);


    useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('No notification permissions!');
                return;
            }

            const tokenData = await Notifications.getExpoPushTokenAsync();
            setExpoPushToken(tokenData.data);
        };

        requestPermissions();
    }, []);

    //saving users token to database so i can push notifications if needed e.g if server needs restarting etc .. using pocketbase
    useEffect(() => {
        const sendTokenToServer = async () => {
            const url = config.pocketBaseURL;
            const token = `${config.pocketBasetokenID}`;

            try {
                const createResponse = await fetch(`${url}/api/collections/tokenUsers/records`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userDetails.id,
                        pushToken: expoPushToken,
                    }),
                });

                if (!createResponse.ok) {
                    console.log('Response Error:', createResponse);
                }

                const createData = await createResponse.json();
                console.log('Response Data:', createData);
            } catch (error) {
                console.error('An error occurred:', error);
            }

        };

        if (expoPushToken) {
            sendTokenToServer();
        }
    }, [expoPushToken]);
    //fetch media details to call when needed
    const fetchMediaDetails = async (request, tmdbApiKey) => {
        const mediaType = request.type;
        if (!mediaType) return request;
        const url = `https://api.themoviedb.org/3/${mediaType}/${request.media.tmdbId}?api_key=${config.tmdbApiKey}`;
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
    // Fetch the recently added media
    const fetchMedia = async () => {
        try {
            const response = await axios.get(`${overserrUrl}/api/v1/media?filter=allavailable&take=20&sort=mediaAdded`, {
                headers: {
                    'Authorization': `Bearer ${overseerrApi}`
                }
            });
            const fetchPosters = response.data.results.map(async item => {
                try {
                    const mediaType = item.mediaType === 'movie' ? 'movie' : 'tv';  // Determine the media type
                    const url = `https://api.themoviedb.org/3/${mediaType}/${item.tmdbId}?api_key=${tmdbApiKey}`;  // Use the correct endpoint
                    const tmdbResponse = await axios.get(url);
                    const title = tmdbResponse.data.title || tmdbResponse.data.name;  // Get the title or name
                    return { ...item, posterPath: `https://image.tmdb.org/t/p/w500${tmdbResponse.data.poster_path}`, title: title };
                } catch (error) {
                    return item;
                    // Return the original item without the posterPath property
                }
            });
            const mediaWithPosters = await Promise.all(fetchPosters);

            setMedia(mediaWithPosters);
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };
    const fetchRequests = async () => {
        let response;
        if (userDetails.permissions === 16777506) {
            // User is an admin, fetch all requests
            response = await fetch(`${overserrUrl}/api/v1/request`, {
                headers: {
                    'X-Api-Key': `${overseerrApi}`,
                },
            });
        } else {
            // User is not an admin, fetch only their requests
            response = await fetch(`${overserrUrl}/api/v1/request?skip=0&filter=all&sort=added&requestedBy=${userDetails.id}`, {
                headers: {
                    'X-Api-Key': `${overseerrApi}`,
                },
            });
        }

        const data = await response.json();
        const requests = await Promise.all(data.results.map(request => fetchMediaDetails(request, tmdbApiKey)));
        setRequests(requests);
    };
    //trending
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
    //Fetch the popular movies
    const fetchPopularMovies = async () => {
        const response = await fetch(`${overserrUrl}/api/v1/discover/movies?page=1&sortBy=popularity.desc`, {
            headers: {
                'X-Api-Key': `${overseerrApi}`,
            },
        });
        const data = await response.json();
        //console.log(data);
        const popularMovies = await Promise.all(data.results.map(popularMovie => fetchMediaDetails(popularMovie, tmdbApiKey)));
        setPopularMovies(popularMovies);
    };
    //Fetch the popular tv
    const fetchPopularTV = async () => {
        let tvSet = new Set();
        let allShows = [];

        // Fetch the first 10 pages
        for (let page = 1; page <= 10; page++) {
            const response = await fetch(`${overserrUrl}/api/v1/discover/tv?page=${page}`, {
                headers: {
                    'X-Api-Key': `${overseerrApi}`,
                },
            });
            const data = await response.json();

            // Exclude certain genres
            const excludedGenres = [10767]; // Genre ID for 'Talk'
            const filteredResults = data.results.filter(show => {
                // Check if genreIds is defined and is an array
                if (Array.isArray(show.genreIds)) {
                    // Check if genreIds contains any of the excluded genres
                    return !show.genreIds.some(genreId => excludedGenres.includes(genreId));
                } else {
                    // If genreIds is not defined or not an array, include the show
                    return true;
                }
            });

            filteredResults.forEach(show => {
                if (!tvSet.has(show.id)) {
                    tvSet.add(show.id);
                    allShows.push(show);  // Append the show to the allShows array
                }
            });
        }

        // Update the state only once
        setPopularTV(allShows);
    };
    //Fetch the genre movies
    const fetchGenreMovies = async () => {
        const response = await fetch(`${overserrUrl}/api/v1/discover/genreslider/movie?language=en`, {
            headers: {
                'X-Api-Key': `${overseerrApi}`,
            },
        });
        const data = await response.json();
        setGenreMovies(data);
    };
    //Fetch the genre tv
    const fetchGenreTV = async () => {
        const response = await fetch(`${overserrUrl}/api/v1/discover/genreslider/tv?language=en`, {
            headers: {
                'X-Api-Key': `${overseerrApi}`,
            },
        });
        const data = await response.json();
        setGenreTV(data);
    };
    //Fetch the upcoming movies
    const fetchUpcomingMovies = async () => {
        let allMovies = [];
        for (let i = 1; i <= 2; i++) {
            const response = await fetch(`${overserrUrl}/api/v1/discover/movies/upcoming?page=${i}`, {
                headers: {
                    'X-Api-Key': `${overseerrApi}`,
                },
            });
            const data = await response.json();
            const upcomingMovies = await Promise.all(data.results.map(upcomingMovie => fetchMediaDetails(upcomingMovie, tmdbApiKey)));
            allMovies = [...allMovies, ...upcomingMovies];
        }
        setUpcomingMovies(allMovies);
    };
    //Fetch the upcoming tv
    const fetchUpcomingTV = async () => {
        const response = await fetch(`${overserrUrl}/api/v1/discover/tv/upcoming?page=1`, {
            headers: {
                'X-Api-Key': `${overseerrApi}`,
            },
        });
        const data = await response.json();
        const upcomingTV = await Promise.all(data.results.map(upcomingTV => fetchMediaDetails(upcomingTV, tmdbApiKey)));

        setUpcomingTV(upcomingTV);

    };
    //Fetch the studios
    const fetchStudios = async () => {
        let fetchedStudios = [];
        let studioIds = [2, 127928, 34, 174, 33, 4, 3, 521, 420, 9993];  // Replace with the IDs of the studios you want to display
        for (let studioId of studioIds) {
            const response = await fetch(`${overserrUrl}/api/v1/discover/movies/studio/${studioId}?page=1&language=en`, {
                headers: {
                    'X-Api-Key': `${overseerrApi}`,
                },
            });
            const data = await response.json();
            if (data.studio && data.studio.id) {  // Check if studio and id are not undefined
                fetchedStudios.push({ ...data.studio, uniqueId: `${studioId}-1` });  // Add a unique ID to each studio object
            }
        }
        setStudios(fetchedStudios);  // Store the fetchedStudios array in the state
    };
    //Fetch the networks (sdelected networks )
    const fetchNetworks = async () => {
        let fetchedNetworks = [];
        let networkIds = [213, 2739,1024,2552,453,49, 4353,2,19,359,174,67,318,71,6,16,4330,4,56,80,13];  // Replace with the IDs of the studios you want to display
        for (let networkId of networkIds) {
            const response = await fetch(`${overserrUrl}/api/v1/discover/tv/network/${networkId}`, {
                headers: {
                    'X-Api-Key': `${overseerrApi}`,
                },
            });
            const data = await response.json();
            fetchedNetworks.push({ ...data.network, uniqueId: `${networkId}-1` });  // Add a unique ID to each studio object
        }
        setNetworks(fetchedNetworks);  // Store the fetchedStudios array in the state
    };
    //Fetch the actors
    const fetchPopularActors = async () => {
        const response = await axios.get('https://api.themoviedb.org/3/trending/person/day', {
            params: {
                api_key: `${tmdbApiKey}`,
                language: 'en-US',
                page: 1,
            },
        });

        const popularActors = response.data.results.slice(0, 30);  // Get the top 20 actors

        // Fetch each actor's details
        const actorsWithCredits = await Promise.all(popularActors.map(async actor => {
            const movieResponse = await axios.get(`https://api.themoviedb.org/3/person/${actor.id}/movie_credits`, {
                params: {
                    api_key: `${tmdbApiKey}`,
                    language: 'en-US',
                },
            });

            const tvResponse = await axios.get(`https://api.themoviedb.org/3/person/${actor.id}/tv_credits`, {
                params: {
                    api_key: `${tmdbApiKey}`,
                    language: 'en-US',
                },
            });

            const movieCredits = movieResponse.data.cast.length + movieResponse.data.crew.length;
            const tvCredits = tvResponse.data.cast.length + tvResponse.data.crew.length;

            return {
                ...actor,
                total_movie_credits: movieCredits,
                total_tv_credits: tvCredits,
            };
        }));

        // Sort actors by popularity
        popularActors.sort((a, b) => b.popularity - a.popularity);

        setActors(actorsWithCredits);
    };
    const fetchCounts = async (userRole) => {
        // Fetch total requests
        const requestsResponse = await fetch(`${overserrUrl}/api/v1/settings/about`, {
            headers: {
                'X-Api-Key': `${overseerrApi}`,
            },
        });
        const requestsData = await requestsResponse.json();

        let totalRequests = requestsData.totalRequests;

        if (userDetails.permissions !== 16777506) {
            totalRequests += 310;
        }
        console.log('requestsData', totalRequests);

        setTotalRequests(totalRequests);
    };
    //fetch to count total movies and total tv shows in Tautulli
    //total media using tautulli api
    const fetchTotalMedia = async () => {
        const response = await fetch(`${tautulliUrl}/api/v2?apikey=${tautulliApi}&cmd=get_libraries`);
        const data = await response.json();

        let tvShows = 0;
        let movies = 0;

        data.response.data.forEach(library => {
            if (library.section_type === 'show') {
                tvShows += Number(library.count);
            } else if (library.section_type === 'movie') {
                movies += Number(library.count);
            }
        });

        setTotalSeries(tvShows);
        setTotalMovies(movies);

    };
    //recently added render
    const renderRecentlyAddedItems = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('MediaDetails', { id: item.tmdbId, mediaType: item.mediaType })}
                style={styles.item}>
                <Image
                    style={styles.poster}
                    source={{ uri: item.posterPath }}
                />
                <View style={styles.topTextMediaTextRow}>
                    <View style={[styles.topTextMediaContainer,
                        {borderWidth:2,
                            borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgba(37,99,235,0.99)',
                            backgroundColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.73)' : 'rgba(37,99,235,0.65)'}]}
                    >
                        <Text style={styles.topTextMediaText}>{item.mediaType === 'tv' ? 'SERIES' : item.mediaType}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {item.status &&
                            <View style={[styles.mediaStatusContainer,{
                                backgroundColor: item.status === 3 ? 'rgba(99, 102, 241, 0.8)' : (item.status === 4 ? '#dcfce7' : '#dcfce7'),
                                borderWidth: item.status && item.status === 3 ? 0 : 2,
                                borderColor: item.status === 3 ? 'transparent' : (item.status === 4 ? '#059b2e' : '#059b2e'),
                            }]}>
                                {item.status && item.status === 5 && <Entypo name="check" size={14} color="#059b2e" />}
                                {item.status && item.status === 4 && <Octicons name="dash" size={14} color="#059b2e" />}
                                {item.status && item.status === 3 && <Ionicons name="time-sharp" size={21} color="white" />}
                            </View>
                        }
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    // requested items buy user if not admin
    const renderRequestItems = ({ item }) => {
        return (
            <ImageBackground style={styles.requestItemContainer}
                imageStyle={{ borderRadius: 10 }}
                source={{ uri: item.backdropPath }}
            >
                <LinearGradient
                    colors={['rgb(110,53,140)', 'rgba(117,60,147,0.61)']}
                    style={styles.linearGradientRequest}
                />
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('MediaDetails', { id: item.media.tmdbId, mediaType: item.media.mediaType });
                    }}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', margin: 10 }}
                >
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <Text style={styles.requestTitle}>{item.name}</Text>
                        <View style={styles.rowMT5}>
                            <Image
                                style={styles.userAvatar}
                                source={{ uri: item.requestedBy.avatar }}
                            />
                            <Text style={styles.userTextName}>{item.requestedBy.username}</Text>
                        </View>
                        <View style={[styles.mediaStatusContainerR,{
                            backgroundColor:
                                item.media.status === 1 ? 'rgba(147,51,234,0.73)' :
                                    item.media.status === 2 ? 'rgba(234, 179, 8, 0.8)' :
                                        item.media.status === 3 ? 'rgba(99, 102, 241, 0.8)' :
                                            item.media.status === 4 ? 'rgba(0,255,0,0.65)' :
                                                item.media.status === 5 ? 'rgba(0,255,0,0.43)' :
                                                    'rgba(0,0,0,0.65)',
                        }]}>
                            <Text style={styles.requestStatusText}>{`${STATUS_CODES[item.media.status] || 'Unknown'}`}</Text>
                        </View>
                    </View>
                    <Image
                        style={styles.posterRequests}
                        source={{ uri: item.posterPath }}
                    />
                </TouchableOpacity>
            </ImageBackground>
        );
    };
    // trending items
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
                            style={styles.noPoster}
                            imageStyle={{ borderRadius: 5 }}  // Apply the border radius to the image
                        >
                            <LinearGradient
                                colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                                style={[styles.noPosterLinear,{
                                    height: 190,
                                }]}
                            />
                            <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 6 }}>
                                <Text style={styles.noPosterText}>
                                    POSTER NOT FOUND
                                </Text>
                            </View>
                        </ImageBackground>
                    )}
                    <View style={styles.topTextMediaTextRow}>
                        <View style={[styles.topTextMediaContainer,
                            {
                                borderWidth: 2,
                                borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgba(37,99,235,0.99)',
                                backgroundColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.73)' : 'rgba(37,99,235,0.65)'
                            }]}
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
    //popular movies
    const renderPopularMovieItems = useCallback(({item}) => {
        return (
            <View style={styles.item}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('MediaDetails', {id: item.id, mediaType: item.mediaType})}
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
                            style={styles.noPoster}
                            imageStyle={{ borderRadius: 5 }}  // Apply the border radius to the image
                        >
                            <LinearGradient
                                colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                                style={[styles.noPosterLinear,{
                                    height: 190,
                                }]}
                            />
                        </ImageBackground>
                    )}
                    <View style={styles.topTextMediaTextRow}>
                        <View style={[styles.topTextMediaContainer,
                            {
                                borderWidth: 2,
                                borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgba(37,99,235,0.99)',
                                backgroundColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.73)' : 'rgba(37,99,235,0.65)'
                            }]}
                        >
                            <Text
                                style={styles.topTextMediaText}>{item.mediaType === 'tv' ? 'SERIES' : item.mediaType}</Text>
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
    }, [navigation]);
    // genres
    const renderGenreMovieItems = useCallback(({item}) => {
        const filter = genreFilters[item.id];
        const imageUrl = `https://image.tmdb.org/t/p/${filter}${item.backdrops[0]}`;
        return (

            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('Genres', {id: item.id, mediaType: 'movies'})}
                style={styles.genreMoviesContainer}>
                <Image
                    style={styles.genreMoviesImage}
                    source={{
                        uri: imageUrl,
                    }}
                />
                <View style={styles.genreTextContainer}>
                    <Text style={styles.genreText}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        );
    }, [genreFilters, navigation]);
    // upcoming movies
    const renderUpcomingMovieItems = useCallback(({item}) => {
        return (
            <View style={styles.item}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('MediaDetails', {id: item.id, mediaType: item.mediaType})}
                >
                    <Image
                        style={styles.poster}
                        source={{
                            uri: `https://image.tmdb.org/t/p/w500${item.posterPath}`,
                        }}
                    />
                    <View style={styles.topTextMediaTextRow}>
                        <View style={[styles.topTextMediaContainer,
                            {
                                borderWidth: 2,
                                borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgba(37,99,235,0.99)',
                                backgroundColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.73)' : 'rgba(37,99,235,0.65)'
                            }]}
                        >
                            <Text
                                style={styles.topTextMediaText}>{item.mediaType === 'tv' ? 'SERIES' : item.mediaType}</Text>
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
    }, [navigation])
    // studios
    const renderStudioItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('Studio', { id: item.id })}
                style={styles.studioContainer}>
                <Image
                    style={styles.studioImage}
                    source={{
                        uri: item.logoPath
                            ? `${overserrUrl}/imageproxy/t/p/w780_filter(duotone,ffffff,bababa)${item.logoPath}`
                            : item.tmdbLogoPath
                                ? `https://image.tmdb.org/t/p/w780${item.tmdbLogoPath}`
                                : 'placeholder_image_url',
                    }}
                    contentFit={'contain'}
                />
            </TouchableOpacity>
        );
    };
    // popular tv shows
    const renderPopularTVItems = ({ item }) => {
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
                        style={styles.noPoster}
                        contentFit={'cover'}
                        transitionDuration={1000}
                        imageStyle={{ borderRadius: 10}}  // Apply the border radius to the image
                    >
                        <LinearGradient
                            colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                            style={[styles.noPosterLinear,{
                                height: 210,
                            }]}
                        />
                        <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 6}}>
                            <Text style={styles.noPosterText}>
                                POSTER NOT FOUND
                            </Text>
                        </View>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
    //genres tv
    const renderGenreTVItems = ({ item }) => {
        const filter = tvGenreFilters[item.id];
        const imageUrl = `https://image.tmdb.org/t/p/${filter}${item.backdrops[0]}`;
        return (
            <TouchableOpacity
                onPress={() =>
                    console.log(item.id) ||
                    navigation.navigate('Genres', {id: item.id, mediaType: 'tv'})}

    style={styles.genreMoviesContainer}>
                <Image
                    style={styles.genreMoviesImage}
                    source={{
                        uri: imageUrl,
                    }}
                />
                <View style={styles.genreTextContainer}>
                    <Text style={styles.genreText}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        );
    };
    // upcoming tv
    const renderUpcomingTVItems = useCallback(({item}) => {
        return (
            <View style={styles.item}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('MediaDetails', {id: item.id, mediaType: item.mediaType})}
                >
                    {item.posterPath ? (
                        <Image
                            source={{uri: `https://image.tmdb.org/t/p/w500${item.posterPath}`}}
                            style={styles.poster}
                            contentFit={'cover'}
                            transitionDuration={1000}
                        />
                    ) : (
                        <ImageBackground
                            source={require('../../../assets/icon.png')}
                            style={styles.poster}
                            imageStyle={{borderRadius: 5}}  // Apply the border radius to the image
                        >
                            <LinearGradient
                                colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                                style={[styles.noPosterLinear,{
                                    height: 210,
                                }]}
                            />
                            <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 6}}>
                                <Text style={styles.noPosterText}>
                                    POSTER NOT FOUND
                                </Text>
                            </View>
                        </ImageBackground>
                    )}
                    <View style={styles.topTextMediaTextRow}>
                        <View style={[styles.topTextMediaContainer,
                            {
                                borderWidth: 2,
                                borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgba(37,99,235,0.99)',
                                backgroundColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.73)' : 'rgba(37,99,235,0.65)'
                            }]}
                        >
                            <Text style={styles.topTextMediaText}>
                                {item.mediaType === 'tv' ? 'SERIES' : item.mediaType}
                            </Text>
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
    }, [navigation])
   //network
    const renderNetworkItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('Network', { id: item.id })}
                style={styles.studioContainer}>
                <Image
                    style={styles.studioImage}
                    source={{
                        uri: item.logoPath ? `${overserrUrl}/imageproxy/t/p/w780_filter(duotone,ffffff,bababa)${item.logoPath}` : 'placeholder_image_url',
                    }}
                    contentFit={'contain'}
                />
            </TouchableOpacity>
        );
    };
    // trending actors
    const renderActorsItem = ({ item }) => {
        return (
                <TouchableOpacity
                    onPress={() => navigation.navigate('ActorDetails', { castid: item.id })}
                    style={styles.actorsContainer}
                >
                <Image
                    style={styles.actorImage}
                    source={{
                        uri: item.profile_path ? `https://image.tmdb.org/t/p/w500${item.profile_path}` : 'https://image.tmdb.org/t/p/w500',
                    }}
                    contentFit={'cover'}
                />
                <Text numberOfLines={1} style={styles.actorName}>{item.name}</Text>
                <View style={styles.movieCounter}>
                    <Text style={styles.actorCreditsText}>Movies: {item.total_movie_credits}</Text>
                </View>
                <View style={styles.tvCounter}>
                    <Text style={styles.actorCreditsText}>TV shows: {item.total_tv_credits}</Text>
                </View>
            </TouchableOpacity>
        );
    };
    if (isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={styles.scrollView}
                showsHorizontalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchData}
                        tintColor={'#fff'}
                        title={'Refreshing...'}
                        titleColor={'#fff'}
                    />
                }
            >
                <View style={styles.statusContainer}>
                    {Object.keys(serverStatus).map((server, index) => (
                        <View key={index} style={[styles.statusContent, {backgroundColor: serverStatus[server] === 'Online' ? 'green' : 'red'}]}>
                            <Image
                                source={logos[server]}
                                style={styles.serverLogos}
                                contentFit={'contain'}
                            />
                            <Text style={styles.textServer}>
                                {serverStatus[server]}
                            </Text>
                        </View>
                    ))}
                </View>
                <View style={styles.rowUser}>
                    <View style={styles.gridRequests}>
                        <Text style={styles.gridTitle}>Total Requests</Text>
                        <Animated.Text style={styles.gridNumber}>
                            {userDetails && userDetails.permissions === 16777506 ? (
                                <Text style={styles.gridNumber}>{totalRequests}</Text>
                            ) : (
                                <Text style={styles.gridNumber}>{totalRequests + 370}</Text>
                            )}

                        </Animated.Text>
                    </View>
                    <View style={styles.gridRequests}>
                        <Text style={styles.gridTitle}>Movies Available</Text>
                        <Animated.Text style={styles.gridNumber}>
                            {totalMovies}
                        </Animated.Text>
                    </View>
                    <View style={styles.gridRequests}>
                        <Text style={styles.gridTitle}>Series Available</Text>
                        <Animated.Text style={styles.gridNumber}>
                            {totalSeries}
                        </Animated.Text>
                    </View>
                </View>
                <View style={[styles.header,{marginTop:0}]}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Recently Added </Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={media}
                        renderItem={renderRecentlyAddedItems}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                {requests.length > 0 && (
                    <View style={styles.header}>
                        <MaskedView
                            style={styles.pageTitleMask}
                            maskElement={<Text style={styles.pageTitle}>Requests</Text>}
                        >
                            <LinearGradient
                                colors={['#818cf8', '#c084fc']}
                                start={{ x: 1, y: 1 }}
                                end={{ x: 0, y: 0.33 }}
                                style={{ flex: 1 }}
                            />
                        </MaskedView>
                        <FlatList
                            data={requests}
                            renderItem={renderRequestItems}
                            keyExtractor={item => item.id.toString()}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                )}

                <View style={styles.header}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Trending</Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={trending}
                        renderItem={renderTrendingItems}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={styles.header}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Popular Movies</Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={popularMovies}
                        renderItem={renderPopularMovieItems}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={styles.header}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Genre Movies</Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={genreMovies}
                        renderItem={renderGenreMovieItems}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={styles.header}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Upcoming Movies</Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={upcomingMovies}
                        renderItem={renderUpcomingMovieItems}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={styles.header}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Studios</Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={studios}
                        renderItem={renderStudioItem}
                        keyExtractor={item => item.id ? item.id.toString() : ''}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={styles.header}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Popular Series</Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={popularTV}
                        renderItem={renderPopularTVItems}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={styles.header}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Genre Series</Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={genreTV}
                        renderItem={renderGenreTVItems}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={styles.header}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Upcoming Series</Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={upcomingTV}
                        renderItem={renderUpcomingTVItems}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={styles.header}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Networks</Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={networks}
                        renderItem={renderNetworkItem}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={styles.header}>
                    <MaskedView
                        style={styles.pageTitleMask}
                        maskElement={<Text style={styles.pageTitle}>Trending Actors</Text>}
                    >
                        <LinearGradient
                            colors={['#818cf8', '#c084fc']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0.33 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>
                    <FlatList
                        data={actors}
                        renderItem={renderActorsItem}
                        keyExtractor={item => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                <View style={{ height: 100 }}></View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        opacity: 1,
        paddingTop: 60
    },
    pageTitleMask: {
        height: 60,  left: 0, right: 0, top: 0, bottom: 0,
        paddingVertical: 5,
    },
    item: {
        margin: 5,
    },
    itemRequest: {
        margin: 5,
        width: 440,
    },
    poster: {
        width: 140,
        height: 210,
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
    title: {
        color: '#fff',
        fontSize: 20,
    },
    requestTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    pageTitle: {
        fontSize: 23,
        fontWeight: 'bold',
        textAlign: 'left',
        marginVertical: 10,
        marginLeft: 5,
        paddingVertical: 5,
    },
    genreMoviesContainer: {
        width: 240,
        height: 130,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
        margin: 5,
        overflow: 'hidden',
    },
    genreMoviesImage: {
        width: 240,
        height: 130,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
        position: 'absolute',
    },
    linearGradient: {
        position: 'absolute',
        height: 130,
        width: 240,
        borderRadius: 10,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    genreTextContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    genreText: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        shadowColor: 'rgba(131,131,131,0.75)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    scrollView: {
        marginHorizontal: 5,
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
        margin: 5,
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
    studioContainer: {
        height: 130,
        width: 240,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgb(31 41 55)',
        opacity: 1,
    },

    studioImage: {
        height: 80,
        width: 200,
        borderRadius: 10,
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
    userAvatar :{
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 5,
    },
    userTextName :{
        color:'#ffffff',
        fontWeight:"bold"
    },
    actorsContainer: {
        height: 240,
        width: 170,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
        margin: 5,
        justifyContent: 'center',
        backgroundColor: 'rgb(31 41 55)',
        opacity: 1,
        alignItems: 'center',
    },
    actorName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginTop: 10,
    },
    actorImage: {
        height: 130,
        width: 130,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actorCreditsText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 3,
        paddingVertical: 3,
    },
    movieCounter : {
        borderWidth:2,
        borderRadius:50,
        borderColor: 'rgba(37,99,235,0.99)',
        backgroundColor:  'rgba(37,99,235,0.65)'
    },
    tvCounter : {
        borderWidth:2,
        borderRadius:50,
        borderColor: 'rgba(147,51,234,0.63)',
        backgroundColor:  'rgba(147,51,234,0.73)',
        marginVertical: 5,
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
    rowUser: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    gridRequests: {
        backgroundColor: '#1c2732',
        padding: 10,
        borderRadius: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        width: '31.5%',
        justifyContent: 'center',
        height: 100,
    },
    gridTitle: {
        color: 'rgba(184,116,239,0.84)',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textShadowColor: 'rgba(0,0,0,0.75)',
    },
    gridNumber: {
        color: '#fff',
        fontSize: 23,
        fontWeight: 'bold',
    },
    mediaStatusContainer : {
        width: 22,
        height: 22,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    rowMT5 :{
        flexDirection: 'row',
        marginTop: 5,
    },
    mediaStatusContainerR :{
        borderWidth:2,
        borderRadius: 50,
        borderColor: 'rgba(29,29,30,0.18)',
        marginTop: 5,
    },
    requestStatusText :{
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        padding: 2,
        paddingHorizontal:3
    },
    noPoster :{
        width: '100%',
        height: '100%',
        position: 'absolute',
        borderRadius: 5,
        alignSelf: 'center',
    },
    noPosterLinear :{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        borderRadius: 5,
    },
    noPosterText :{
        color: 'rgba(107,103,103,0.96)',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default Discover;
