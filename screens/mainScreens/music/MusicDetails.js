import React, {useContext, useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    ActivityIndicator,
    FlatList, Modal
} from 'react-native';
import {ImageBackground} from "expo-image";
import TokenContext from "../../../context/TokenContext";
import {FontAwesome, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {Audio} from "expo-av";
import config from "../../../config";
import BottomSheet, {BottomSheetModal, BottomSheetModalProvider} from "@gorhom/bottom-sheet";

const MusicDetails = ({ route, navigation }) => {
    const [details, setDetails] = useState(null);
    const { id, type } = route.params; // Get the ID and type from the route params
    const { token, setToken } = useContext(TokenContext);
    const [relatedAlbums, setRelatedAlbums] = useState(null);
    const [tracksData, setTracksData] = useState(null);
    let artistName, trackName;
    const [sound, setSound] = useState(null);
    const [playingTrack, setPlayingTrack] = useState(null); // Add this line
    const [isLoading, setIsLoading] = useState(true);
    const [releases, setReleases] = useState(null);
    const downloadAlbumModalRef = useRef(null);
    const manageDetailsModalRef = useRef(null);
    const [singleTrack, setSingleTrack] = useState(null); // Add this state for the single track

    // State variable to hold the list of albums
    const [albums, setAlbums] = useState([]);

    // Function to handle the selection of an album
    const [profiles, setProfiles] = useState(null);

    let lidarrUrl,
        lidarrApiKey

    lidarrUrl = config.lidarrUrl
    lidarrApiKey = config.lidarrApiKey

    async function stopSound() {
        console.log('Unloading Sound');
        await sound.unloadAsync();
        setSound(undefined);
        setPlayingTrack(null); // Add this line
    }
    async function playPreview(url, id) {
        console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync(
            { uri: url }
        );
        setSound(sound);
        setPlayingTrack(id); // Add this line

        console.log('Playing Sound');
        await sound.playAsync();

        // Add an event listener that fires when the audio playback finishes
        sound.setOnPlaybackStatusUpdate(async (playbackStatus) => {
            if (playbackStatus.didJustFinish) {
                // The playback just finished, so we unload the sound and reset the state
                await sound.unloadAsync();
                setSound(undefined);
                setPlayingTrack(null);
            }
        });
    }
    if (details) {
        if (type === 'album') {
            artistName = details.artists[0].name;
            trackName = details.name;
        } else if (type === 'track') {
            artistName = details.artists[0].name; // Use the artists array from the track details
            trackName = details.name;
        }
    }

    async function fetchWebApi(endpoint, method, body) {
        // Use the token from the context
        if (!token || !token.accessToken) {
            console.error('No access token found');
            return;
        }
        console.log('Token found, proceeding with the API call...');

        const res = await fetch(`https://api.spotify.com/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
            },
            method,
            body: JSON.stringify(body)
        });
        const data = await res.json();
        //console.log(data); // Log the response data
        return data;
    }


    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                let response;
                let artistId;
                if (type === 'album') {
                    response = await fetchWebApi(`v1/albums/${id}`, 'GET');
                    const tracksResponse = await fetchWebApi(`v1/albums/${id}/tracks`, 'GET');
                    setTracksData(tracksResponse.items);

                    // Extract the artist's ID from the album details
                    artistId = response.artists[0].id;

                } else if (type === 'track') {
                    response = await fetchWebApi(`v1/tracks/${id}`, 'GET');
                    setSingleTrack(response); // Set the single track
                    response = response.album; // Use the album object from the track details

                    // Extract the artist's ID from the track details
                    artistId = response.artists[0].id;
                }

                // Fetch the artist's albums
                const albumsResponse = await fetchWebApi(`v1/artists/${artistId}/albums`, 'GET');
                setRelatedAlbums(albumsResponse.items);

                setDetails(response);
                //console.log('Details: ' + JSON.stringify(response));
            } catch (error) {
                console.error(error);
            }
            setIsLoading(false);
        };

        fetchDetails();
    }, [id, type]);
    const fetchAlbumDetails = async (artistName, trackName) => {
        // Ensure lidarrUrl and lidarrApiKey are defined
        const response = await fetch(`${lidarrUrl}/api/v1/album/lookup?term=${encodeURIComponent(artistName + ' ' + trackName)}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': lidarrApiKey,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const albumDetails = await response.json();
        return albumDetails;
    };

    const downloadAlbum = async (musicBrainzId) => {
        try {
            console.log('Opening bottom sheet...');
            // Ensure downloadAlbumModalRef is defined and has a current property with a present method
            downloadAlbumModalRef.current.present();
            const releases = await fetchAlbumDetails(artistName, trackName);
            // Ensure releases is an array and has at least one element
            if (Array.isArray(releases) && releases.length > 0) {
                setReleases(releases);      if (Array.isArray(releases) && releases.length > 0) {
                    setReleases(releases);
                    return releases[0]; // return the first release
                } else {
                    throw new Error('No releases found');
                }
                return releases[0]; // return the first release
            } else {
                throw new Error('No releases found');
            }
        } catch (error) {
            console.error('Failed to fetch album releases:', error);
        }
    };

    useEffect(() => {
        // Ensure artistName and trackName are defined
        fetchAlbumDetails(artistName, trackName).then(albumDetails => {
            setReleases(albumDetails); // Assuming you have a state variable called 'releases'
        });
    }, [artistName, trackName]); // Include artistName and trackName in the dependency array
    const addToLidarr = async (release) => {
        const albumData = {
            "title": release.title,
            "disambiguation": release.disambiguation,
            "artistId": release.artist.id,
            "foreignAlbumId": release.foreignAlbumId,
            "monitored": true,
            "anyReleaseOk": true,
            "releaseDate": release.releaseDate,
            "addOptions": {
                "searchForNewAlbum": true
            }
        };

        console.log('Album data:', albumData);

        const response = await fetch(`${lidarrUrl}/api/v1/album`, {
            method: 'POST',
            headers: {
                'X-Api-Key': lidarrApiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(albumData)
        });

        console.log('Response:', response);

        if (!response.ok) {
            const responseBody = await response.text();
            console.error('Error response body:', responseBody);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Album added to Lidarr');
    };

    const TrackItem = ({ track, index }) => (
        <View style={styles.trackItem}>
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        right: 10,
                        top: 10,
                    }}
                    onPress={() => {
                        if (sound && playingTrack === track.id) {
                            stopSound();
                        } else if (track.preview_url) {
                            playPreview(track.preview_url, track.id);
                        } else {
                            Linking.openURL(track.external_urls.spotify);
                        }
                    }}
                >
                    <FontAwesome name={(sound && playingTrack === track.id) ? "pause-circle-o" : "play-circle-o"} size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.trackText}>{track.name}</Text>
        </View>
    );
    if (isLoading) {
        return (
            <View style={{
                backgroundColor: '#111827',
                flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }
    return (
        <BottomSheetModalProvider>
            <ScrollView style={styles.container}>
            {details && (
                <View
                    style={{
                        marginBottom: 20,
                    }}
                >
                    <View
                        style={{
                            alignItems: 'center',
                            marginBottom: 20,
                        }}
                    >
                    <ImageBackground
                        source={{uri: details?.images?.[0]?.url}}
                        style={styles.artistCard}
                        contentFit={'cover'}
                    >
                    </ImageBackground>
                    </View>
                    <Text style={styles.artist}>{artistName}</Text>
                    <Text style={styles.trackName}>{trackName}</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.buttonDownload}
                            onPress={() => {
                                downloadAlbum();
                            }}
                        >
                            <MaterialCommunityIcons name="download-circle-outline" size={24} color="white" />
                            <Text style={{ color: 'white', paddingLeft: 10 }}>Download</Text>
                        </TouchableOpacity>


                    </View>
                </View>
            )}
            {tracksData && (
                <View style={styles.tracksContainer}>
                    {tracksData.map((track, index) => (
                        <TrackItem key={index} track={track} index={index} />
                    ))}
                </View>
            )}

            {singleTrack && (
                <View style={[styles.tracksContainer,{
                    backgroundColor: 'rgba(100,114,201,0.56)',
                }]}>
                    <TrackItem key={singleTrack.id} track={singleTrack} index={0} />
                </View>
            )}

            <Text style={styles.mainTitle}>More by {artistName}</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                    marginTop: 20,
                }}
            >
                {relatedAlbums?.map((album, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => {
                            // Navigate to the album details screen
                            navigation.navigate('MusicDetails', {
                                id: album.id,
                                type: 'album',
                            });
                        }}
                    >
                    <ImageBackground
                        key={index}
                        source={{uri: album.images[0].url}}
                        style={{
                            width: 180,
                            height: 180,
                            marginRight: 10,
                            borderRadius: 10,
                            overflow: 'hidden',
                        }}
                    />

                    </TouchableOpacity>
                ))}
            </ScrollView>

        </ScrollView>
            <BottomSheetModal
                ref={downloadAlbumModalRef}
                index={0}
                snapPoints={['40%', 300, 600, 900]}
                handleComponent={null}
                backgroundComponent={({ style }) => (
                    <View style={[style, {
                        backgroundColor: '#273450',
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        borderWidth: 1,
                        borderColor: '#727070',
                    }]} />
                )}
            >
                {releases && releases.map((release, index) => (
                    //console.log(release) ||
                    <View key={index}
                          style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginBottom: 10,
                              borderBottomWidth: 0.6,
                              borderBottomColor: '#727070',
                              padding: 5,
                          }}>
                        <Image
                            source={{uri: release.remoteCover}}
                            style={{ width: 50, height: 50, borderWidth: 1, borderColor: '#727070', borderRadius:10 }}
                        />
                        <View style={{ flexDirection: 'column', marginLeft: 10, width:'60%' }}>
                            <Text style={styles.albumName}>{release.title}</Text>
                            {release.artist && <Text style={styles.albumArtist}>{release.artist.artistName}</Text>}
                            <Text style={styles.albumId} numberOfLines={1}>{release.releaseDate}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                addToLidarr(release);
                            }}
                            style={{
                                backgroundColor: '#111827',
                                padding: 5,
                                marginLeft: 'auto',
                                borderRadius: 50,
                                paddingHorizontal: 10,
                                borderWidth: 0.6,
                                borderColor: '#727070',
                            }}
                        >
                            <Text style={{ color: '#ffffff' }}>Add to Lidarr</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </BottomSheetModal>


        </BottomSheetModalProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#111827',
        padding: 16,
        paddingTop: '25%',
    },

    artistCard: {
        width: 290,
        height: 290,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        elevation: 3,
        overflow: 'hidden',
    },
    artistImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    artistName: {
        fontSize: 46,
        fontWeight: 'bold',
        color: '#d2cece',
        position: 'absolute',
    },
    artistBio: {
        fontSize: 18,
        color: '#d2cece',
        marginTop: 10,
    },
    downloadButton: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'rgba(38,38,38,0.68)',
        padding: 10,
        width: '100%',
        alignItems: 'center',
        borderRadius: 10,
    },
    artist: {
        bottom: 0,
        fontSize: 22,
        color: '#d2cece',
        paddingVertical: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    trackName: {
        bottom: 0,
        fontSize: 17,
        color: '#ff0000',
        paddingVertical: 2,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonContainer: {
        bottom: 0,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    trackText: {
        color: '#d2cece',
        fontSize: 18,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ff0000',

    },
    trackItem: {
        borderBottomWidth: 0.4,
        borderBottomColor: 'rgba(136,112,58,0.37)',
        flexDirection: 'row',
    },
    tracksContainer: {
        marginTop: 20,
        width: '100%',
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 20,
        paddingVertical: 10,
        alignSelf: 'flex-start',
    },
    buttonDownload: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16213b',
        padding: 2,
        borderRadius: 50,
        marginTop: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'rgba(253,252,252,0.27)',
    },
    albumName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    albumArtist: {
        color: 'white',
        fontSize: 16,
    },
    albumId: {
        color: 'white',
        fontSize: 12,
    },



});

export default MusicDetails;
