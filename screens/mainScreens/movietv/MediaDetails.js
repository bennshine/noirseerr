import React, {Fragment, useContext, useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View
} from 'react-native';
import {Image, ImageBackground} from 'expo-image';
import {LinearGradient} from "expo-linear-gradient";
import {Entypo, Ionicons, Octicons} from "@expo/vector-icons";
import {UserContext} from "../../../context/UserContext";
import {DataTable, TextInput} from "react-native-paper";
import YoutubePlayer from "react-native-youtube-iframe";
import {BottomSheetModal, BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import CustomAccordion from "../../../component/customAccordion";
import {Flag} from "@forward-software/react-native-flags-kit";
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
    tautulliApi,
    sonarrUrl,
    sonarrApi,
    radarrUrl,
    radarrApi

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
sonarrUrl = config.sonarrURL
sonarrApi = config.sonarrApiKey
radarrUrl = config.radarrURL
radarrApi = config.radarrApiKey



const MediaDetailsScreen = ({ route, navigation }) => {
    let { id, mediaType} = route.params;
    const [details, setDetails] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [similar, setSimilar] = useState(null);
    const [ratings, setRatings] = useState(null);
    const [isLoading , setIsLoading] = useState(null)
    const { userDetails, setUserDetails } = useContext(UserContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleIssue, setModalVisibleIssue] = useState(false);
    const [selectedSeasons, setSelectedSeasons] = useState([]);
    const [selectedIssueType, setSelectedIssueType] = useState(null);
    const [issueText, setIssueText] = useState('');
    const trailerModalRef = useRef(null);
    const [videoId, setVideoId] = useState(null);
    const manageDetailsModalRef = useRef(null);
    const [searchResults, setSearchResults] = useState([]);
    const [downloadStatus, setDownloadStatus] = useState('');
    const [downloadModalVisible, setDownloadModalVisible] = useState(false);
    const bottomSheetInterractiveSearchRef = useRef(null);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [selectedRelease, setSelectedRelease] = useState(null);
    const [playData, setPlayData] = useState({ past7Days: 0, past30Days: 0, allTime: 0 });
    const [detailsSeasons, setDetailsSeasons] = useState(null);
    const [isReleaseLoading, setIsReleaseLoading] = useState(false);
    const [seasonDetails, setSeasonDetails] = useState(null);
    const openTrailer = () => {
        if (details.relatedVideos && details.relatedVideos.length > 0) {
            const videoUrl = details.relatedVideos[0].url;
            const videoId = videoUrl.split('v=')[1];
            setVideoId(videoId);
            trailerModalRef.current.present();
        }
    };
    const manageDetails = () => {
        manageDetailsModalRef.current.present();
    }
    const search = () => {
        bottomSheetInterractiveSearchRef.current.present();
    }
    const CustomBackground = ({ style }) => {
        return (
            <View
                style={[
                    style,
                    {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        borderWidth: 1.3,
                        borderColor: 'rgba(143,143,143,0.11)',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    },
                ]}

            />
        );
    }
    const modal = () => {
        setModalVisible(true);
    };
    function handleToggle(season) {
        // Toggle the isEnabled property of the season
        season.isEnabled = !season.isEnabled;

        if (selectedSeasons.includes(season.seasonNumber)) {
            setSelectedSeasons(selectedSeasons.filter(num => num !== season.seasonNumber));
        } else {
            setSelectedSeasons([...selectedSeasons, season.seasonNumber]);
        }
    }
    const fetchSeriesDetails = async () => {
        // Check if mediaType is 'tv'
        if (mediaType !== 'tv') {
            return;
        }
        const url = sonarrUrl;
        const apiKey = sonarrApi;

        try {
            const seasonResponse = await fetch(`${url}/series?tvdbId=${details.mediaInfo.tvdbId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': apiKey
                }
            });

            if (!seasonResponse.ok) {
                throw new Error(`HTTP error! status: ${seasonResponse.status}`);
            }

            const seasonData = await seasonResponse.json();

            // Fetch the episodes for each season
            for (let i = 0; i < seasonData[0].seasons.length; i++) {
                const episodeResponse = await fetch(`${url}/episode?seriesId=${seasonData[0].id}&seasonNumber=${seasonData[0].seasons[i].seasonNumber}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': apiKey
                    }
                }).catch(error => console.error('Error during fetch:', error));

                seasonData[0].seasons[i].episodes = await episodeResponse.json().catch(error => console.error('Error during JSON parsing:', error));
            }

            // Update the detailsSeasons state with the new seasons and episodes data
            setDetailsSeasons(seasonData[0]);

        } catch (error) {
            console.error('Error:', error);
        }
    };
    useEffect(() => {
        fetchSeriesDetails();
    }, [details]);

    const performInteractiveSearch = async (tmdbId, mediaType, seriesId, seasonNumber, episodeNumber) => {
        setIsReleaseLoading(true); // Set loading status to true before starting the fetch request

        const url = mediaType === 'movie' ? radarrUrl : sonarrUrl;
        const apiKey = mediaType === 'movie' ? radarrApi : sonarrApi;

        if (mediaType === 'tv') {
            const response = await fetch(`${url}/release?episodeId=${episodeNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': apiKey
                }
            });

            const dataArray = await response.json();
            if (dataArray && dataArray.length > 0) {
                setSearchResults(dataArray);
            } else {
                console.log('dataArray is empty');
            }
        } else if (mediaType === 'movie') {
            const response = await fetch(`${url}/${mediaType}?tmdbId=${tmdbId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': apiKey
                }
            });

            const dataArray = await response.json();

            if (dataArray && dataArray.length > 0) {
                const data = dataArray[0];

                if (data && data.id) {
                    const releaseResponse = await fetch(`${url}/release?${mediaType}Id=${data.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Api-Key': apiKey
                        }
                    });

                    const releaseData = await releaseResponse.json();

                    setSearchResults(releaseData);
                } else {
                    console.log('data.id is undefined');
                }
            } else {
                console.log('dataArray is empty');
            }
        }

        setIsReleaseLoading(false); // Set loading status to false after the fetch request is complete
    };

    const downloadMedia = async (release, mediaType) => {
        // Determine the appropriate URL and API key based on the media type
        const url = mediaType === 'movie' ? radarrUrl : sonarrUrl;
        const apiKey = mediaType === 'movie' ? radarrApi : sonarrApi;

        // Use the appropriate API to start the download
        const response = await fetch(`${url}/release`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey
            },
            body: JSON.stringify({
                guid: release.guid,
                indexerId: release.indexerId,
                movieId: id,
            }),
        });

        const data = await response.json();
        // Handle the response
        if (response.status === 200) {
            setDownloadStatus('Downloading release...'+ release.title);
        } else {
            setDownloadStatus('Error: ' + data.message);
        }

        setDownloadModalVisible(true);
        setTimeout(() => {
            setDownloadModalVisible(false);
        }, 4000);
    };
    const fetchSeasonDetails = async (showId, seasonNumber) => {
        const response = await fetch(`${overserrUrl}/api/v1/tv/${showId}/season/${seasonNumber}?language=en`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': overseerrApi
            }
        });
        return await response.json();
    };

    useEffect(() => {
        if (mediaType === 'tv' && details && details.seasons) {
            Promise.all(details.seasons.map(season => fetchSeasonDetails(details.id, season.seasonNumber)))
                .then(data => {
                    setSeasonDetails(data);
                });
        }
    }, [details]);

    function notifyMessage(msg) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        } else {
            Alert.alert(msg);
        }
    }
    const STATUS_CODES = {
        1: 'Pending',
        3: 'Requested',
        2: 'Pending Approval',
        4: 'Partially Available',
        5: 'Available',
    };
    const issueTypes = {
        1: 'Video',
        2: 'Audio',
        3: 'Subtitle',
        4: 'Other',
    };
    const languageMap = {
        'en': 'English',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'nl': 'Dutch',
        'ru': 'Russian',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'ko': 'Korean',
        'sv': 'Swedish',
        'da': 'Danish',
        'fi': 'Finnish',
        'no': 'Norwegian',
        'pl': 'Polish',
        'pt': 'Portuguese',
        'el': 'Greek',
        'tr': 'Turkish',


    };

    const issueTypeArray = Object.entries(issueTypes).map(([key, value]) => ({ key, value }));

    function getBackgroundColor(status) {
        switch (status) {
            case 1: // Pending
                return '#7a5cb7'; // Orange
            case 2: // Rejected
                return '#FFA500'; // Red
            case 3: // Requested
                return 'rgb(99 102 241)'; // Blue
            case 4: // Partially Available
                return '#008000'; // Yellow
            case 5: // Available
                return '#008000'; // Green
            default:
                return '#7a5cb7'; // White
        }
    }
    const submitIssue = () => {
        const body = JSON.stringify({
            issueType: Number(selectedIssueType),
            message: issueText,
            mediaId: Number(details.id),
        });

        fetch(`${overserrUrl}/api/v1/issue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': overseerrApi,
            },
            body: body,
        })
            .then((response) => response.json())
            .then((json) => console.log(json))
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);

            try {
                // Fetch media details
                const response = await fetch(`${overserrUrl}/api/v1/${mediaType}/${id}`, {
                    headers: {
                        'X-Api-Key': `${overseerrApi}`,
                    },
                });
                const data = await response.json();
                setDetails(data);
                // Fetch recommendations
                const recommendationsResponse = await fetch(`${overserrUrl}/api/v1/${mediaType}/${id}/recommendations`, {
                    headers: {
                        'X-Api-Key': `${overseerrApi}`,
                    },
                });
                const recommendationsData = await recommendationsResponse.json();
                setRecommendations(recommendationsData);
                // Fetch similar media
                const similarResponse = await fetch(`${overserrUrl}/api/v1/${mediaType}/${id}/similar`, {
                    headers: {
                        'X-Api-Key': `${overseerrApi}`,
                    },
                });
                const similarData = await similarResponse.json();
                setSimilar(similarData);
                const ratingsResponse = await fetch(`${overserrUrl}/api/v1/${mediaType}/${id}/ratings`, {
                    headers: {
                        'X-Api-Key': `${overseerrApi}`,
                    },
                });
                const ratingsData = await ratingsResponse.json();
                if (ratingsData && 'criticsScore' in ratingsData) {
                    setRatings(ratingsData);
                } else {
                    console.log('Ratings data is null, undefined, or does not have the expected structure');
                }



            } catch (error) {
                console.error(error);
            }
            setIsLoading(false);
        };

        return navigation.addListener('focus', fetchDetails);
    }, [navigation, mediaType, id, overseerrApi]);


    const fetchPlayData = async () => {
        // Get the mediaType and id from route params
        let { mediaType, id } = route.params;

        // Fetch the media info from the Overseerr API
        const response = await fetch(`${overserrUrl}/api/v1/${mediaType}/${id}`, {
            headers: {
                'X-Api-Key': `${overseerrApi}`,
            },
        });
        const mediaInfo = await response.json();

        // Check if mediaInfo and ratingKey exist
        if (mediaInfo.mediaInfo && mediaInfo.mediaInfo.ratingKey) {
            const url = `${tautulliUrl}/api/v2?apikey=${tautulliApi}&cmd=get_history&rating_key=${mediaInfo.mediaInfo.ratingKey}`;
            const tautulliResponse = await fetch(url);
            const data = await tautulliResponse.json();

            // Get the current date and time in seconds
            const now = Math.floor(Date.now() / 1000);

            // Calculate the timestamps for 7 days ago and 30 days ago in seconds
            const oneDay = 24 * 60 * 60; // seconds in a day
            const sevenDaysAgo = now - (7 * oneDay);
            const thirtyDaysAgo = now - (30 * oneDay);

            // Filter the data to get the play counts
            const past7Days = data.response.data.data.filter(record => record.date >= sevenDaysAgo).length;
            const past30Days = data.response.data.data.filter(record => record.date >= thirtyDaysAgo).length;
            const allTime = data.response.data.data.length;

            setPlayData({ past7Days, past30Days, allTime });
        } else {
            console.log('mediaInfo or ratingKey is null');
        }
    };

    useEffect(() => {
        fetchPlayData();
    }, []);


    const requestMedia = async () => {
        setIsLoading(true);  // Start loading
        try {
            // Fetch media details
            const response = await fetch(`${overserrUrl}/api/v1/request`, {
                method: 'POST',
                headers: {
                    'X-Api-Key': `${overseerrApi}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mediaType: mediaType,
                    mediaId: id,
                    userId: userDetails.id,
                    seasons: selectedSeasons
                }),
            });

            const data = await response.json();
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
        setModalVisible(false);
        setDetails({ ...details, mediaInfo: { status: 3 } });
        notifyMessage(details.title || details.name   + '  requested successfully!');
    }
    const renderItemGroup = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.item,
                { borderBottomWidth: 0.6, borderBottomColor: '#727070' },
                item.key === selectedIssueType ? { backgroundColor: 'rgba(149,56,203,0.25)' } : {}
            ]}
            onPress={() => setSelectedIssueType(item.key)}
        >
            <Text style={item.key === selectedIssueType ? {...styles.title, color: 'white'} : styles.title}>
                {item.key === selectedIssueType ? '🔘' : '⚪️'} {item.key}: {item.value}
            </Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.activityIndicator}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }
    return (

        <BottomSheetModalProvider>
        <View style={styles.container}>
            <ScrollView>
                {details && (
                    <>
                        <ImageBackground
                            source={{ uri: `https://image.tmdb.org/t/p/w500${details.backdropPath}` }}
                            style={styles.imageBackground}
                            contentFit={'cover'}
                        >
                            <LinearGradient
                                colors={['#161F2EE4', 'rgb(22,31,46)']}
                                style={styles.linearGradient}
                            />
                            <Image
                                source={{ uri: `https://image.tmdb.org/t/p/w500${details.posterPath}` }}
                                style={[styles.mediaPoster,{marginTop: 20}]}
                                contentFit={'cover'}
                            />
                            {!details.mediaInfo ? (
                                <View
                                    style={{
                                        paddingHorizontal:9,
                                        marginTop:20,
                                    }}
                                >
                                </View>
                            ) : (
                                <View
                                    style={[styles.statusView,{
                                        backgroundColor: getBackgroundColor(details.mediaInfo.status),
                                    }]}
                                >
                                    <Text style={styles.statusText}>
                                        {STATUS_CODES[details.mediaInfo.status]}
                                    </Text>
                                </View>
                            )}

                            <Text style={styles.mediaTitle}>
                                {details.name || details.title} ({(new Date(details.releaseDate || details.firstAirDate)).getFullYear()})
                            </Text>
                            <View>
                                {mediaType === 'movie' ? (
                                    <View
                                        style={styles.rowCenterCenter}
                                    >
                                        {details.runtime > 1 ? (
                                            <Text style={[styles.mediaInfo,{paddingHorizontal:5}]}>
                                                {details.runtime} minutes |
                                            </Text>
                                        ) : null}
                                        {details.genres.length > 0 ? (
                                        <Text style={styles.mediaInfo}>
                                            {details.genres && (typeof details.genres === 'string' ? details.genres : details.genres.map(genre => genre.name).join(', '))}
                                        </Text>
                                        ) : null}

                                    </View>
                                ) : (
                                    <View>
                                        <Text style={styles.mediaInfo}>
                                            {details.seasons ? details.seasons.length : 0} Seasons | {details.episodeRunTime && details.episodeRunTime.length > 0 ? `${details.episodeRunTime} mins | ` : null}
                                            {details.genres && (typeof details.genres === 'string' ? details.genres : details.genres.map(genre => genre.name).join(', '))}
                                        </Text>
                                    </View>
                                )}
                                    <View style={styles.playContainer}>
                                        {details.mediaInfo && details.mediaInfo.status === 5 ? (
                                            <TouchableOpacity
                                                style={styles.playButton}
                                                mode={'outlined'}
                                                onPress={async () => {
                                                    // Determine the platform
                                                    const isIOS = Platform.OS === 'ios';
                                                    // Use the iOSPlexUrl if it's an iOS device, otherwise use the plexUrl
                                                    const url = isIOS ? details.mediaInfo.iOSPlexUrl : details.mediaInfo.plexUrl;
                                                    // Check if the URL can be opened
                                                    const canOpen = await Linking.canOpenURL(url);

                                                    if (canOpen) {
                                                        // Open the URL
                                                        await Linking.openURL(url);
                                                    } else {
                                                        if (await Linking.canOpenURL(details.mediaInfo.plexUrl)) {
                                                            await Linking.openURL(details.mediaInfo.plexUrl);
                                                        } else {
                                                            //console.log(`Can't open the web URL: ${details.mediaInfo.plexUrl}`);
                                                        }
                                                    }
                                                }}
                                            >
                                            <View style={styles.playButtonContainer}>
                                                <Ionicons name={'play-outline'} size={24} color={'#fff'} />
                                                <Text
                                                    style={styles.playText}>Play
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        ) : null}
                                        {!details.mediaInfo && (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    modal()}
                                                mode={'outlined'}
                                                style={styles.requestButton}
                                            >
                                                <View style={styles.rowCenterCenter}>
                                                    <Ionicons name={'download-outline'} size={22} color={'#fff'} />
                                                    <Text style={styles.requestButtonText}>Request</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                        {details.mediaInfo && details.mediaInfo.status === 4 && (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    modal()}
                                                mode={'outlined'}
                                                style={styles.requestButton}
                                            >
                                                <View style={styles.rowCenterCenter}>
                                                    <Ionicons name={'download-outline'} size={22} color={'#fff'} />
                                                    <Text style={styles.requestButtonText}>Request More</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                        {details.relatedVideos && details.relatedVideos.length > 0 && (
                                            <TouchableOpacity
                                                mode={'outlined'}
                                                onPress={() =>
                                                    openTrailer()}
                                                style={styles.watchTrailerButton}
                                            >
                                                <View style={styles.rowCenterCenter}>
                                                    <Ionicons name={'film-outline'} size={22} color={'#fff'} />
                                                    <Text style={styles.watchTrailerButtonText}>Trailer</Text>
                                                </View>
                                            </TouchableOpacity>

                                        )}
                                        <TouchableOpacity
                                            style={{
                                                ...styles.requestButton,
                                                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                                            }}
                                            onPress={() => {
                                                manageDetails();
                                            }}
                                        >
                                            <Ionicons name={'settings-outline'} size={22} color={'#fff'} />
                                        </TouchableOpacity>


                                    </View>
                                {mediaType === 'tv' && details && (
                                    <View
                                        style={[styles.tvStatus,{
                                            backgroundColor: details.status === 'Ended' ? 'rgba(246,35,35,0.65)' : details.status === 'Returning Series' ? '#008000' : 'rgba(246,35,35,0.65)',
                                        }]}
                                    >
                                        <Text style={styles.statusText}>
                                            {details.status}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.rowCenterCenter}>
                                    <Modal
                                        animationType="slide"
                                        transparent={true}
                                        visible={modalVisible}
                                        onRequestClose={() => {
                                            setIsLoading(!isLoading);
                                        }}
                                    >
                                            <View style={styles.centeredView}>
                                                <ImageBackground
                                                    source={{ uri: `https://image.tmdb.org/t/p/w500${details.backdropPath}` }}
                                                    contentFit={'cover'}
                                                    style={[styles.modalBackgroundImage,{
                                                        height: mediaType === 'movie' ? 300 : 'auto',
                                                    }]}
                                                >
                                                    <LinearGradient
                                                        colors={['rgba(33,38,47,0.85)', 'rgba(24,28,35,0.95)']}
                                                        style={[styles.linearGradient,{
                                                            height: mediaType === 'movie' ? 300 : 900,
                                                        }]}
                                                    />
                                                    <Text style={styles.modalText}>Request {mediaType}</Text>
                                                    <Text style={styles.textRequestMedia}>{details.title} {details.name} </Text>
                                                    <View style={styles.messageContainer}>
                                                        <Text style={styles.messageContainerText}>
                                                            {mediaType === 'movie' ? (
                                                                'This request will be approved automatically if available.'
                                                            ) : (
                                                                'Select the season(s) you want to request. Admin will need to approved first.'
                                                            )}
                                                        </Text>
                                                    </View>
                                                    {mediaType === 'tv' && (
                                                        <View style={styles.tvView}>
                                                            <DataTable style={styles.table}>
                                                                <DataTable.Header style={styles.header}>
                                                                    <DataTable.Title><Text style={styles.headerText}>Toggle</Text></DataTable.Title>
                                                                    <DataTable.Title><Text style={styles.headerText}>Season</Text></DataTable.Title>
                                                                    <DataTable.Title numeric><Text style={styles.headerText}>Episodes</Text></DataTable.Title>
                                                                    <DataTable.Title numeric><Text style={styles.headerText}>Status</Text></DataTable.Title>
                                                                </DataTable.Header>

                                                                {details.seasons && details.seasons.map((season, index) => {
                                                                    if (season && season.seasonNumber === 0) {
                                                                        return null;
                                                                    }
                                                                    const mediaInfoSeason = details.mediaInfo && details.mediaInfo.seasons
                                                                        ? details.mediaInfo.seasons.find(s => s.seasonNumber === season.seasonNumber)
                                                                        : null;
                                                                    const status = mediaInfoSeason ? mediaInfoSeason.status : 'Not Requested';

                                                                    return (
                                                                        <DataTable.Row key={index} style={index === details.seasons.length - 1 ? styles.lastRow : styles.row}>
                                                                            <DataTable.Cell>
                                                                                <Text style={styles.rowText}>
                                                                                    <Switch
                                                                                        trackColor={{ false: "#767577", true: "#7927c7" }}
                                                                                        thumbColor={season.isEnabled ? "#f8f8f8" : "#f4f3f4"}
                                                                                        ios_backgroundColor="#3e3e3e"
                                                                                        onValueChange={() => handleToggle(season)}
                                                                                        value={season.isEnabled}
                                                                                        disabled={STATUS_CODES[status] === 'Available'}  // Disable the switch if the status is 'Available'
                                                                                        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}  // This reduces the size of the switch
                                                                                    />
                                                                                </Text>
                                                                            </DataTable.Cell>
                                                                            <DataTable.Cell style={{ flex: 1 }}><Text style={styles.rowText}>{season.seasonNumber}</Text></DataTable.Cell>
                                                                            <DataTable.Cell style={{ flex: 1 }} numeric><Text style={styles.rowText}>{season.episodeCount}</Text></DataTable.Cell>
                                                                            <DataTable.Cell numeric>
                                                                                <View style={{
                                                                                    backgroundColor: getBackgroundColor(status),
                                                                                    borderRadius: 5,
                                                                                    paddingHorizontal: 5,
                                                                                    width: 70,
                                                                                }}>
                                                                                    {status === 'Not Requested' ? (
                                                                                    <Text
                                                                                        numberOfLines={1}
                                                                                        style={styles.rowText}>
                                                                                        {status}
                                                                                    </Text>
                                                                                    ): (
                                                                                        <Text
                                                                                            numberOfLines={1}
                                                                                            style={styles.rowText}>
                                                                                            {STATUS_CODES[status]}
                                                                                        </Text>
                                                                                    )}
                                                                                </View>
                                                                            </DataTable.Cell>
                                                                        </DataTable.Row>
                                                                    )
                                                                })}
                                                            </DataTable>
                                                        </View>
                                                    )}
                                                    <View style={styles.rowSpaceBetween}>
                                                        <TouchableOpacity
                                                            style={{ ...styles.cancelButton }}
                                                            onPress={() => {
                                                                setModalVisible(!modalVisible);
                                                            }}
                                                        >
                                                            <Text style={styles.textStyle}>Cancel</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                requestMedia();
                                                            }}
                                                            mode={'outlined'}
                                                            style={styles.requestButton}
                                                        >
                                                            <View style={styles.rowCenterCenter}>
                                                                <Ionicons name={'download-outline'} size={22} color={'#fff'} />
                                                                <Text style={styles.requestButtonText}>
                                                                    {mediaType === 'tv' ? (selectedSeasons.length === 0 ? 'Select Season(s)' : `Request ${selectedSeasons.length} Season(s)`) : 'Request'}
                                                                </Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                </ImageBackground>
                                            </View>
                                        </Modal>
                                    </View>
                            </View>

                        </ImageBackground>
                    </>
                )}

                {details && details.overview && details.overview.trim().length > 0 && (
                    <View style={styles.containerSection}>
                        <Text style={styles.sectionTitle}>Overview</Text>
                        <Text style={styles.mediaOverview}>{details.overview}</Text>
                    </View>
                )}
                {mediaType === 'tv' && details && details.seasons && details.seasons.length > 0 && (
                    <View style={styles.containerSection}>
                            <Text style={styles.sectionTitle}>Season</Text>
                            {detailsSeasons && detailsSeasons.seasons && detailsSeasons.seasons.length > 0 ? (
                                <View style={[styles.containerSectionManage,{padding:0}]}
                                      key={detailsSeasons.id}
                                >
                                    {detailsSeasons && detailsSeasons.seasons && detailsSeasons.seasons.map((season, index) => {
                                        let mediaInfoSeason;
                                        if (details.mediaInfo && details.mediaInfo.seasons) {
                                            mediaInfoSeason = details.mediaInfo.seasons.find(s => s.seasonNumber === season.seasonNumber);
                                        }
                                        return (
                                            <CustomAccordion
                                                key={`season-${season.seasonNumber}-${index}`}
                                                title={`Season ${season.seasonNumber}`}
                                                content={season.episodes && Array.isArray(season.episodes) ? season.episodes : []}
                                                statusCode={mediaInfoSeason ? mediaInfoSeason.status : undefined}
                                                totalEpisodeCount={season.statistics ? season.statistics.totalEpisodeCount : 0}
                                                route={route}
                                                search={search}
                                                performInteractiveSearch={performInteractiveSearch} // Pass performInteractiveSearch function here
                                            />
                                        );
                                    })}
                                </View>
                            ) : (
                                <View style={styles.containerSectionManage}>
                                    {seasonDetails && seasonDetails.length > 0 ? (
                                        seasonDetails.map((season, index) => (
                                            <CustomAccordion
                                                keyExtractor={index + season.id + Date.now()}
                                                title={`Season ${season.seasonNumber}`}
                                                content={season.episodes}
                                                statusCode={season.status}
                                                totalEpisodeCount={season.episodes.length}
                                                route={route}
                                                search={search}
                                                performInteractiveSearch={performInteractiveSearch}
                                            />
                                        ))
                                    ) : (
                                        <Text style={styles.mediaOverview}>No seasons found</Text>
                                    )}

                                </View>
                            )}
                        </View>
                )}

                {details && details.collection && details.collection && (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('Collection', {
                                id: details.collection.id,
                                mediaType: 'collection',
                            });
                        }}
                        style={styles.containerSection}>
                        <ImageBackground
                            source={{ uri: `https://image.tmdb.org/t/p/w500${details.collection.backdropPath}` }}
                            style={styles.viewCollection}
                            contentFit={'cover'}
                        >
                            <LinearGradient
                                colors={['rgba(33,38,47,0.85)', 'rgba(24,28,35,0.95)']}
                                style={[styles.linearGradient, {
                                    height: 80,
                                }]}
                            />
                            <View style={styles.viewCollectionSection}>
                                <Text style={styles.sectionTitle}>{details.collection.name}</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('Collection', {
                                            id: details.collection.id,
                                            mediaType: 'collection',
                                        });
                                    }}
                                >
                                    <Ionicons name={'arrow-forward-outline'} size={24} color={'#fff'} />
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                )}
                <View style={[styles.containerSection, {
                    borderWidth: 0.6,
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 10,
                    margin:10,
                    padding:0,
                }]}>
                    {details && (
                        <>
                        {mediaType === 'movie' && (
                            <>
                                {details && details.status && details.status.length > 0 &&
                                    <View style={{
                                        flexDirection: 'row',
                                        paddingRight: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderBottomWidth: (ratings && 'criticsScore' in ratings && ratings.criticsScore > 0) ||
                                        (details && 'voteAverage' in details && details.voteAverage > 0) ? 0.4 : 0,
                                        borderColor: (ratings && 'criticsScore' in ratings && ratings.criticsScore > 0) ||
                                        (details && 'voteAverage' in details && details.voteAverage > 0) ? 'rgba(255,255,255,0.43)' : 'transparent'
                                    }}>
                                        {ratings && 'criticsScore' in ratings && ratings.criticsScore > 0 &&
                                            <>
                                                <Image
                                                    source={require('../../../assets/icons/rottentomatoes.png')}
                                                    style={{
                                                        height: 15,
                                                        width: 15,
                                                        marginVertical: 14,
                                                    }}
                                                    contentFit={'contain'}
                                                />
                                                <Text style={{
                                                    color: '#fff',
                                                    fontSize: 15,
                                                    fontWeight: 'bold',
                                                    marginLeft: 5,
                                                    marginTop: 0
                                                }}>{`${ratings.criticsScore} %`}</Text>
                                            </>
                                        }
                                        {details && 'voteAverage' in details && details.voteAverage > 0 &&
                                            <>
                                                <Image
                                                    source={require('../../../assets/icons/tmdb.png')}
                                                    style={{
                                                        height: 13,
                                                        width: 40,
                                                        marginTop: 2,

                                                    }}
                                                    contentFit={'contain'}
                                                />
                                                <Text style={{
                                                    color: '#fff',
                                                    fontSize: 13,
                                                    fontWeight: 'bold',
                                                    marginLeft: 5,
                                                    marginVertical: 14,
                                                }}>
                                                    {`${details.voteAverage} %`}
                                                </Text>
                                            </>
                                        }

                                    </View>
                                }
                                    <View style={styles.itemNew}>
                                        <Text style={styles.label}>Original Title</Text>
                                        <Text style={styles.value} numberOfLines={1}>{details.originalTitle}</Text>
                                    </View>
                                    <View style={styles.itemNew}>
                                        <Text style={styles.label}>Status</Text>
                                        <Text style={styles.value}>{details.status}</Text>
                                    </View>
                                {details.releaseDate &&
                                    <View style={styles.itemNew}>
                                        <Text style={styles.label}>Release Date</Text>
                                        <View
                                            style={{
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',

                                            }}
                                        >
                                            <Text style={styles.value}>
                                                {new Date(details.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {
                                                    (() => {
                                                        const result = details.releases.results.find(result =>
                                                            result.release_dates.some(release => release.type === 4)
                                                        );

                                                        if (result) {
                                                            const release = result.release_dates.find(release => release.type === 4);
                                                            return (
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Ionicons
                                                                        style={{ marginRight: 5 }}
                                                                        name="cloudy-outline" size={19} color="white"
                                                                    />
                                                                    <Text style={styles.value}>
                                                                        {new Date(release.release_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                    </Text>
                                                                </View>
                                                            );
                                                        } else {
                                                            return '';
                                                        }
                                                    })()
                                                }
                                            </View>
                                        </View>
                                    </View>
                                }

                                {details && details.budget !== null && details.budget !== undefined && details.budget !== 0 &&
                                    <View style={styles.itemNew}>
                                        <Text style={styles.label}>Budget</Text>
                                        <Text style={styles.value}>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.budget)}
                                        </Text>
                                    </View>
                                }
                                {details && details.revenue !== null && details.revenue !== undefined && details.revenue !== 0 &&
                                    <View style={styles.itemNew}>
                                        <Text style={styles.label}>Revenue</Text>
                                        <Text style={styles.value}>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.revenue)}
                                        </Text>
                                    </View>
                                }
                            </>
                        )}
                            {mediaType === 'tv' && (
                                <>
                                    <View style={styles.itemNew}>
                                        <Text style={styles.label}>Status</Text>
                                        <Text style={styles.value}>{details.status}</Text>
                                    </View>
                                    {details.releaseDate &&
                                        <View style={styles.itemNew}>
                                            <Text style={styles.label}>First Air Date</Text>
                                            <Text style={styles.value}>
                                                {new Date(details.releaseDate).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    }
                                    {details.firstAirDate &&
                                        <View style={styles.itemNew}>
                                            <Text style={styles.label}>First Aired</Text>
                                            <Text style={styles.value}>
                                                {new Date(details.firstAirDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </Text>
                                        </View>
                                    }
                                    {!details.lastAirDate && details.nextAirDate &&
                                        <View style={styles.itemNew}>
                                            <Text style={styles.label}>Next Air Date</Text>
                                            <Text style={styles.value}>
                                                {new Date(details.nextAirDate).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    }
                                    {details.episodeRunTime && details.episodeRunTime.length > 0 &&
                                        <View style={styles.itemNew}>
                                            <Text style={styles.label}>Episode Time</Text>
                                            <Text style={styles.value}>{details.episodeRunTime} minutes</Text>
                                        </View>
                                    }
                                    {details.networks && details.networks.length > 0 &&
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (details.networks && details.networks.length > 0) {
                                                    navigation.navigate('Network', { id: details.networks[0].id, mediaType: mediaType});
                                                }
                                            }}
                                            style={styles.itemNew}>
                                            <Text style={styles.label}>Network</Text>
                                            <Text style={styles.value}>{details.networks.map(network => network.name).join(', ')}</Text>
                                        </TouchableOpacity>
                                    }
                                </>
                            )}
                            {details.originalLanguage &&
                                <TouchableOpacity
                                    onPress={() => {
                                        if (details.originalLanguage) {
                                            navigation.navigate('Languages', { id: details.originalLanguage, mediaType: mediaType });
                                        }
                                    }}
                                    style={styles.itemNew}>
                                    <Text style={styles.label}>Original Language</Text>
                                    {details.originalLanguage && (
                                        <Text style={styles.value}>{languageMap[details.originalLanguage]}</Text>
                                    )}
                                </TouchableOpacity>
                            }
                            {details.productionCountries && details.productionCountries.length > 0 &&
                                <View style={[styles.itemNew, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.label}>Production Countries</Text>
                                    <View style={[styles.value, { flexDirection: 'column', flexWrap: 'wrap' }]}>
                                        {details.productionCountries.map(country => (
                                            <View key={country.iso_3166_1} style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                <Flag
                                                    code={country.iso_3166_1}
                                                    size={13}
                                                />
                                                <Text style={styles.value}> {country.name}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            }
                        </>
                    )}
                </View>
                {details && details.credits && details.credits.cast.length > 0 ? (
                <View style={styles.containerSection}>
                    <Text style={styles.sectionTitle}>Casts and Crew</Text>
                </View>
                ) : null}

                {details && details.credits && details.credits.cast && (
                    <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.castContainer}>
                        {details.credits.cast.map((castMember, index) => (
                            <TouchableOpacity
                                onPress={() => navigation.push('ActorDetails', { castid: castMember.id, mediaType: castMember.mediaType })}
                                key={index}
                                style={styles.castCard}
                            >
                                {castMember.profilePath ? (
                                <Image
                                    source={{ uri: `https://image.tmdb.org/t/p/w500${castMember.profilePath}` }}
                                    style={styles.castImage}
                                />

                                ) : (
                                    <ImageBackground

                                        source={require('../../../assets/icon.png')}
                                        style={styles.castImage}
                                        contentFit={'cover'}
                                        imageStyle={{ borderRadius: 100}}
                                    >
                                    </ImageBackground>
                                )}
                                <Text numberOfLines={1} style={styles.castName}>{castMember.name}</Text>
                                <Text numberOfLines={1} style={styles.castCharacter}>{castMember.character}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {similar && similar.results.length > 0 && (
                <View>
                    <View style={styles.containerSection}>
                        <Text style={styles.sectionTitle}>
                            Similar
                            {mediaType === 'tv' ? ' Series' : ''}
                            {mediaType === 'movie' ? ' Movies' : ''}
                        </Text>
                    </View>
                    <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={{marginHorizontal: 5}}
                    >
                        {similar && similar.results.map((similarMedia, index) => (
                            <TouchableOpacity
                                style={{ marginRight: 10}}
                                onPress={() => navigation.push('MediaDetails', { id: similarMedia.id, mediaType: similarMedia.mediaType })}
                                key={index}
                            >
                                {similarMedia.posterPath ? (
                                    <Image
                                        source={{ uri: `https://image.tmdb.org/t/p/w500${similarMedia.posterPath}` }}
                                        style={styles.mediaPoster}
                                        contentFit={'cover'}
                                        transitionDuration={1000}
                                    />
                                ) : (
                                    <ImageBackground
                                        source={require('../../../assets/icon.png')}
                                        style={styles.noPoster}
                                        contentFit={'cover'}
                                        imageStyle={{ borderRadius: 10}}
                                    >
                                        <LinearGradient
                                            colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                                            style={styles.linearGradient}
                                        />
                                    </ImageBackground>

                                )}
                                <View style={styles.topTextMediaTextRow}>
                                    <View style={[styles.topTextMediaContainer,
                                        {borderWidth:2,height: 22,
                                            borderColor: similarMedia.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgba(37,99,235,0.99)',
                                            backgroundColor: similarMedia.mediaType === 'tv' ? 'rgba(147,51,234,0.73)' : 'rgba(37,99,235,0.65)'}]}
                                    >
                                        <Text style={styles.topTextMediaText}>{similarMedia.mediaType === 'tv' ? 'SERIES' : similarMedia.mediaType}</Text>
                                    </View>
                                    <View style={{flexDirection: 'row',alignItems: 'flex-end',}}>
                                        {similarMedia.mediaInfo &&
                                            <View style={[styles.topTextMediaContainer2,{
                                                backgroundColor:  similarMedia.mediaInfo && similarMedia.mediaInfo.status === 3 ? 'rgba(99, 102, 241, 0.8)' : '#dcfce7',
                                                borderWidth: similarMedia.mediaInfo && similarMedia.mediaInfo.status === 3 ? 0 : 2,
                                                borderColor: similarMedia.mediaInfo && similarMedia.mediaInfo.status === 3 ? 'transparent' : '#059b2e',
                                            }]}>
                                                {similarMedia.mediaInfo && similarMedia.mediaInfo.status === 5 && <Entypo name="check" size={14} color="#059b2e" />}
                                                {similarMedia.mediaInfo && similarMedia.mediaInfo.status === 4 && <Octicons name="dash" size={14} color="#059b2e" />}
                                                {similarMedia.mediaInfo && similarMedia.mediaInfo.status === 3 && <Ionicons name="time-sharp" size={21} color="white" />}
                                            </View>
                                        }
                                        <Text style={styles.title}>{similarMedia.status}</Text>
                                    </View>

                                </View>
                            </TouchableOpacity>
                        ))}

                    </ScrollView>
                    {recommendations && recommendations.results.length > 0 && (
                    <View style={{marginBottom:50}}>
                        <View style={styles.containerSection}>
                            <Text style={styles.sectionTitle}>Recommendations</Text>
                        </View>
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            style={{marginHorizontal: 5}}
                            >
                            {recommendations && recommendations.results.map((recommendation, index) => (
                                <TouchableOpacity
                                    style={{ marginRight: 10}}
                                    onPress={() => navigation.push('MediaDetails', { id: recommendation.id, mediaType: recommendation.mediaType })}
                                    key={index} >

                                    {recommendation.posterPath ? (
                                        <Image
                                            source={{ uri: `https://image.tmdb.org/t/p/w500${recommendation.posterPath}` }}
                                            style={styles.mediaPoster}
                                            contentFit={'cover'}
                                            transitionDuration={1000}
                                        />
                                    ) : (
                                        <ImageBackground
                                            source={require('../../../assets/icon.png')}
                                            style={styles.mediaPoster}
                                            contentFit={'cover'}
                                            imageStyle={{ borderRadius: 10}}  // Apply the border radius to the image
                                        >
                                            <LinearGradient
                                                colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                                                style={styles.linearGradient2}
                                            />
                                        </ImageBackground>

                                    )}
                                    <View style={styles.topTextMediaTextRow}>
                                        <View style={[styles.topTextMediaContainer,
                                            {borderWidth:2,height: 22,
                                                //borderColor: 'rgba(37,99,235,0.99)',
                                                borderColor: recommendation.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgba(37,99,235,0.99)',
                                                backgroundColor: recommendation.mediaType === 'tv' ? 'rgba(147,51,234,0.73)' : 'rgba(37,99,235,0.65)'}]}
                                        >
                                            <Text style={styles.topTextMediaText}>{recommendation.mediaType === 'tv' ? 'SERIES' : recommendation.mediaType}</Text>
                                        </View>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'flex-end',
                                        }}>
                                            {recommendation.mediaInfo &&
                                                <View style={[styles.topTextMediaContainer2,{
                                                    borderWidth: recommendation.mediaInfo && recommendation.mediaInfo.status === 3 ? 0 : 2,
                                                    backgroundColor: recommendation.mediaInfo === 3 ? 'rgba(99, 102, 241, 0.8)' : (recommendation.mediaInfo.status === 4 ? '#059b2e' : '#dcfce7'),
                                                    borderColor: recommendation.mediaInfo === 3 ? 'transparent' : (recommendation.mediaInfo.status === 4 ? '#dcfce7' : '#059b2e'),
                                                }]}>
                                                    {recommendation.mediaInfo && recommendation.mediaInfo.status === 5 && <Entypo name="check" size={14} color="#059b2e" />}
                                                    {recommendation.mediaInfo && recommendation.mediaInfo.status === 4 && <Octicons name="dash" size={14} color="#dcfce7" />}
                                                    {recommendation.mediaInfo && recommendation.mediaInfo.status === 3 && <Ionicons name="time-sharp" size={21} color="white" />}
                                                </View>
                                            }
                                            <Text style={styles.title}>{recommendation.status}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    )}
                </View>
                )}
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisibleIssue}
                onRequestClose={() => {
                    setModalVisibleIssue(!modalVisibleIssue);
                }}
                style={styles.modalCont}
            >
                <View style={styles.modalViewContainer}>
                    <ImageBackground
                        source={{ uri: details && details.backdropPath ? `https://image.tmdb.org/t/p/w500${details.backdropPath}` : 'default_image_uri' }}
                        borderRadius={10}
                        style={styles.modalViewImageBackground}>
                        <LinearGradient
                            colors={['rgba(33,38,47,0.85)', 'rgba(24,28,35,0.95)']}
                            style={styles.linearGradient}
                        />
                        <Text style={styles.reportText}>Report an Issue</Text>
                        <Text style={styles.reportDetails}>
                            {details && (details.title || details.name) ? (details.title || details.name) : 'Default Value'}
                        </Text>
                        <View style={{ height: 220, overflow: 'hidden' }}>
                            <FlatList
                                data={issueTypeArray}
                                renderItem={renderItemGroup}
                                style={styles.issueContainer}
                                scrollEnabled={false}
                                keyExtractor={(item) => item.key}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.title}>What's wrong?</Text>
                            <TextInput
                                mode={'flat'}
                                style={styles.input}
                                placeholderTextColor={'rgba(164,164,164,0.73)'}
                                underlineColor={'transparent'}
                                activeUnderlineColor={'transparent'}
                                textColor={'rgba(224,222,222,0.96)'}
                                multiline={true}
                                textAlignVertical='top'
                                theme={{ colors: { primary: '#ffffff' } }}
                                onChangeText={(text) => setIssueText(text)}
                            />
                            <View style={styles.viewSaveCancel}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setModalVisibleIssue(!modalVisibleIssue);
                                    }}
                                >
                                    <Text style={styles.textStyle}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.requestButton}
                                    onPress={() => {
                                        submitIssue();
                                        setModalVisibleIssue(!modalVisibleIssue);
                                    }}
                                >
                                    <Text style={styles.requestButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            </Modal>
        </View>
        <BottomSheetModal
            ref={trailerModalRef}
            index={0}
            snapPoints={['35%']}
            backgroundComponent={CustomBackground}
            style={styles.youtubeBottomSheetStyle}
            enablePanDownToClose={true}
        >
            <View style={styles.youtubeBottomSheet}>
                {videoId && (
                    <YoutubePlayer
                        width={'100%'}
                        height={300}
                        play={true}
                        videoId={videoId}
                        webViewProps={{
                            allowsFullscreenVideo: true,
                            allowsInlineMediaPlayback: true,
                        }}
                        borderRadius={10}
                    />
                )}
            </View>
        </BottomSheetModal>
        <BottomSheetModal
            ref={manageDetailsModalRef}
            index={0}
            snapPoints={['40%',300,600, 900]}
            handleComponent={null}
            backgroundComponent={CustomBackground}
            style={styles.manageDetailsStyle}
        >
            <View style={styles.manageModal}>
                <View style={styles.containerSectionManage}>
                    <Text style={styles.manageTitles}>Manage Details</Text>
                    {
                        (details?.name || details?.title) && (
                            <Text style={styles.manageTextDetails} numberOfLines={1}>
                                {details.name || details.title} (
                                {(details?.releaseDate || details?.firstAirDate) && (
                                    new Date(details.releaseDate || details.firstAirDate)
                                ).getFullYear()}
                                )
                            </Text>
                        )
                    }
                </View>
                <View style={styles.containerSectionManage}>
                    <View style={styles.manageDetailsContainer}>
                        <Text style={styles.manageDetailsSubTitle}>Media</Text>
                            {userDetails && userDetails.permissions === 16777506 && mediaType !== "tv" &&  (
                                <TouchableOpacity
                                    onPress={async () => {
                                        let { id, mediaType } = route.params;
                                        search();
                                        await performInteractiveSearch(id, mediaType);
                                    }}
                                >
                                    <Ionicons name={'search-outline'} size={22} color={'#fff'} />
                                </TouchableOpacity>
                            )}
                    </View>
                    <View style={styles.rowJustManage}>
                        <View style={[styles.manageTrack,{borderLeftWidth: 0}]}>
                            <Text numberOfLines={1} style={styles.detailsTitleManage}>Past 7 Days</Text>
                            <Text style={styles.detailsInfoManage}>
                                {playData.past7Days} Plays
                            </Text>
                        </View>
                        <View style={styles.manageTrack}>
                            <Text numberOfLines={1} style={styles.detailsTitleManage}>Past 30 Days</Text>
                            <Text style={styles.detailsInfoManage}>{playData.past30Days} plays</Text>
                        </View>
                        <View style={styles.manageTrack}>
                            <Text  numberOfLines={1} style={styles.detailsTitleManage}>All Time</Text>
                            <Text style={styles.detailsInfoManage}>{playData.allTime} plays</Text>
                        </View>
                    </View>
                    <View style={{marginBottom: 20,marginLeft: -7}}>
                        {mediaType === 'tv' && details && details.seasons && details.seasons.length > 0 && (
                            <View style={styles.containerSection}>
                                <Text style={styles.sectionTitle}>Season</Text>
                                {detailsSeasons && detailsSeasons.seasons && detailsSeasons.seasons.length > 0 ? (
                                    <View style={[styles.containerSectionManage,{padding:0}]} key={detailsSeasons.id + Date.now()}>
                                        {detailsSeasons && detailsSeasons.seasons && detailsSeasons.seasons.map((season, index) => {
                                            let mediaInfoSeason;
                                            if (details.mediaInfo && details.mediaInfo.seasons) {
                                                mediaInfoSeason = details.mediaInfo.seasons.find(s => s.seasonNumber === season.seasonNumber);
                                            }
                                            return (
                                                <CustomAccordion
                                                    title={`Season ${season.seasonNumber}`}
                                                    content={season.episodes && Array.isArray(season.episodes) ? season.episodes : []}
                                                    statusCode={mediaInfoSeason ? mediaInfoSeason.status : undefined}
                                                    totalEpisodeCount={season.statistics ? season.statistics.totalEpisodeCount : 0}
                                                    route={route}
                                                    search={search}
                                                    performInteractiveSearch={performInteractiveSearch}
                                                />
                                            );
                                        })}
                                    </View>
                                ) : (
                                    <View style={styles.containerSectionManage}>
                                        {seasonDetails && seasonDetails.length > 0 ? (
                                            seasonDetails.map((season, index) => {
                                                let episodes = season.episodes && Array.isArray(season.episodes) ? season.episodes : [];
                                                let status = season.status ? season.status : undefined;
                                                let totalEpisodeCount = episodes.length;
                                                return (
                                                    <CustomAccordion
                                                        keyExtractor={index}
                                                        title={`Season ${season.seasonNumber}`}
                                                        content={episodes}
                                                        statusCode={status}
                                                        totalEpisodeCount={totalEpisodeCount}
                                                        route={route}
                                                        search={search}
                                                        performInteractiveSearch={performInteractiveSearch}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <Text style={styles.mediaOverview}>No seasons found</Text>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </BottomSheetModal>
        <BottomSheetModal
            ref={bottomSheetInterractiveSearchRef}
            index={0}
            snapPoints={['70%',300,600]}
            backgroundComponent={CustomBackground}
            style={styles.bottomSheetInSearchStyle}
        >
            {isReleaseLoading ? (
                <ActivityIndicator size="large" color="#ffffff" />
            ) : (
                <ScrollView>
                    <View style={styles.justifyCenter}>
                        <View style={styles.justifyCenter}>
                            <Text style={styles.releasesTitle}>{searchResults.length} releases found</Text>
                        </View>
                    </View>
                    {searchResults.map((release, index) => (
                        <ScrollView key={index} style={styles.scrollViewReleases}>
                            <TouchableOpacity onPress={() => setExpandedIndex(index)}>
                                <Text numberOfLines={1} style={styles.selectedText}>{release.title}</Text>
                                <View style={{ flexDirection: 'row'}}>
                                    <Text style={styles.selectedText}>{release.age} days old</Text>
                                    <Text style={styles.selectedText}>{release.protocol}</Text>
                                    <Text style={styles.selectedText}>{release.indexer}</Text>
                                </View>
                                <View style={{ flexDirection: 'row'}}>
                                    <Text style={styles.selectedText}>
                                        {release.size / 1073741824 < 1
                                            ? `${(release.size / 1048576).toFixed(2)} MB`
                                            : `${(release.size / 1073741824).toFixed(2)} GB`}
                                    </Text>
                                    {release.languages && release.languages.map((language, index) => (
                                        <Text key={index} style={styles.selectedText}>
                                            {language.name}
                                        </Text>
                                    ))}
                                </View>
                            </TouchableOpacity>
                            {expandedIndex === index && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity
                                        style={styles.rejectionButton}
                                        onPress={() => {
                                            setSelectedRelease(release);
                                            setModalVisible(true);
                                        }}>
                                        <Text>Rejections</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.downloadReleases}
                                        onPress={() => downloadMedia(release, mediaType, id)}>
                                        <Text>Download</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                        )
                    )}
                </ScrollView>
            )}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                    activeOpacity={1}
                    onPressOut={() => {setModalVisible(!modalVisible)}}
                >
                    <View style={styles.flexCenter}>
                        <View style={styles.modalResults}>
                            {selectedRelease && selectedRelease.rejections.map((rejection, index) => (
                                <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5 }}>
                                    <Text>{'\u2022'}</Text>
                                    <Text style={{ flex: 1, paddingLeft: 5 }}>{rejection}</Text>
                                </View>
                            ))}
                            <TouchableOpacity
                                style={styles.hideButton}
                                onPress={() => setModalVisible(!modalVisible)}
                            >
                                <Text>Hide Modal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={downloadModalVisible}
                    onRequestClose={() => {
                        setDownloadModalVisible(!downloadModalVisible);
                    }}
                    activeOpacity={1}
                    onPressOut={() => {setDownloadModalVisible(false)}}
                >
                        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                            <View style={styles.downloadStatusContainer}>
                                <Text style={styles.downloadStatusText}>{downloadStatus}</Text>
                            </View>
                        </View>
                    </Modal>
                </BottomSheetModal>
        </BottomSheetModalProvider>
    );
};

const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#161f2e'
        },
        imageBackground: {
            height: 500,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',

        },
        mediaTitle: {
            color: '#fff',
            fontSize: 17,
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: 10,
            marginBottom: 10,
        },
        mediaInfo: {
            color: '#adabab',
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 10,
        },
        mediaOverview: {
            color: '#fff',
            fontSize: 16,
            textAlign: 'left',
            marginBottom: 10,
        },
        playButton: {
            backgroundColor: 'transparent',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 10,
            marginRight: 2,
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 1,
            justifyContent: 'center',
            paddingHorizontal: 10,
        },
        playText: {
            color: '#fff', fontSize: 16, marginLeft: 10,paddingTop:3
        },
        playButtonContainer: {
            flexDirection: 'row', justifyContent: 'center',padding:5,
        },
        warningButton: {
            backgroundColor: '#e3941f',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 10,
            marginLeft: 10,
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 1,
            paddingHorizontal: 10,
            justifyContent: 'center',
        },
        settingsButton: {
            backgroundColor: 'transparent',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 10,
            marginLeft: 10,
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 1,
            paddingHorizontal: 10,
            justifyContent: 'center',
        },
        mediaPoster: {
            width: 140,
            height: 210,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'rgba(143,143,143,0.11)',
        },
        linearGradient: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '100%',
            width: '100%',
        },
        linearGradient2: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 190,
            borderRadius: 10,
            width: '100%',
            aspectRatio: 2/3,
        },
        mediaStatus: {
            color: '#fff',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 10,
        },
        playContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginHorizontal: 20,

        },
        rowCenterCenter: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        requestButton: {
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            fontSize: 16,
            textAlign: 'center',
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
        watchTrailerButton: {
            backgroundColor: 'transparent',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 10,
            marginLeft: 10,
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 1,
            padding: 7,
            paddingHorizontal: 10,
            justifyContent: 'center',
        },
        watchTrailerButtonText: {
            color: '#fff',
            fontSize: 17,
            marginLeft: 10,
            marginRight: 10,
        },
        sectionTitle: {
            color: '#fff',
            fontSize: 20,
            textAlign: 'left',
            marginVertical: 10,
            fontWeight: 'bold',
            paddingVertical: 10,
            textTransform: 'capitalize',
        },
        containerSection: {
            padding: 10,
        },
        containerSectionManage: {
            borderBottomColor: 'rgba(140,138,138,0.74)',
            padding: 10,
        },
        rowJust: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        rowJustManage: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: 'rgba(140,138,138,0.74)',
            borderRadius: 10,
            marginVertical: 10,
        },
        leftDetails: {
            padding: 10,
        },
        leftDetailsContent: {
            padding: 10,

        },
        rightDetails: {
            padding: 10,
        },
        manageTrack: {
            padding: 5,
            borderLeftWidth: 0.7,
            borderLeftColor: 'rgba(140,138,138,0.74)',
            width: '30%',
        },
        rightDetailsContent: {
            padding: 10,
        },
        detailsTitle: {
            color: '#fff',
            fontSize: 20,
            textAlign: 'left',
            marginVertical: 10,
            fontWeight: 'bold',
            paddingVertical: 10,
        },
        detailsInfo: {
            color: '#adabab',
            fontSize: 14,
            textAlign: 'left',
            marginBottom: 10,
        },
        detailsTitleManage: {
            color: '#fff',
            fontSize: 15,
            textAlign: 'left',
            marginVertical: 5,
            fontWeight: 'bold',
            paddingHorizontal: 5,

        },
        detailsInfoManage: {
            color: '#adabab',
            fontSize: 19,
            textAlign: 'left',
            fontWeight: 'bold',
            paddingHorizontal: 5,
        },
        rating: {
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
        },
        infoContainer: {
            paddingHorizontal: 0,
            marginVertical: 0,
        },
        infoTitle: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        infoContent: {
            color: '#fff',
            fontSize: 14,
        },
        countriesContainer: {
            flexDirection: 'row',
        },
        containerInfo: {
            padding: 0,
            borderRadius: 10,
            borderColor: 'rgba(129,127,127,0.71)',
            borderWidth: 1,
            marginBottom: 50
        },
        rowSpaceBetween: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomColor: 'rgba(140,138,138,0.74)',
            paddingHorizontal: 5,
            paddingVertical: 5,
        },
        castContainer: {
            flexDirection: 'row',
            marginBottom: 40,
        },
        castCard: {
            height: 240,
            width: 170,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'rgba(143,143,143,0.11)',
            margin: 5,
            backgroundColor: 'rgb(31 41 55)',
            opacity: 1,
            padding: 10,
            alignItems: 'center',

        },
        castImage: {
            height: 130,
            width: 130,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
        },
        castName: {
            color: '#fff',
            fontSize: 16,
            textAlign: 'center',
            marginVertical: 10,
            fontWeight: 'bold',
        },
        castCharacter: {
            color: '#cecdcd',
            fontSize: 14,
        },

    topTextMediaTextRow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    topTextMediaContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        margin: 7,
    },
    topTextMediaContainer2 : {
        width: 22,
        height: 22,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: -15,
        marginBottom: 15,
    },
    topTextMediaText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        paddingHorizontal: 5,
    },
    title: {
        color: '#b7b7b7',
        fontSize: 14,
        fontWeight: 'bold',
        paddingVertical: 15,
        paddingHorizontal: 10,
        textTransform: 'capitalize',

    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    modalView: {
        margin: 10,
        backgroundColor: "#161f2e",
        borderRadius: 10,
        padding: 25,
        alignItems: "center",

        width: '90%',

    },
   cancelButton: {
       backgroundColor: 'transparent',
       fontSize: 16,
       textAlign: 'center',
       marginBottom: 10,
       marginLeft: 10,
       borderRadius: 5,
       borderColor: '#fff',
       borderWidth: 1,
       padding: 7,
       justifyContent: 'center',
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        color: '#7743bd',
        fontSize: 20,
        fontWeight: 'bold',
    },
    table: {
        backgroundColor: 'rgb(31,41,55)',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
    },
    header: {
        backgroundColor: '#323d4c',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    headerText: {
        color: 'white',
    },
    row: {
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    },
    lastRow: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    rowText: {
        color: 'white',
    },
    issueContainer: {
        borderWidth: 1,
        borderColor: '#565454',
        borderRadius: 10,
        padding: 0,
        marginHorizontal: 10,
        height: 30,
        marginTop: 30,
    },
    inputContainer: {
        marginBottom: 20,
        marginHorizontal: 10,
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
        paddingHorizontal: 10,
        paddingTop: 0,
        paddingBottom: -10,
        width: '100%',
    },


    item: {
        padding: 0,
        marginVertical: 0,
        marginHorizontal: 0,
    },
    manageButton: {
        backgroundColor: 'rgb(30,117,55)',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
        marginLeft: 0,
        borderRadius: 5,
        borderWidth: 1,
        padding: 7,
        justifyContent: 'center',
    },
    selectedText: {
        color: '#ffffff',
        fontSize: 13,
        paddingVertical: 5,
        paddingLeft: 5,
        textTransform: 'capitalize',
    },
    itemNew: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 0.4,
        borderBottomColor: 'rgba(255,255,255,0.43)',
    },
    label: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',

    },
    value: {
        fontSize: 16,
        color: 'srgb(156, 163, 175)',
        alignSelf: 'flex-end',

    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#161f2e'
    },
    statusView: {
        alignItems: 'center',
        borderRadius: 50,
        paddingHorizontal:9,
        borderWidth:1,
        marginTop:20,
        borderColor:'rgba(255,255,255,0.43)',
    },
    statusText :{
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    tvStatus: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.43)',
        width: '100%',
        borderRadius: 50,
        paddingHorizontal: 10,
        alignSelf: 'center',
    },
    modalBackgroundImage: {
        width: '95%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        flexDirection: 'column',
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(119,67,189,0.52)',
    },
    textRequestMedia: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'left',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    messageContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(2,2,2,0.19)',
        padding: 10,
        borderWidth: 1,
        borderColor: '#7743bd',
        borderRadius: 10,
        width: '100%',
        marginBottom: 20,
    },
    messageContainerText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'left',
        marginBottom: 10,
    },
    tvView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderRadius: 10,
    },
    tvViewText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'left',
        marginBottom: 10,
    },
    viewCollection: {
        height: 80,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        flexDirection: 'column',
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.43)',
    },
    viewCollectionSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    noPoster: {
        height: 190,
        borderRadius: 5,
        width: '100%',
        position: 'absolute',
        alignSelf: 'center',
    },
    modalCont: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    modalViewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.29)',
        borderRadius: 10,
    },
    modalViewImageBackground: {
        width: '90%',
        backgroundColor: 'rgb(243,243,243)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(228,167,245,0.27)',
    },
    reportText: {
        color: 'rgba(226,76,231,0.71)',
        fontSize: 23,
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 13,
        paddingBottom: 10,
    },
    youtubeBottomSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 20,
        marginBottom:20
    },
    youtubeBottomSheetStyle : {
        backgroundColor: '#161f2e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flex: 1,
    },
    manageDetailsStyle: {
        backgroundColor: '#161f2e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(140,138,138,0.74)',
        flex: 1,
    },
    reportDetails: {
        color: '#eae8e8',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 0,
        padding: 0,
    },
    viewSaveCancel: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 10,
        justifyContent: 'center',
    },
    manageModal: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 0,
    },
    manageTitles :{
        color: '#fff',
        fontSize: 25,
        textAlign: 'left',
        fontWeight: 'bold',
    },
    manageTextDetails: {
        color: '#adabab',
        fontSize: 18,
        textAlign: 'left',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    manageDetailsSubTitle: {
        color: '#fff',
        fontSize: 20,
        textAlign: 'left',
        fontWeight: 'bold',
    },
    manageDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    bottomSheetInSearchStyle: {
        backgroundColor: '#161f2e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 0.7,
        borderColor: 'rgba(140,138,138,0.74)',
    },
    justifyCenter: {
        flex: 1, justifyContent: 'center'
    },
    releasesTitle: {
        color: '#ffffff',
        fontSize:18,
        paddingHorizontal:10,
        paddingVertical:10,
        fontWeight:'bold'
    },
    scrollViewReleases: {
        margin: 2,
        backgroundColor: 'rgba(105,124,192,0.29)',
        borderRadius: 10,
        opacity: 0.8,
        padding: 5,
        marginHorizontal: 10,
    },
    rejectionButton: {
        backgroundColor: 'rgba(255,255,255,0.66)',
        borderRadius: 10,
        alignItems: 'center',
        padding: 8,
        width: '45%',
        marginVertical: 5,
    },
    downloadReleases: {
        backgroundColor: 'rgba(255,255,255,0.66)',
        borderRadius: 10,
        alignItems: 'center',
        padding: 8,
        width: '45%',
        marginVertical: 5,
    },
    flexCenter: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalResults: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    hideButton: {
        backgroundColor: "#2196F3",
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 15
    },
    downloadStatusContainer: {
        backgroundColor: 'rgba(79,220,123,0.94)',
        padding: 20,
        marginHorizontal:15,
        marginVertical:15,
        borderRadius: 20,
    },
    downloadStatusText: {
        color: '#fff',
        fontSize: 17,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 10,
    }


});
export default MediaDetailsScreen;
