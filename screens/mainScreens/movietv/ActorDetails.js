import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Platform
} from "react-native";
import {useEffect, useState} from "react";
import {LinearGradient} from "expo-linear-gradient";
import {Image, ImageBackground} from "expo-image";
import {Entypo, Fontisto, Ionicons, Octicons} from "@expo/vector-icons";
import config from "../../../config";

let overserrUrl,
    overseerrApi,
    tmdbApiKey

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey


const ActorDetails = ({ route, navigation }) => {
    let { castid } = route.params;

    const [actorDetails, setActorDetails] = useState([]);
    const [combinedMovieTV, setCombinedMovieTV] = useState([]);
    const [randomIndex, setBackdropIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const  getActorDetails = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`${overserrUrl}/api/v1/person/${castid}`, {
                headers: {
                    'X-Api-Key': `${overseerrApi}`,
                },
            });
            const data = await response.json();
            setActorDetails(data);

            // Fetch recommendations
            const combinedMovieTVResponse = await fetch(`${overserrUrl}/api/v1/person/${castid}/combined_credits`, {
                headers: {
                    'X-Api-Key': `${overseerrApi}`,
                },
            });
            const combinedMovieTVData = await combinedMovieTVResponse.json();
            setCombinedMovieTV(combinedMovieTVData);
            // Log the backdrop image URLs
            combinedMovieTVData.cast.forEach((castMember) => {
                if (castMember.backdropPath) {
                    //console.log(`Backdrop image URL: https://image.tmdb.org/t/p/w600_and_h900_bestv2${castMember.backdropPath}`);
                } else {
                    //console.log(`No backdrop image for cast member with ID ${castMember.id}`);
                }
            });
        } catch (error) {
            console.error(error);

        }
        setIsLoading(false);

    }

    useEffect(() => {
        setIsLoading(true);
            getActorDetails();
        setIsLoading(false);

        }
    , []);
    useEffect(() => {
        const timer = setInterval(() => {
            // Pick a random index
            const randomIndex = Math.floor(Math.random() * combinedMovieTV.cast.length);
            setBackdropIndex(randomIndex);
        }, 60000);

        return () => clearInterval(timer);
    }, [combinedMovieTV]);

    return (
        <ScrollView style={styles.container}>
            {isLoading ? (
                <ActivityIndicator size="large" color="#00ff00" />
            ) : (
                <>

                    <ImageBackground
                        source={{ uri: `https://image.tmdb.org/t/p/w600_and_h900_bestv2${combinedMovieTV.cast && combinedMovieTV.cast[randomIndex]?.backdropPath}` }}
                        style={styles.imageBackground}
                        contentFit={'cover'}
                        transition={800}
                        transitionDuration={300}
                        placeholderContentFit={'cover'}
                    >
                        <LinearGradient
                            colors={['#161F2EE4', 'rgb(22,31,46)']}
                            style={styles.linearGradient}
                        />

                        {actorDetails.profilePath ? (
                            <Image
                                source={{ uri: `https://image.tmdb.org/t/p/w600_and_h900_bestv2${actorDetails.profilePath}` }}
                                style={styles.actorImage}
                                contentFit={'cover'}

                            />
                        ) : (
                            <Image
                                source={require('../../../assets/icon.png')}
                                style={styles.actorImage}
                                contentFit={'cover'}
                            />
                        )}
                        <Text style={styles.mediaTitle}>
                            {actorDetails.name}
                        </Text>
                        <Text style={styles.actorDetails}>
                            Born {actorDetails.birthday} | {actorDetails.placeOfBirth}
                        </Text>
                        <Text style={styles.actorDetails}>
                            {actorDetails.alsoKnownAs}
                        </Text>
                    </ImageBackground>
                <View style={styles.pad10}>
                    <Text numberOfLines={10} style={styles.biography}>{actorDetails.biography}</Text>
                </View>
                <View style={styles.pad10}>
                    <Text style={styles.sectionTitle}>Appearances</Text>
                    <FlatList
                        data={combinedMovieTV.cast}
                        numColumns={3}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('MediaDetails', { id: item.id, mediaType: item.mediaType })}
                                style={styles.gridWidth}>
                                {item.posterPath ? (
                                    <Image
                                        source={{ uri: `https://image.tmdb.org/t/p/w500${item.posterPath}` }}
                                        style={styles.mediaPoster}
                                        contentFit={'cover'}
                                        transitionDuration={1000}
                                    />
                                ) : (
                                    <ImageBackground
                                        source={require('../../../assets/icon.png')}
                                        style={styles.mediaPoster}
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
                        )}
                    />
                </View>
                </>
            )}
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161f2e',
        opacity: 1,
    },
    header: {
        height: 80,
        backgroundColor: 'coral',
        paddingTop: 38,
    },
    title: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    imageBackground: {
        height: 500,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',

    },
    linearGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: "100%",
    },
    mediaTitle: {
        color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginVertical: 10,
    },
    mediaPoster: {
        height: 190,
        borderRadius: 5,
        width: '100%',
        alignSelf: 'center',
    },
    biography: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'left',
        paddingVertical: 5,
    },
    pad10: {
        padding: 10,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'left',
        marginVertical: 10,
    },
    gridWidth: {
        width: '30%',
        marginHorizontal: '1.6%',
        marginVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(70,70,70,0.41)',
        borderRadius: 10,
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
    mediaStatusContainer : {
        width: 22,
        height: 22,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    topTextMediaText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        paddingHorizontal: 5,
    },
    actorImage: {
        height: 200,
        width: 200,
        borderRadius: 100,
        borderWidth: 2,
        marginTop: 100,
        borderColor: '#fff',
    },
    actorDetails: {
        color: '#fff',
        fontSize: 13,
        textAlign: 'center',
        marginVertical: 10,
        marginHorizontal: 10,

    },
});


export default ActorDetails;
