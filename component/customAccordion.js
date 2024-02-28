import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import {useContext, useState} from "react";
import { Entypo, Octicons, Ionicons } from '@expo/vector-icons';
import {UserContext} from "../context/UserContext"; // Make sure to install these packages

const STATUS_CODES = {
    3: 'Requested',
    1: 'Rejected',
    2: 'Pending',
    4: 'Partially Available',
    5: 'Available',
};

const CustomAccordion = ({ title, content, statusCode, route, search, performInteractiveSearch }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { userDetails, setUserDetails } = useContext(UserContext);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const status = STATUS_CODES[statusCode] || 'Unknown';

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleOpen} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.seasonText}>{title}</Text>
                    <View style={styles.headerEpisodes}>
                        <Text style={styles.headerEpisodesText}> {content.length} episodes</Text>
                    </View>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <View style={{
                        width: 22,
                        height: 22,
                        borderRadius: 100,
                        backgroundColor: statusCode === 3 ? 'rgba(99, 102, 241, 0.8)' : (statusCode === 4 ? '#059b2e' : '#dcfce7'),
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 5,
                        borderWidth: statusCode && statusCode === 3 ? 0 : 2,
                        borderColor: statusCode === 3 ? 'transparent' : (statusCode === 4 ? '#dcfce7' : '#059b2e'),
                    }}>
                        {statusCode && statusCode === 5 && <Entypo name="check" size={14} color="#059b2e" />}
                        {statusCode && statusCode === 4 && <Octicons name="dash" size={14} color="#dcfce7" />}
                        {statusCode && statusCode === 3 && <Ionicons name="time-sharp" size={21} color="white" />}
                    </View>
                    {isOpen ? <Ionicons name="arrow-up" size={19} color="white" /> : <Ionicons name="arrow-down" size={19} color="white" />}
                </View>
            </TouchableOpacity>
            <View style={styles.contentMain}>
                {isOpen && content && content.map((episode, index) => {
                    let formattedAirDate = episode.airDate;

                    if (formattedAirDate) {
                        // Check if the airDate is in yyyy-dd-mm format
                        const dateParts = formattedAirDate.split("-");
                        if (dateParts.length === 3) {
                            // Reformat the date as dd-mm-yyyy
                            formattedAirDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                        }
                    } else {
                        formattedAirDate = 'Unknown';
                    }
                    const title = episode.title || episode.name;
                    return (
                        <View style={styles.content} key={index + episode.id + episode.seriesId + episode.seasonNumber}>
                            <Text style={styles.contentText}>{episode.episodeNumber + '  -  ' + title + '    ' + formattedAirDate}</Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={styles.contentDesc}>{episode.overview}</Text>
                                    <View style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 100,
                                        backgroundColor: episode.hasFile ? '#059b2e' : 'rgba(255,0,0,0.72)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 5,
                                        borderWidth: 2,
                                        borderColor: statusCode === 3 ? 'transparent' : (statusCode === 4 ? '#dcfce7' : '#059b2e'),
                                    }}>
                                        {episode.hasFile ? (

                                            <Entypo name="check" size={14} color="#dcfce7" style={{ marginLeft: 0 }} />
                                        ) : (
                                            <>
                                            {userDetails && userDetails.permissions === 16777506 &&  (
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    // Get the id and mediaType from route params
                                                    let { id, mediaType } = route.params;
                                                    // Expand the bottom sheet to show the search results
                                                    search();
                                                    // Perform the interactive search
                                                    await performInteractiveSearch(id, mediaType, episode.seriesId, episode.seasonNumber, episode.id);
                                                }}
                                            >
                                                <Octicons name="dash" size={14} color="#FFFFFF" style={{ marginLeft: 0 }} />
                                            </TouchableOpacity>
                                            )}
                                            </>
                                        )}
                                   </View>
                            </View>
                        </View>
                    );
                })}

            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    header: {
        backgroundColor: 'rgb(31, 41, 55)',
        borderRadius: 5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderWidth: 1,
        borderColor: 'gray',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    container: {
        marginVertical: 5,
        backgroundColor: 'rgb(31, 41, 55)',
    },
    content: {
        padding: 10,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,


    },
    contentMain: {
        backgroundColor: 'rgb(31, 41, 55)',
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'gray',
        borderTopWidth: 0,
        marginTop: -3,
        marginHorizontal: 0,
    },
    seasonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerEpisodes: {
        backgroundColor: 'rgb(17, 24, 39)',
        borderRadius: 5,
        paddingHorizontal: 5,
        marginHorizontal: 10,
        height: 20,



    },
    headerEpisodesText: {
        color: 'white',
    },
    contentText: {
        color: 'white',
    },
    contentDesc: {
        color: '#757272',
        width: '90%',
    },

});

export default CustomAccordion;
