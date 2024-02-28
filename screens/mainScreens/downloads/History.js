import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, RefreshControl, Platform} from 'react-native';
import axios from 'axios';
import config from "../../../config";

let sabnzbUrl,SabnzbApiKey

sabnzbUrl = config.sabnzbUrl
SabnzbApiKey = config.sabnzbApiKey


const HistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        setRefreshing(true);
        const response = await axios.get(`${sabnzbUrl}/sabnzbd/api?output=json&apikey=${SabnzbApiKey}&mode=history&start=0&limit=100&search=`);
        setHistory(response.data.history.slots);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const renderItem = ({ item }) => {
        // Convert the completed timestamp to a Date object
        const completedDate = new Date(item.completed * 1000);
        const now = new Date();

        // Calculate the time difference in seconds
        const diffInSeconds = Math.abs(now - completedDate) / 1000;
        const days = Math.floor(diffInSeconds / 86400);
        const hours = Math.floor(diffInSeconds / 3600) % 24;
        const minutes = Math.floor(diffInSeconds / 60) % 60;

        let timeDifference;
        if (days > 30) {
            const months = Math.floor(days / 30);
            timeDifference = `${months} month${months > 1 ? 's' : ''} ago`;
        } else if (days > 0) {
            timeDifference = `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            timeDifference = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            timeDifference = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }

        return (
            <View style={styles.itemContainer}>
                <Text numberOfLines={1} style={styles.fileName}>{`${item.name}`}</Text>
                <View style={styles.row}>
                    <Text style={styles.fileDet}>{`${timeDifference}`} -</Text>
                    <Text style={styles.fileDet}>{`${item.size}`} -</Text>
                    <Text style={styles.fileDet}>{`${item.category}`} </Text>
                </View>
                <View>
                    <Text style={[styles.fileDet,{color: '#05dc41'}]}>{`${item.status}`} </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item.nzo_id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchHistory}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(22,31,46,0.62)',
        marginTop: '25%',
    },
    row: {
        flexDirection: 'row',
        paddingTop: 3,
        borderRadius: 4,
    },
    fileDet: {
        color: '#a4a3a3',
        fontSize: 12,
    },
    fileName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemContainer: {
        backgroundColor: 'rgba(42,59,76,0.25)',
        padding: 10,
        marginVertical: 4,
        marginHorizontal: 2,
        borderRadius: 10,
    },
});

export default HistoryScreen;
