import React, {useCallback, useEffect, useState} from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator, ScrollView
} from 'react-native';
import {Image, ImageBackground} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import {useNavigation} from "@react-navigation/native";
import {Entypo, Ionicons, Octicons} from "@expo/vector-icons";
import config from "../../../config";

let overserrUrl,
    overseerrApi,
    tmdbApiKey

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey

const TV = () => {
    const [tvData, setTvData] = useState({ results: [] });
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [allTVData, setAllTvData] = useState([]);

    const genresTV =  {
        "10759": "Action & Adventure",
        "10762": "Kids",
        "10763": "News",
        "10764": "Reality",
        "10765": "Sci-Fi & Fantasy",
        "10766": "Soap",
        "10767": "Talk",
        "10768": "War & Politics",
        "16": "Animation",
        "35": "Comedy",
        "80": "Crime",
        "99": "Documentary",
        "18": "Drama",
        "10751": "Family",
        "9648": "Mystery",
        "37": "Western"
    }



    const fetchTvData = useCallback(async (category = 'default', genreName, startPage = 1, endPage = 2) => {
        try {
            //setLoading(true);
            if (startPage === 1) {
                setInitialLoading(true);
            } else {
                setLoading(true);
            }
            const genreId = Object.keys(genresTV).find(key => genresTV[key] === genreName);

            // Fetch a range of pages for specific categories and for 'default' category
            const pagesToFetch = Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
            const requests = pagesToFetch.map(pageNum => {
                const urlMap = {
                    'genre': `${overserrUrl}/api/v1/discover/tv/genre/${genreId}?page=${pageNum}&language=en`,
                    'upcoming': `${overserrUrl}/api/v1/discover/tv/upcoming?page=${pageNum}&language=en`,
                    'trending': `${overserrUrl}/api/v1/discover/trending?page=${pageNum}&language=en`,
                    'default': `${overserrUrl}/api/v1/discover/tv?page=${pageNum}&language=en`
                };
                const url = urlMap[category] || urlMap['default'];

                return fetch(url, {
                    headers: {
                        'X-Api-Key': `${overseerrApi}`,
                    },
                }).then(response => response.json());
            });

            const responses = await Promise.all(requests);

            for (const data of responses) {
                let results = data.results;

                // If the category is 'trending', filter the results to include only TVs
                if (category === 'trending') {
                    results = results.filter(item => item.mediaType === 'tv');
                }

                if (category === 'default') {
                    setAllTvData(oldData => [
                        ...(oldData ? oldData : []),
                        ...results
                    ]);
                } else {
                    setTvData(oldData => {
                        const existingCategory = oldData.find(o => o.category === (genreName || category));
                        if (existingCategory) {
                            // If the category already exists, update its results
                            existingCategory.results = [...existingCategory.results, ...results];
                        } else {
                            // If the category does not exist, add it
                            oldData.push({ category: genreName || category, results });
                        }
                        return [...oldData];
                    });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            //setLoading(false);
            if (startPage === 1) {
                setInitialLoading(false);
            } else {
                setLoading(false);
            }

        }
    }, [overserrUrl, overseerrApi, genresTV]);

    useEffect(() => {
        const fetchData = async () => {
            setTvData([]); // Clear the state

            // Fetch 'trending' first
            await fetchTvData('trending');

            // Then fetch 'upcoming'
            await fetchTvData('upcoming');

            // Then fetch three random genres
            const genreKeys = Object.keys(genresTV);
            for (let i = 0; i < 3; i++) {
                const randomIndex = Math.floor(Math.random() * genreKeys.length);
                const genre = genreKeys[randomIndex];
                await fetchTvData('genre', genresTV[genre]);
                // Remove the selected genre from genreKeys so it won't be selected again
                genreKeys.splice(randomIndex, 1);
            }

            // Finally, fetch 'default' (all TVs)
            await fetchTvData('default', 'AllTVs');
        };

        fetchData();
    }, []);


// Add a function to fetch more data
    const fetchMoreData = () => {
        setPage(prevPage => {
            const newPage = prevPage + 1;
            fetchTvData('default', 'AllTVs', newPage, newPage + 4);
            return newPage;
        });
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        setRefreshing(false);
    }, []);




    const TvItem = ({ item, category,isPlaying}) => {
        if (category === 'trending') {
            return (
                <TouchableOpacity
                    style={{margin: 5,}}
                    onPress={() => navigation.navigate('MediaDetails', { id: item.id, mediaType: item.mediaType })}>
                    {item.posterPath ? (
                        <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w500${item.backdropPath}` }}
                            style={styles.posterTrending}
                            contentFit={'cover'}
                            transition={800}
                            transitionDuration={300}
                        />
                    ) : (
                        <ImageBackground
                            source={require('../../../assets/icon.png')}
                            style={styles.noPosterTrending}
                            contentFit={'cover'}
                            imageStyle={{ borderRadius: 5 }}
                        >
                            <LinearGradient
                                colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                                style={styles.linearGradientNoPoster}
                            />
                            <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 6 }}>
                                <Text style={styles.noPosterText}>
                                    POSTER NOT FOUND
                                </Text>
                            </View>
                        </ImageBackground>
                    )}

                    {isPlaying && (
                        <View style={styles.topTextMediaTextRow}>
                            <View style={[styles.topTextMediaContainer,
                                {borderWidth:2,
                                    borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgb(37,99,235)',
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
                    )}
                </TouchableOpacity>
            );
        }
        if (category === 'upcoming') {
            return (
                <TouchableOpacity
                    style={{
                        margin: 5,
                    }}
                    onPress={() => navigation.navigate('MediaDetails', { id: item.id, mediaType: item.mediaType })}>
                    {item.posterPath ? (
                        <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w500${item.posterPath}` }}
                            style={styles.upcomingPoster}
                            contentFit={'cover'}
                            transition={800}
                            transitionDuration={300}
                        />
                    ) : (
                        <ImageBackground
                            source={require('../../../assets/icon.png')}
                            style={styles.upcomingNoPoster}
                            contentFit={'cover'}
                            imageStyle={{ borderRadius: 5 }}  // Apply the border radius to the image
                        >
                            <LinearGradient
                                colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                                style={styles.linearGradientUpcoming}
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
                            {borderWidth:2,
                                borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgb(37,99,235)',
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
            );
        }
        if (category === 'AllTVs') {
            return (
                <TouchableOpacity
                    style={{
                        margin: 5,
                    }}
                    onPress={() => navigation.navigate('MediaDetails', { id: item.id, mediaType: item.mediaType })}>
                    {item.posterPath ? (
                        <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w500${item.posterPath}` }}
                            style={styles.poster}
                            contentFit={'cover'}
                            transition={800}
                            transitionDuration={300}
                        />
                    ) : (
                        <ImageBackground
                            source={require('../../../assets/icon.png')}
                            style={styles.poster}
                            contentFit={'cover'}
                            imageStyle={{ borderRadius: 5 }}  // Apply the border radius to the image
                        >
                            <LinearGradient
                                colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                                style={styles.linearGradient}
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
                            {borderWidth:2,
                                borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgb(37,99,235)',
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
            );
        }
        return (
            <TouchableOpacity
                style={{
                    margin: 5,
                }}
                onPress={() => navigation.navigate('MediaDetails', { id: item.id, mediaType: item.mediaType })}>
                {item.posterPath ? (
                    <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w500${item.backdropPath}` }}
                        style={styles.posterGenre}
                        contentFit={'cover'}
                        transition={800}
                        transitionDuration={300}
                    />
                ) : (
                    <ImageBackground
                        source={require('../../../assets/icon.png')}
                        style={styles.noPosterGenre}
                        contentFit={'cover'}
                        imageStyle={{ borderRadius: 5 }}
                    >
                        <LinearGradient
                            colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                            style={styles.linearGradientNoPosterGenre}
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
                        {borderWidth:2,
                            borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgb(37,99,235)',
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
                                {item.mediaInfo && item.mediaInfo.status === 4 && <Text style={{color:'#059b2e'}}>-</Text>}
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
            {initialLoading ? (
                <ActivityIndicator
                    size="large"
                    color="#ffffff"
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                />
            ) : (
                <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, justifyContent:'space-between' }}>
                        <MaskedView
                            style={{ height: 54, flex: 1 }}
                            maskElement={<Text style={styles.pageTitle}>TV</Text>}
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
                        data={tvData ? tvData.filter(item => item.category !== 'AllTvs') : []}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View style={{ marginVertical: 3 }}>
                                <Text style={styles.pageTitleM}>{item.category}</Text>
                                <ScrollView
                                    scrollEventThrottle={400}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                >
                                    {item.results && item.results.map((movie, i) => (
                                        <TvItem key={i} item={movie} category={item.category} />
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                        ListFooterComponent={(
                            <View style={{ flex: 1, marginBottom:130}}>
                                <FlatList
                                    data={allTVData}
                                    keyExtractor={(item, index) => item.id.toString() + item.name + index}
                                    numColumns={3}
                                    onEndReached={fetchMoreData}
                                    onEndReachedThreshold={0.5}
                                    renderItem={({ item }) => <TvItem item={item} category='AllTVs' />}
                                    ListFooterComponent={loading ?
                                        <View style={{ height: 50, justifyContent: 'center' }}>
                                            <ActivityIndicator size="large" color="#ffffff" />
                                        </View>
                                        : null
                                    }
                                />
                            </View>
                        )}
                    />
                </>
            )}
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        opacity: 1,
        paddingTop: 50,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'left',
        marginVertical: 10,
        marginLeft: 5,
        textTransform: 'uppercase',
    },
    itemContainer: {
        width: '30%', // adjust as needed
        marginHorizontal: '1%', // adjust as needed
        marginVertical: 5, // adjust as needed
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        textAlign: 'left',
        color: 'rgba(158,59,227,0.76)',
        paddingVertical: 5,
    },
    year: {
        fontSize: 14,
        textAlign: 'center',
    },
    status: {
        fontSize: 12,
        textAlign: 'center',
    },
    poster: {
        width: 135,
        height: 210,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    posterText: {
        fontSize: 12,
        textAlign: 'center',
    },
    topTextMediaContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
        margin: 5,
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
    input: {
        marginBottom: 2,
        backgroundColor: 'rgb(55, 65, 81)',
        opacity: 0.8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        padding: 6,
        fontSize: 19,
    },

    inputLabel :{
        color: '#fff',
        fontSize: 19,
        marginBottom: 5,
    },
    sliderContainer: {
        width: '100%',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    marginLeft: {
        marginLeft: 7,
    },

    trackStyle: {
        height: 10,
        borderRadius: 10,
    },
    selectedStyle: {
        backgroundColor: '#6466f1',
    },
    markerStyle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        marginTop: 10,
        backgroundColor: '#6466f1',
        borderWidth: 1,
        borderColor: '#6466f1',
    },
    pressedMarkerStyle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        backgroundColor: '#6466f1',
        borderWidth: 1,
        borderColor: '#6466f1',
        paddingLeft: 10,
    },
    text: {
        color: '#737373',
        fontSize: 14,
        textAlign: 'center',
    },
    scrollHeight: {
        height: 100,
    },
    trackStyle1: {
        height: 10,
        borderRadius: 10,
        backgroundColor: '#6466f1',
    },
    thumbStyle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        backgroundColor: '#6466f1',
        borderWidth: 1,
        borderColor: '#6466f1',
    },
    applyFiltersButton :{
        backgroundColor: 'rgba(2,108,31,0.62)',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(213,212,212,0.22)',
        paddingHorizontal: 5,
    },
    clearFiltersButton :{
        backgroundColor: 'rgba(187,188,190,0.45)',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(213,212,212,0.22)',
        paddingHorizontal: 5,
    },
    headerFilterText: {
        color: '#fff',
        fontSize: 19,
        marginBottom: 5,
    },
    headerFilter: {
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingHorizontal:10,
        backgroundColor: '#161f2e',
        height:60,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    clearFilterText: {
        color: '#fff',
        fontSize: 19,
        marginBottom: 5,
    },
    applyFilterText: {
        color: '#fff',
        fontSize: 19,
        marginBottom: 5,
    },
    rowSpaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    datePickerText: {
        color: 'rgba(255,255,255,0.29)',
        fontSize: 17,
        marginBottom: 0,
    },
    filterButton: {
        position: 'absolute',
        bottom: 80,
        right: 10,
        width: 50,
        height: 50,
    },
    pageTitleMask: {
        height: 60,  left: 0, right: 0, top: 0, bottom: 0,
        paddingVertical: 0,
    },
    pageTitleM: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'left',
        marginVertical: 0,
        marginLeft: 5,
        textTransform: 'capitalize',
        color: 'rgba(185,106,241,0.76)',
        paddingVertical: 5,
    },
    mediaStatusContainer : {
        width: 22,
        height: 22,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    posterTrending: {
        width: 350,
        height: 220,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    noPosterTrending: {
        width: 350,
        height: 220,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    linearGradientNoPoster: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 220,
        borderRadius: 10,
    },
    linearGradientNoPosterGenre: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 150,
        borderRadius: 10,
    },
    noPosterText: {
        color: 'rgba(107,103,103,0.96)',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    upcomingPoster: {
        width: 200,
        height: 280,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    upcomingNoPoster: {
        width: 200,
        height: 280,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    linearGradientUpcoming: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: 200,
        height: 280,
        borderRadius: 5,
    },
    posterGenre: {
        width: 230,
        height: 150,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },
    noPosterGenre: {
        width: 230,
        height: 150,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(143,143,143,0.11)',
    },



});
export default TV;
