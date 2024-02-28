import React, { useContext, useEffect, useState } from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Dimensions, Linking} from 'react-native';
import TokenContext from "../../../context/TokenContext";
import {Image, ImageBackground} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import {FontAwesome, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import {Audio} from "expo-av";

const ArtistDetails = ({ route, navigation }) => {
    const { artist } = route.params;
    const { token, setToken } = useContext(TokenContext);
    const [topTracks, setTopTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [similarArtists, setSimilarArtists] = useState([]);
    const [latestSingle, setLatestSingle] = useState(null);
    const [featuredTracks, setFeaturedTracks] = useState([]);
    const [epsAndSingles, setEpsAndSingles] = useState([]);
    const [sound, setSound] = useState();
    const [playingTrack, setPlayingTrack] = useState(null); // Add this line

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


    const fetchArtistDetails = async () => {
        try {
            // Fetch top tracks
            const topTracksData = await fetchWebApi(`v1/artists/${artist.id}/top-tracks?country=US`, 'GET');
            setTopTracks(topTracksData.tracks);

            //console.log('top tracks' + JSON.stringify(topTracksData.tracks));

            // Fetch all tracks featuring the artist
            const allTracksData = await fetchWebApi(`v1/search?q=${artist.name}&type=track`, 'GET');
            const featuredTracks = allTracksData.tracks.items.filter(track =>
                track.artists.some(a => a.id !== artist.id)
            );
            setFeaturedTracks(featuredTracks);


            // Fetch albums
            const albumsData = await fetchWebApi(`v1/artists/${artist.id}/albums`, 'GET');
            setAlbums(albumsData.items);
            // console.log('xxXxx' + JSON.stringify(albumsData.items));

            // Fetch similar artists
            const similarArtistsData = await fetchWebApi(`v1/artists/${artist.id}/related-artists`, 'GET');
            setSimilarArtists(similarArtistsData.artists);

            // Fetch EPs and singles
            const epsAndSinglesData = await fetchWebApi(`v1/artists/${artist.id}/albums?include_groups=album,single`, 'GET');
            setEpsAndSingles(epsAndSinglesData.items);

            // Fetch latest single
            const singlesData = await fetchWebApi(`v1/artists/${artist.id}/albums?include_groups=single&limit=1`, 'GET');
            setLatestSingle(singlesData.items[0]);


        } catch (error) {
            console.error('Error fetching artist details:', error);
        }
    };
    useEffect(() => {
        fetchArtistDetails();
    }, []);


    return (
        <ScrollView
            contentContainerStyle={styles.container}
        >
            <View style={{ alignItems: 'center' }}>
                {artist.images && artist.images.length > 0 && (
                    <ImageBackground
                        style={{ width:'100%', height: 500 }}
                        source={{ uri: artist.images[0].url }}
                        contentFit={'cover'}

                    >
                        <LinearGradient
                            colors={['rgba(17,24,39,0.35)', '#111827']}
                            locations={[0.3, 1]}
                            style={StyleSheet.absoluteFill}
                        >

                        </LinearGradient>
                        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>{artist.name}</Text>
                        </View>
                    </ImageBackground>
                )}
            </View>
            <View style={{ padding: 20 }}>
                {latestSingle && (
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom:30 }}>
                        <ImageBackground
                            style={styles.singleImage}
                            source={{ uri: latestSingle.images[0].url }}
                        >
                        </ImageBackground>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.dateRelease}>{latestSingle.release_date}</Text>
                            <Text style={styles.singleName}>{latestSingle.name}</Text>
                            <Text style={styles.totalSongs}>{latestSingle.total_tracks} songs</Text>
                            <TouchableOpacity
                                style={styles.buttonDownload}
                                onPress={() => {/* Download function */}} >
                                <MaterialCommunityIcons name="download-circle-outline" size={24} color="white" />
                                <Text style={{ color: 'white',paddingLeft:10 }}>Download</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                )}

                <Text style={styles.mainTitle}>Top Tracks</Text>
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                    <View style={styles.column}>
                        {topTracks.slice(0, 5).map((track, index) => (
                            <View key={track.id} style={styles.item}>
                                <ImageBackground
                                    style={{ width: 50, height: 50,borderRadius: 5}}
                                    source={{ uri: track.album.images[0].url }}
                                >
                                    <TouchableOpacity
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'center',
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
                                </ImageBackground>
                                <View style={styles.firstItemContainer}>
                                    <Text style={{ color: 'white',paddingVertical:3 }}>{track.name}</Text>
                                    <Text style={{ color: '#626060', fontSize: 12 }}>{track.album.name} - {track.album.release_date.split('-')[0]}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                    {topTracks.length > 5 && (
                        <View style={styles.column}>
                            {topTracks.slice(5, 10).map((track, index) => (
                                <View key={track.id} style={styles.firstItem}>
                                    <ImageBackground
                                        style={{ width: 50, height: 50,borderRadius: 5}}
                                        source={{ uri: track.album.images[0].url }}
                                    >
                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
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
                                    </ImageBackground>
                                    <View style={styles.secondItemContainer}>
                                        <Text style={{ color: 'white',paddingVertical:3 }}>{track.name}</Text>
                                        <Text style={{ color: '#626060', fontSize: 12 }}>{track.album.name} - {track.album.release_date.split('-')[0]}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={{

                                            marginLeft: -170,
                                        }}
                                        onPress={() => {/* Download function */}} >

                                        <MaterialIcons name="download-for-offline" size={34} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
                <Text style={styles.mainTitle}>Albums</Text>
                <ScrollView horizontal>
                    {albums.map((album, index) => (
                        <View
                            key={album.id}
                            style={{
                                alignItems: 'center',
                            }}
                        >
                        <ImageBackground
                            key={album.id}
                            style={styles.albumPoster}
                            source={{ uri: album.images[0].url }}
                        >
                            <LinearGradient
                                colors={['rgba(17,24,39,0.35)', '#111827']}
                                locations={[0.3, 1]}
                                style={StyleSheet.absoluteFill}
                            >
                            </LinearGradient>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                            </TouchableOpacity>
                        </ImageBackground>
                            <Text numberOfLines={1} style={{ color: 'white', fontSize: 12 }}>{album.name}</Text>
                            <Text numberOfLines={1} style={{ color: 'white', fontSize: 12 }}>{album.release_date.split('-')[0]}</Text>

                        </View>
                    ))}
                </ScrollView>

                <Text  style={styles.mainTitle}>Similar Artists</Text>
                <ScrollView horizontal>
                    {similarArtists.map((artist, index) => (
                        <TouchableOpacity
                            key={artist.id}
                            style={{
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                navigation.push('ArtistDetails', { artist });
                            }}
                        >
                            <ImageBackground
                                key={artist.id}
                                style={styles.artistImage}
                                source={{ uri: artist.images[0].url }}
                            >
                            </ImageBackground>
                            <Text style={styles.artistName}>{artist.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 20 }}>Featured Tracks</Text>
                {featuredTracks.map((track, index) => (
                    <Text key={track.id} style={{ color: 'white' }}>{index + 1}. {track.name}</Text>
                ))}

                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 20 }}>EPs and Singles</Text>
                {epsAndSingles.map((album, index) => (
                    <View key={album.id}>
                        <Text style={{ color: 'white' }}>{index + 1}. {album.name}</Text>
                        <Text style={{ color: 'white', fontSize: 12 }}>{album.album_type.toUpperCase()}</Text>
                    </View>
                ))}



            </View>
        </ScrollView>
    );
}
const styles = {
    container: {
        backgroundColor: '#111827',
    },
    singleImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    column: {
        flex: 1,
        width: Dimensions.get('window').width,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    firstItem: {
        flexDirection: 'row',
        padding: 5,
        marginLeft: -40,
    },
    dateRelease: {
        color: '#a6a3a3',
        fontSize: 14,
    },
    singleName: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
    },
    totalSongs: {
        color: '#a6a3a3',
        fontSize: 14,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 20,
        paddingVertical: 10,
    },
    firstItemContainer: {
        marginLeft: 10,
        borderBottomWidth: 0.2,
        borderColor: 'rgba(107,106,106,0.57)',
        width: '100%',
        paddingVertical: 7,
    },
    secondItemContainer: {
        marginLeft: 10,
        borderBottomWidth: 0.2,
        borderColor: 'rgba(107,106,106,0.57)',
        width: '100%',
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
    albumPoster: {
        width: 180,
        height: 180,
        borderRadius: 10,
        margin: 5,
        overflow: 'hidden',
        borderWidth: 0.4,
        borderColor: 'rgba(253,252,252,0.27)',
    },
    artistImage: {
        width: 180,
        height: 180,
        borderRadius: 100,
        overflow: 'hidden',
        marginRight: 10,
    },
    artistName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#858484',
        marginTop: 10,
        alignItems: 'center',
        textAlign: 'center',
    },



}
export default ArtistDetails;
