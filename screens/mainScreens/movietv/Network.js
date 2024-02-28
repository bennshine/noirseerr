import {View, Text, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, Platform} from "react-native";
import {useEffect, useState} from "react";
import {Image, ImageBackground} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import {Entypo, Ionicons, Octicons} from "@expo/vector-icons";
import config from "../../../config";


let overserrUrl,
    overseerrApi,
    tmdbApiKey

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey



const Network = ({route, navigation}) => {
    let { id } = route.params;
    const [tvData, setTVData] = useState({ results: [] });
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                const response = await fetch(`${overserrUrl}/api/v1/discover/tv/network/${id}?page=${page}`, { // Include the page number in the API request
                    headers: {
                        'X-Api-Key': `${overseerrApi}`,
                    },
                });
                const data = await response.json();
                setTVData(oldData => ({
                    ...data,
                    results: oldData ? [...oldData.results, ...data.results] : [...data.results],
                }));
            } catch (error) {
                console.error(error);
            }
        }
        fetchNetwork();
    }, [page]);

    console.log(page);

    const onRefresh = () => {
        setRefreshing(true);
        setTVData({ results: [] });
        setPage(1);
        setRefreshing(false);
    }
    const renderTV = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => navigation.navigate('MediaDetails', { id: item.id, mediaType: item.mediaType })}>
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
                        imageStyle={{ borderRadius: 10}}  // Apply the border radius to the image
                    >
                        <LinearGradient
                            colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                            style={styles.linearPoster}
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
        );
    };
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{
                        uri: tvData && tvData.network && tvData.network.logoPath
                            ? `${overserrUrl}/imageproxy/t/p/w780_filter(duotone,ffffff,bababa)${tvData.network.logoPath}`
                            : 'placeholder_image_url',
                    }}
                    style={styles.networkLogo}
                    contentFit={'contain'}
                    transitionDuration={1000}
                />
            </View>
            <FlatList
                data={tvData && tvData.results ? tvData.results : []} // Add a check for tvData before accessing tvData.results
                keyExtractor={(tvData, index) => tvData.id.toString() + tvData.name + index}
                numColumns={3}
                renderItem={renderTV}
                onEndReached={() => setPage(oldPage => oldPage + 1)}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#111827',
        opacity: 1,
    },
    itemContainer: {
        width: '30%',
        marginHorizontal: '1%',
        marginVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    poster: {
        height: 190,
        borderRadius: 5,
        width: '100%',
    },
    title: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        maxWidth: '80%',
    },
    header: {
        marginTop: '13%',
        marginBottom: '5%',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
        marginLeft: 5,
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
    noPoster: {
        height: 190,
        borderRadius: 5,
        width: '100%',
        position: 'absolute',
        alignSelf: 'center',
    },
    mediaStatusContainer : {
        width: 22,
        height: 22,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    networkLogo: {
        width: '50%',
        height: 30,
        alignSelf: 'center',
    },
    linearPoster: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 190,
        borderRadius: 10,
        width: '100%',
        aspectRatio: 2/3,
    }
};

export default Network;
