import {View, Text, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, Platform} from "react-native";
import {useEffect, useState} from "react";
import {Image, ImageBackground} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import {Entypo, Ionicons, Octicons} from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
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



const Languages = ({route, navigation}) => {
    let { id,mediaType} = route.params;
    const [mediaData, setMediaData] = useState({ results: [] });
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    let adjustedMediaType = mediaType;
    if (mediaType === 'movie') {
        adjustedMediaType = 'movies';
    }
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
        'af': 'Af',
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
        'hu': 'Hungarian',
    };
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch(`${overserrUrl}/api/v1/discover/${adjustedMediaType}?page=${page}&language=${id}&sortBy=popularity.desc`,  {
                    headers: {
                        'X-Api-Key': `${overseerrApi}`,
                    },
                });
                const data = await response.json();
                setMediaData(oldData => ({
                    ...data,
                    results: oldData && oldData.results ? [...oldData.results, ...data.results] : [...data.results],
                }));
            }
            catch (error) {
                console.error(error);
            }
        }
        fetchLanguages();
    }, [page]);


    const onRefresh = () => {
        setRefreshing(true);
        setMediaData({ results: [] });
        setPage(1);
        setRefreshing(false);
    }


    const renderMovies = ({ item }) => {
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
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, justifyContent:'space-between' }}>
                <MaskedView
                    style={{ height: 64, flex: 1, marginTop: 40, justifyContent: 'center'}}
                    maskElement={<Text style={styles.pageTitle}>
                        {mediaType === 'tv' ? 'Series' : 'Movies'} in {languageMap[id]}
                    </Text>}
                >
                    <LinearGradient
                        colors={['#818cf8', '#c084fc']}
                        start={{ x: 1, y: 1 }}
                        end={{ x: 0, y: 0.33 }}
                        style={{ flex: 1 }}
                    />
                </MaskedView>
            </View>
            <FlatList
                data={mediaData && mediaData.results ? mediaData.results : []} // Add a check for tvData before accessing tvData.results
                keyExtractor={(tvData, index) => tvData.id.toString() + tvData.name + index}
                numColumns={3}
                renderItem={renderMovies}
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
        width: '100%',
        alignItems: 'center',
        marginTop: '13%',
        marginBottom: '5%',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'left',
        alignItems: 'flex-start',
        color: '#fff',
        justifyContent: 'flex-start',
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
    mediaStatusContainer : {
        width: 22,
        height: 22,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    linearGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 190,
        borderRadius: 10,
        width: '100%',
        aspectRatio: 2/3,
    },
    noPoster: {
        height: 190,
        borderRadius: 5,
        width: '100%',
        position: 'absolute',
        alignSelf: 'center',
    },
};

export default Languages;
