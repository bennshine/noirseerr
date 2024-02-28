import {useContext, useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import {ImageBackground} from "expo-image";
import base64 from 'react-native-base64';
import TokenContext from '../../../context/TokenContext';
import config from "../../../config";


const Music = ({ navigation }) => {
    const [trendingData, setTrendingData] = useState(null);
    const [newSinglesData, setNewSinglesData] = useState(null);
    const [newAlbumsData, setNewAlbumsData] = useState(null);
    const [genresData, setGenresData] = useState(null);
    const [featuredPlaylistsData, setFeaturedPlaylistsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserPlaylistData, setCurrentUserPlaylistData] = useState(null);
    let { token, setToken } = useContext(TokenContext);


    let  spotifyClientId,spotifyClientSecret

    spotifyClientId = config.spotifyClientId
    spotifyClientSecret = config.spotifyClientSecret


    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Usage
    const randomColor = getRandomColor();




    async function getSpotifyAccessToken() {
        const clientId = spotifyClientId;
        const clientSecret = spotifyClientSecret;


        if (token && token.accessToken && new Date().getTime() <= token.expirationTime) {
            console.log('Token found and is valid, returning the existing token...');
            return token;
        } else {
            console.log('Token not found or expired, fetching a new one...');
        }
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + base64.encode(clientId + ':' + clientSecret),
                },
                body: 'grant_type=client_credentials'
            });

            const data = await response.json();
            const expirationTime = new Date().getTime() + data.expires_in * 1000;
            const newToken = { accessToken: data.access_token, expirationTime };
            await setToken(newToken);  // Store the token and expiration time in the context
            return newToken;
        } catch (error) {
            console.error('Error getting Spotify access token:', error);
        }
    }

    async function fetchWebApi(endpoint, method, body) {
        try {
            const token = await getSpotifyAccessToken();
            if (!token || !token.accessToken) {
                console.error('No access token found');
                return;
            }
            console.log('Token found, proceeding with the API call...');

            console.log(`Making a request to ${endpoint}...`);
            const res = await fetch(`https://api.spotify.com/${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                },
                method,
                body: JSON.stringify(body)
               });
            if (res.status === 401) { // Token expired
                console.log('Token expired, fetching a new one...');
                await getSpotifyAccessToken(); // Refresh the token

                // Retry the request with the new token
                console.log('Retrying the request with the new token...');
                return fetchWebApi(endpoint, method, body);
            }

            console.log('Response received, parsing the data...');
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching data from Spotify Web API:', error);
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                const token = await getSpotifyAccessToken();
                if (!token || !token.accessToken) {
                    console.error('No access token found');
                    return;
                }
                console.log('Token found, proceeding with the API calls...');

                const [trendingResponse, newReleasesResponse, genresResponse, featuredPlaylistsResponse, currentUserPlaylistResponse ] = await Promise.all([
                    fetchWebApi('v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks', 'GET'),
                    fetchWebApi('v1/browse/new-releases?limit=50', 'GET'),
                    fetchWebApi('v1/recommendations/available-genre-seeds', 'GET'),
                    fetchWebApi('v1/browse/featured-playlists', 'GET'),
                    fetchWebApi('v1/users/gbfcb65iif3j7qqktu83bq29o/playlists', 'GET')
                    //fetchWebApi('v1/me/playlists', 'GET')

                ]);

                setTrendingData(trendingResponse.items);
                console.log('trendingData', trendingData);
                const newSinglesSet = new Set(newReleasesResponse.albums.items.filter(item => item.album_type === 'single').map(item => item.id));
                const newAlbumsSet = new Set(newReleasesResponse.albums.items.filter(item => item.album_type === 'album').map(item => item.id));

                const newSingles = Array.from(newSinglesSet).map(id => newReleasesResponse.albums.items.find(item => item.id === id));
                const newAlbums = Array.from(newAlbumsSet).map(id => newReleasesResponse.albums.items.find(item => item.id === id));

                setNewSinglesData(newSingles);
                setNewAlbumsData(newAlbums);

                setGenresData(genresResponse ? genresResponse.genres : []);

                //console.log(genresResponse);
                setFeaturedPlaylistsData(featuredPlaylistsResponse ? featuredPlaylistsResponse.playlists.items : []);

                setCurrentUserPlaylistData(currentUserPlaylistResponse ? currentUserPlaylistResponse.items : []);




            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    //fetch genres just for testing
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const genresResponse = await fetchWebApi('v1/recommendations/available-genre-seeds', 'GET');
                setGenresData(genresResponse ? genresResponse.genres : []);
            } catch (error) {
                console.error('Error fetching genres:', error);
            }
        };
        fetchGenres();
    }, []);

    //console.log('genresData', genresData);
    const handlePress = (item) => {
        const album = item.album || item; // Handle both album and track objects
        if (album && album.images) {
            let type = item.album ? 'track' : item.type; // Determine the type based on the structure of the item object

            // If the item is a track, extract the track ID from the URI
            let id = type === 'track' ? item.uri.split(':').pop() : album.id;

            if (type === 'album' || type === 'track') {
                navigation.navigate('MusicDetails', {
                    id: id,
                    type: type,
                });
            } else if (type === 'playlist') {
                navigation.navigate('MusicPlaylist', {
                    id: id,
                });
            }
        }
    };

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
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Trending Tracks</Text>
            {renderData(trendingData, 'track')}
            <Text style={styles.title}>New Singles</Text>
            {renderData(newSinglesData, 'album')}
            <Text style={styles.title}>New Albums</Text>
            {renderData(newAlbumsData, 'album')}
            {genresData.length > 0 && (
                <>
            <Text style={styles.title}>Discover New Genres</Text>
            <View style={styles.mainGenreContainer}>
                <ScrollView horizontal={true}>
                        {genresData ? (
                            genresData.map(genre => (
                                <TouchableOpacity
                                    key={genre}
                                    style={styles.genreContainer}>
                                    <Text style={styles.genreText}>
                                        {genre}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text>Loading...</Text>
                        )}
                </ScrollView>
            </View>
                </>
            )}
            <Text style={styles.title}>Featured Playlists</Text>
            <View>
                <ScrollView horizontal={true}>
                    {featuredPlaylistsData ? (
                        featuredPlaylistsData.map(playlist => (
                            <TouchableOpacity
                                key={playlist.id}
                                onPress={() => {
                                    console.log('playlist', playlist);
                                    handlePress(playlist); // Pass the playlist as an argument
                                }}
                            >
                                <ImageBackground
                                    style={[styles.playlistContainer, {
                                        backgroundColor: getRandomColor(),
                                    }]}
                                    source={{ uri: playlist.images[0].url }}
                                    contentFit={'contain'}
                                >
                                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                        <Text style={styles.genreText}>
                                            {playlist.name}
                                        </Text>
                                        <Text
                                            style={{
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                paddingBottom: 0,
                                            }}
                                        >
                                            {playlist.tracks.total} Total Tracks
                                        </Text>
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text>Loading...</Text>
                    )}
                </ScrollView>
            </View>
            <Text style={styles.title}>Your Playlists</Text>
            <View>
                <ScrollView horizontal={true}>
                    {currentUserPlaylistData ? (
                        currentUserPlaylistData.map(playlist => (
                            <TouchableOpacity
                                key={playlist.id}
                                onPress={() => {
                                    handlePress(playlist); // Pass the playlist as an argument
                                }}
                            >
                                <ImageBackground
                                    style={[styles.playlistContainer, {
                                        backgroundColor: getRandomColor(),
                                    }]}
                                    contentFit={'contain'}
                                >
                                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                        <Text style={styles.genreText}>
                                            {playlist.name}
                                        </Text>
                                        <Text
                                            style={{
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                paddingBottom: 0,
                                            }}
                                        >
                                            {playlist.tracks.total} Total Tracks
                                        </Text>
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text>Loading...</Text>
                    )}
                </ScrollView>
            </View>
            <View style={{ height: 200 }} />
        </ScrollView>

    );

    function renderData(data) {
        return data ? (
            <FlatList
                data={data}
                horizontal={true}
                renderItem={({ item }) => {
                    const track = item.track || item;
                    const album = track.album || track;
                    const name = track.name ? track.name : album.name;
                    return (
                        album && album.images ? (
                            <TouchableOpacity onPress={() => handlePress(track)}>
                                <View style={{ margin: 5 }}>
                                    {album.images[0] ? (
                                        <View>
                                            <ImageBackground
                                                source={{ uri: album.images[0].url }}
                                                style={styles.poster}
                                                contentFit={'cover'}
                                            />
                                            <Text numberOfLines={1} style={styles.albumText}>{name}</Text>
                                            <Text style={styles.artistName}>{album.artists[0].name}</Text>
                                        </View>
                                    ) : (
                                        <Text>No image available</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ) : null
                    );
                }}
                keyExtractor={item => item.id}
            />
        ) : (
            <Text>Loading...</Text>
        );
    }
}
    const styles = {
        container: {
            flex: 1,
            padding: 16,
            paddingTop: 86,
            paddingBottom: 300,
            backgroundColor: '#111827',
        },
        poster: {
            width: 190,
            height: 190,
            borderRadius: 10,
            overflow: 'hidden',
        },
        title: {
            color: '#d2cece',
            fontSize: 20,
            fontWeight: 'bold',
            marginVertical: 10,
            alignItems: 'flex-start',
            textAlign: 'left',
            justifyContent: 'flex-start',
        },
        genreContainer: {
            backgroundColor: '#f38989',
            padding: 10,
            margin: 5,
            borderRadius: 10,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
            width: 170,
        },
        playlistContainer: {
            padding: 10,
            margin: 5,
            borderRadius: 10,
            height: 350,
            width: 280,
            borderWidth: 0.4,
            borderColor: '#5d5a5a',
        },

        genreText: {
            color: '#fff',
            fontWeight: 'bold',
            textTransform: 'capitalize',
            fontSize: 21,
            shadowColor: '#f1ecec',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,

        },
        albumText: {
            color: '#d2cece',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'left',
            paddingVertical: 5,
        },
        artistName: {
            color: '#939191',
            fontSize: 12,
            fontWeight: 400,
            textAlign: 'left',
        },
        mainGenreContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
        },



};

export default Music;
