
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking} from 'react-native';
import {Image, ImageBackground} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import {FontAwesome, Ionicons, MaterialIcons} from "@expo/vector-icons";
import {BottomSheetModal, BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import axios from "axios";
import TokenContext from '../../../context/TokenContext';
import { Audio } from 'expo-av';

const MusicPlaylist = ({ route,navigation }) => {
    const { id } = route.params; // Get the ID from the route params
    const [playlist, setPlaylist] = useState(null);
    const bottomSheetModalRef = useRef(null);
    const snapPoints = useMemo(() => [400,'25%', '50%'], []);
    const [selectedSong, setSelectedSong] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sound, setSound] = useState();
    const [playingTrack, setPlayingTrack] = useState(null); // Add this line
    const [artists, setArtists] = useState([]);
    const { token, setToken } = useContext(TokenContext);
    const handlePresentModalPress = useCallback(async (item) => {
        const song = await fetchSongFromMusicBrainz(item);
        setSelectedSong(song);
        bottomSheetModalRef.current.present();
    }, []);

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

    const CustomBackground = ({ style }) => {
        return (
            <View
                style={[
                    style,
                    {
                        borderWidth: 1.3,
                        borderColor: 'rgba(143,143,143,0.11)',


                    },
                ]}

            />
        );
    }

    // Function to fetch song from MusicBrainz
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
        console.log(data); // Log the response data
        return data;
    }
    useEffect(() => {
        const fetchPlaylist = async () => {
            setIsLoading(true);
            const response = await fetchWebApi(`v1/playlists/${id}`, 'GET');
            setPlaylist(response);

            // Fetch and log all artists in the playlist
            const artistPromises = response.tracks.items.map(async item => {
                return Promise.all(item.track.artists.map(async artist => {
                    const artistResponse = await fetchWebApi(`v1/artists/${artist.id}`, 'GET');
                    console.log(artistResponse);
                    return artistResponse;
                }));
            });

            const artists = await Promise.all(artistPromises);
            setArtists(artists.flat());

            setIsLoading(false);
        };

        fetchPlaylist();
    }, [id]);


    //console.log('xxXxx' + JSON.stringify(playlist));
    // Function to fetch song from MusicBrainz
    const fetchSongFromMusicBrainz = async (item) => {
        // Check that item, item.track, and item.track.album are all defined
        if (!item || !item.track || !item.track.album) {
            console.error('Error: item, item.track, or item.track.album is undefined');
            return null;
        }

        // Extract the details from the Spotify API data
        const artist = item.track.artists[0].name.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^`{|}~]/g, '\\$&');
        const track = item.track.name.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^`{|}~]/g, '\\$&');

        // Construct the MusicBrainz API URL
        const url = `https://musicbrainz.org/ws/2/recording/?query=artist:${artist} AND recording:${track}&fmt=json`;

        // Log the URL
        console.log('MusicBrainz API URL:', url);

        try {
            // Make a GET request to the MusicBrainz API
            const response = await axios.get(url);

            // If the response contains recordings, return the URL of the first one
            if (response.data.recordings && response.data.recordings.length > 0) {
                const recordingId = response.data.recordings[0].id;
                const recordingUrl = `https://musicbrainz.org/recording/${recordingId}`;
                console.log('Matching recording found on MusicBrainz:', recordingUrl);
                return recordingUrl;
            } else {
                console.log('No matching recordings found on MusicBrainz.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching song from MusicBrainz:', error);
            return null;
        }
    };
    //console.log('xxXxx' + JSON.stringify(playlist.tracks.items));

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
            {playlist && (
                <ImageBackground
                    source={{uri: playlist.images[0].url}}
                    style={styles.header}
                >
                    <LinearGradient
                        colors={['rgba(17,24,39,0.35)', '#111827']}
                        locations={[0.3, 1]}
                        style={StyleSheet.absoluteFill}
                    >

                    </LinearGradient>
                    <Text style={styles.title}>{playlist.name}</Text>
                    <Text style={styles.description}>{playlist.description}</Text>
                    <View style={{flexDirection: 'row',}}>
                        <Image
                            source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg'}}
                            style={{width: 20, height: 20, marginRight: 8}} // Adjust width and height as needed
                        />
                        <Text style={styles.owner}>{playlist.owner.display_name}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => Linking.openURL(playlist.external_urls.spotify)}
                    >
                        <Text style={styles.buttonText}>Play On Spotify</Text>
                    </TouchableOpacity>
                </ImageBackground>
            )}

            {playlist && playlist.tracks && (
                <>
                <FlatList
                    data={playlist.tracks.items}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.trackContainer}>
                            <ImageBackground
                                source={{uri: item.track.album.images[0].url}}
                                style={styles.trackAlbumPoster}
                                imageStyle={{resizeMode: 'cover'}} // Optional depending on your needs
                            >
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        if (sound && playingTrack === item.track.id) {
                                            stopSound();
                                        } else if (item.track.preview_url) {
                                            playPreview(item.track.preview_url, item.track.id);
                                        } else {
                                            Linking.openURL(item.track.external_urls.spotify);
                                        }
                                    }}
                                >
                                    <FontAwesome name={(sound && playingTrack === item.track.id) ? "pause-circle-o" : "play-circle-o"} size={24} color="white" />
                                </TouchableOpacity>
                            </ImageBackground>

                            <View style={{flex: 1, paddingHorizontal: 10}}>
                                <Text numberOfLines={1} style={styles.track}>{item.track.name}</Text>
                                <TouchableOpacity onPress={() => {
                                    console.log('Artist:', artists[0]);
                                    navigation.navigate('ArtistDetails', { artist: artists[0] });
                                }}>
                                    <Text style={styles.tractArtist}>{item.track.artists[0].name}</Text>
                                </TouchableOpacity>


                            </View>
                            <TouchableOpacity onPress={() => {
                                handlePresentModalPress(item);
                                setSelectedItem(item);
                            }}>
                                <MaterialIcons name="download-for-offline" size={34} color="white" />
                            </TouchableOpacity>

                        </View>
                    )}
                />

                    <BottomSheetModal
                        ref={bottomSheetModalRef}
                        snapPoints={snapPoints}
                        style={{
                            backgroundColor: '#0d2146',
                            shadowColor: '#436eda',
                            shadowOffset: {
                                width: 0,
                                height: 12,
                            },
                            shadowOpacity: 0.58,
                            shadowRadius: 16.00,
                            elevation: 24,
                            borderRadius: 10,
                    }}
                        backgroundComponent={CustomBackground}

                    >
                        <View style={styles.trackContainer}>
                            {selectedSong && selectedItem ? (
                                <>
                                    <Image source={{uri: selectedItem.track.album.images[0].url}} style={styles.trackAlbumPoster} />
                                    <View style={{flex: 1, paddingHorizontal: 10}}>
                                        <Text numberOfLines={1} style={styles.track}>{`${selectedItem.track.name}`}</Text>
                                        <Text numberOfLines={1} style={styles.tractArtist}>{`${selectedItem.track.artists[0].name}`}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => downloadToLidarr(selectedSong.id)}>
                                        <Text>Confirm Download</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Text>No matching song found on MusicBrainz.</Text>
                            )}
                        </View>




                    </BottomSheetModal>
                </>
            )}
            <Text style={styles.textTitle}>Featured Artists</Text>

            <ScrollView
                contentContainerStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
                horizontal={true}>

                {artists.map(artist => {
                    //console.log('Artist:', artist); // Log each artist
                    return (
                        <>
                            <TouchableOpacity
                                onPress={() => {
                                    console.log('Artist: ' + artist.name);
                                    navigation.navigate('ArtistDetails', { artist });
                                }}

                                key={artist.id} style={{alignItems: 'center', margin: 10}}>
                                {artist.images && artist.images[0] && (
                                    <Image
                                        source={{uri: artist.images[0].url}}
                                        style={styles.featuredArtistsImage}
                                    />
                                )}
                                <Text style={styles.artistName}>{artist.name}</Text>
                            </TouchableOpacity>
                        </>
                    );
                })}
            </ScrollView>
        </ScrollView>
        </BottomSheetModalProvider>
    );

}

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#111827',
        },
        header: {
            height: 600,
            justifyContent: 'flex-end', // Align items to the bottom
            alignItems: 'center',
            paddingBottom: 20, // Add some padding at the bottom
        },
        trackAlbumPoster :{
            width: 50,
            height: 50,
            marginRight: 10,
            borderRadius: 10,
        },
        title: {
            fontSize: 28,
            color: '#ffffff',
            marginBottom: 10,
            fontWeight: 'bold',
        },
        description: {
            fontSize: 16,
            color: '#ffffff',
            marginBottom: 10,
        },
        owner :{
            fontSize: 16,
            color: '#ffffff',
            marginBottom: 16,
        },
        button: {
            backgroundColor: '#1DB954',
            padding: 10,
            borderRadius: 25,
        },
        buttonText: {
            color: '#ffffff',
            fontSize: 16,
        },
        trackContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#333333',
        },
        track: {
            fontSize: 16,
            color: '#ffffff',
            marginBottom: 8,
        },
        tractArtist: {
            fontSize: 14,
            color: '#b3b3b3',
        },
        featuredArtistsImage: {
            width: 150,
            height: 150,
            borderRadius: 100,
            marginRight: 5,
        },
        textTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#d2cece',
            padding: 10,
        },
        artistName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#d2cece',
            paddingVertical: 5,
        }
    });


    export default MusicPlaylist;
