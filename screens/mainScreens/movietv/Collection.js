import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList
} from 'react-native';
import { useEffect, useState } from 'react';
import {Image, ImageBackground} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import {Entypo, Ionicons, Octicons} from "@expo/vector-icons";
import CustomAccordion from "../../../component/customAccordion";
import config from "../../../config";


let overserrUrl, overseerrApi,tmdbApiKey;

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey

const Collection = ({route, navigation}) => {
    let { id,mediaType} = route.params;
    const [collectionData, setCollectionData] = useState({ results: [] });
    const genresMovies =  {
        "28": "Action",
        "12": "Adventure",
        "16": "Animation",
        "35": "Comedy",
        "80": "Crime",
        "99": "Documentary",
        "18": "Drama",
        "10751": "Family",
        "14": "Fantasy",
        "36": "History",
        "27": "Horror",
        "10402": "Music",
        "9648": "Mystery",
        "10749": "Romance",
        "878": "Science Fiction",
        "10770": "TV Movie",
        "53": "Thriller",
        "10752": "War",
        "37": "Western"
    };
    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const response = await fetch(`${overserrUrl}/api/v1/collection/${id}?language=en`,  {
                    headers: {
                        'X-Api-Key': `${overseerrApi}`,
                    },
                });
                const data = await response.json();
                setCollectionData(oldData => ({
                    ...data,
                    results: oldData && oldData.results ? [...oldData.results, ...(data.results || [])] : [...(data.results || [])],
                }));

            }
            catch (error) {
                console.error(error);
            }
        }
        fetchCollection();
    }, [id, mediaType]);
    return (
            <View style={styles.container}>
                <ScrollView>
                    {collectionData && (
                        <>
                            <ImageBackground
                                source={{ uri: `https://image.tmdb.org/t/p/w500${collectionData.backdropPath}` }}
                                style={styles.imageBackground}
                                contentFit={'cover'}
                            >
                                <LinearGradient
                                    colors={['#161F2EE4', 'rgb(22,31,46)']}
                                    style={styles.linearGradient}
                                />
                                <Image
                                    source={{ uri: `https://image.tmdb.org/t/p/w500${collectionData.posterPath}` }}
                                    style={[styles.mediaPoster,{marginTop: 20}]}
                                    contentFit={'cover'}
                                />
                                {!collectionData.mediaInfo ? (
                                    <View
                                        style={{
                                            paddingHorizontal:9,
                                            marginTop:20,
                                        }}
                                    >
                                    </View>
                                ) : (
                                    <View
                                        style={[styles.statusView, {
                                            backgroundColor: getBackgroundColor(collectionData.mediaInfo.status),
                                        }]}
                                    >
                                        <Text style={styles.textStatus}>
                                            {STATUS_CODES[collectionData.mediaInfo.status]}
                                        </Text>
                                    </View>
                                )}
                                <Text style={styles.mediaTitle}>{collectionData.name}</Text>
                                <View>
                                    <View style={styles.rowCenter}>
                                        <Text style={[styles.mediaInfo,{paddingHorizontal:5}]}>
                                            {collectionData.parts ? collectionData.parts.length : 0} Movies
                                        </Text>
                                        {collectionData.parts && collectionData.parts[0] && collectionData.parts[0].genreIds && collectionData.parts[0].genreIds.length > 0 ? (
                                            <Text style={styles.mediaInfo}>
                                                {collectionData.parts[0].genreIds.map(genreId => genresMovies[genreId]).join(', ')}
                                            </Text>
                                        ) : null}
                                    </View>
                                    <View style={styles.playContainer}>
                                        {!collectionData.mediaInfo && (
                                            <TouchableOpacity
                                                mode={'outlined'}
                                                style={styles.requestButton}
                                            >
                                                <View style={styles.rowCenterCenter}>
                                                    <Ionicons name={'download-outline'} size={22} color={'#fff'} />
                                                    <Text style={styles.requestButtonText}>Request Collection</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </ImageBackground>
                        </>
                    )}
                    {collectionData && collectionData.overview && collectionData.overview.trim().length > 0 && (
                        <View style={styles.containerSection}>
                            <Text style={styles.sectionTitle}>Overview</Text>
                            <Text style={styles.mediaOverview}>{collectionData.overview}</Text>
                        </View>
                    )}
                        <View style={styles.containerSection}>
                            <Text style={styles.sectionTitle}>Movies</Text>
                            <FlatList
                                data={collectionData.parts}
                                horizontal={true}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.push('MediaDetails', {
                                                id: item.id,
                                                mediaType: item.mediaType,
                                            });
                                        }}
                                        style={{ marginRight: 10 }}>
                                        {item.posterPath ? (
                                            <Image
                                                source={{ uri: `https://image.tmdb.org/t/p/w500${item.posterPath}` }}
                                                style={styles.mediaPoster}
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
                                            <View style={{flexDirection: 'row', paddingTop:5}}>
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
                                keyExtractor={item => item.id.toString()}
                            />

                        </View>
                    {mediaType === 'tv' && collectionData && collectionData.seasons && collectionData.seasons.length > 0 && (
                        <View style={styles.containerSection}>
                            <Text style={styles.sectionTitle}>Season</Text>
                            {collectionDataSeasons && collectionDataSeasons.seasons && collectionDataSeasons.seasons.length > 0 ? (
                                <View style={[styles.containerSectionManage,{padding:0}]}
                                      key={collectionDataSeasons.id}
                                >
                                    {collectionDataSeasons && collectionDataSeasons.seasons && collectionDataSeasons.seasons.map((season, index) => {
                                        let mediaInfoSeason;
                                        if (collectionData.mediaInfo && collectionData.mediaInfo.seasons) {
                                            mediaInfoSeason = collectionData.mediaInfo.seasons.find(s => s.seasonNumber === season.seasonNumber);
                                        }
                                        return (
                                            <CustomAccordion
                                                key={`season-${season.seasonNumber}-${index}`}
                                                title={`Season ${season.seasonNumber}`}
                                                content={season.episodes && Array.isArray(season.episodes) ? season.episodes : []}
                                                statusCode={mediaInfoSeason ? mediaInfoSeason.status : undefined}
                                                totalEpisodeCount={season.statistics ? season.statistics.totalEpisodeCount : 0}
                                                route={route} // Pass route here
                                                search={search} // Pass search function here
                                                performInteractiveSearch={performInteractiveSearch} // Pass performInteractiveSearch function here
                                            />
                                        );
                                    })}
                                </View>
                            ) : (
                                <View style={styles.containerSectionManage}>
                                    {seasoncollectionData && seasoncollectionData.length > 0 ? (
                                        seasoncollectionData.map((season, index) => (
                                            <CustomAccordion
                                                keyExtractor={index + season.id + Date.now()}
                                                title={`Season ${season.seasonNumber}`}
                                                content={season.episodes}
                                                statusCode={season.status}
                                                totalEpisodeCount={season.episodes.length}
                                                route={route}
                                                search={search}
                                                performInteractiveSearch={performInteractiveSearch} // Pass performInteractiveSearch function here
                                            />
                                        ))
                                    ) : (
                                        <Text style={styles.mediaOverview}>No seasons found</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
    );
}
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
        bottom: 0,
        height: "100%",
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
    noPosterText: {
        color: 'rgba(107,103,103,0.96)',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(140,138,138,0.74)',
        paddingHorizontal: 5,
        paddingVertical: 5,
    },
    castContainer: {
        flexDirection: 'row',
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
        right: -19,
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    rowCenter: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    textStatus: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    statusView: {
        alignItems: 'center',
        borderRadius: 50,
        paddingHorizontal:9,
        borderWidth:1,
        marginTop:20,
        borderColor:'rgba(255,255,255,0.43)',
    },
    mediaStatusContainer : {
        width: 22,
        height: 22,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },

});

export default Collection;


