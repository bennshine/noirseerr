import React, {useState, useEffect, useContext} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Platform} from 'react-native';
import {Image, ImageBackground} from 'expo-image';
import axios from "axios";
import {UserContext} from "../../../context/UserContext";
import {LinearGradient} from "expo-linear-gradient";
import config from "../../../config";

let overserrUrl,
    overseerrApi,
    tmdbApiKey

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey


const STATUS_CODES = {
    3: 'Requested',
    1: 'Rejected',
    2: 'Pending',
    4: 'Partially Available',
    5: 'Available',
};

function getBackgroundColor(status) {
    switch (status) {
        case 1: // Pending
            return '#FFA500'; // Orange
        case 2: // Rejected
            return '#FF0000'; // Red
        case 3: // Requested
            return 'rgb(99 102 241)'; // Blue
        case 4: // Partially Available
            return '#FFA500'; // Yellow
        case 5: // Available
            return '#008000'; // Green
        default:
            return '#FFFFFF'; // White
    }
}
const fetchMediaDetails = async (request, tmdbAPIKey) => {
    const mediaType = request.type;

    if (!mediaType) return request;

    const url = `https://api.themoviedb.org/3/${mediaType}/${request.media.tmdbId}?api_key=${tmdbAPIKey}`;
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

const Requests = ({navigation}) => {
    const [requests, setRequests] = useState([]);
    const { userDetails } = useContext(UserContext);
    const [refreshing, setRefreshing] = useState(false);
        const fetchData = async () => {
            setRefreshing(true);
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
            setRefreshing(false);
        };
    useEffect(() => {
        fetchData();
    }, []);

    const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return (
        <View style={styles.container}>
            <FlatList
                data={sortedRequests}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <ImageBackground
                        source={{ uri: item.backdropPath }}
                        style={styles.row}
                        imageStyle={styles.requestContainer}
                    >
                        <LinearGradient
                            colors={['rgba(22,31,46,0.81)', 'rgb(29,30,33)']}
                            style={styles.linearGradient}
                        />
                        <TouchableOpacity
                            style={styles.buttonRow}
                            onPress={() => navigation.navigate('MediaDetails', { id: item.media.tmdbId, mediaType: item.media.mediaType })}
                        >
                            <Image
                                style={styles.poster}
                                source={{
                                    uri: item.posterPath,
                                    priority: 'high',
                                }}
                                contentFit={'cover'}
                                transition={1500}
                                placeholder={{
                                    uri: 'https://via.placeholder.com/100x150',
                                    priority: 'low',
                                }}
                            />
                            <View style={styles.infoContainer}>
                                <Text numberOfLines={1} style={styles.year}>{`${item.year}`}</Text>
                                <Text numberOfLines={1} style={styles.title}>{`${item.name}`}</Text>
                                <Text numberOfLines={1} style={styles.requestedBy}>Requested By  { `${item.requestedBy.displayName}`}</Text>
                                <Text numberOfLines={1} style={styles.createdAt}>{`When: ${item.createdAt}`}</Text>
                                <View style={styles.requestView}>
                                <View style={[styles.requestButtonView,{
                                        backgroundColor: getBackgroundColor(item.media.status),
                                    }]}
                                >
                                    <Text style={styles.requestText}>
                                        {STATUS_CODES[item.media.status]}
                                    </Text>
                                </View>
                                    {userDetails.permissions === 16777506 && (
                                        <TouchableOpacity style={styles.deleteButton}>
                                            <Text style={styles.deleteButtonText}>
                                                Delete Request
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    </ImageBackground>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchData}
                        tintColor={'#fff'}
                        title={'Refreshing...'}
                        titleColor={'#fff'}
                    />
                }
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        opacity: 1,
        paddingTop: '23%',
        paddingBottom: '23%',

    },
    linearGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 150,
        borderRadius: 10,
    },
    row: {
        paddingTop: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(7,7,7,0.62)',
        padding: 10,
        marginHorizontal: 7,
        marginBottom: 10,
    },
    poster: {
        width: 90,
        height: 120,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(115,115,115,0.38)',

    },
    infoContainer: {
        marginLeft: 10,
        marginTop: 10,
    },
    year: {
        fontSize: 14,
        color: '#b2b0b0',
    },
    title: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    status: {
        fontSize: 15,
        color: '#ffffff',
    },
    genres: {
        fontSize: 13,
        color: '#888',
    },
    requestedBy: {
        fontSize: 15,
        color: '#d9d7d7',
        fontWeight: 'bold',

    },
    createdAt: {
        fontSize: 15,
        color: '#d9d7d7',
    },
    buttonRow :{
        flexDirection: 'row',
        justifyContent: 'right',
        flex: 1,
    },
    requestContainer: {
        borderRadius: 10,
        opacity: 0.9,
        borderWidth: 1,
        borderColor: 'rgba(115,115,115,0.38)',
    },
    requestView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    requestButtonView: {
        height: 20,
        paddingHorizontal:9,
        borderWidth:1,
        borderRadius: 50,
        marginRight: 50,
        borderColor:'rgba(255,255,255,0.43)',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    requestText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: 'rgba(255,0,0,0.73)',
        height: 24,
        paddingHorizontal:9,
        borderWidth:1,
        borderRadius: 50,
        marginRight: 50,
        borderColor:'rgba(255,255,255,0.43)',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
    },

});
export default Requests;
