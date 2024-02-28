import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, RefreshControl, Platform, TouchableOpacity, Dimensions} from 'react-native';
import axios from 'axios';
import {ProgressBar} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
import config from "../../../config";

let SabnzbUrl, SabnzbApiKey,tmdbApiKey, delugeUrl, delugePassword;

SabnzbUrl = config.sabnzbUrl
SabnzbApiKey = config.sabnzbApiKey
delugeUrl = config.delugeUrl
delugePassword = config.delugePassword
tmdbApiKey = config.tmdbApiKey


const QueueScreen = () => {
    const [queue, setQueue] = useState([]);
    const [queueDetails, setQueueDetails] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [torrents, setTorrents] = useState([]);
    const filter_dict = {}; // Empty for no filtering, or add specific filters
    const keys = ["hash", "name", "progress", "state","download_payload_rate","eta","total_size","label"]; // Include hash
    const [totalTimeRemaining, setTotalTimeRemaining] = useState(0);
    const [totalSizeLeft, setTotalSizeLeft] = useState(0);
    const [totalSpeed, setTotalSpeed] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [color, setColor] = useState('black'); // Initialize color state variable

    let delugeTorrents = [];

    const toggleDownload = async (id, type) => {
        // Fetch Deluge torrents
        let delugeTorrents = [];
        try {
            const loginResponse = await axios.post(delugeUrl, {
                method: "auth.login",
                params: [delugePassword],
                id: 1
            });
            const torrentsResponse = await axios.post(delugeUrl, {
                method: "core.get_torrents_status",
                params: [filter_dict, keys],
                id: 2
            });
            delugeTorrents = Object.entries(torrentsResponse.data.result).map(([hash, item]) => ({
                ...item,
                type: 'deluge',
                id: hash,
                name: item.name,
                progress: item.progress ? item.progress : 0,
                state: item.state ? item.state : 'Unknown',
                downloadSpeed: item.download_payload_rate ? formatBytes(item.download_payload_rate) : '0 Bytes/s',
                eta: item.eta ? formatTime(item.eta) : 'Unknown',
            }));

        } catch (error) {
            console.error("API request error:", error);
        }

        const sabResponse = await axios.get(`${SabnzbUrl}/sabnzbd/api?output=json&apikey=${SabnzbApiKey}&mode=queue`);
        const sabnzbdDownloads = sabResponse.data.queue.slots.map(item => ({
            ...item,
            type: 'sabnzbd',
            id: item.nzo_id,
            name: item.filename,
            progress: item.percentage ? item.percentage : 0,
            state: item.status,
            downloadSpeed: sabResponse.data.queue.speed ? formatBytes(sabResponse.data.queue.speed) : '0 Bytes/s',
            eta: sabResponse.data.queue.timeleft ? formatTime(sabResponse.data.queue.timeleft) : 'Unknown',
        }));

        // Combine Deluge torrents and SABnzbd downloads
        const downloads = [...delugeTorrents, ...sabnzbdDownloads];

        const item = downloads.find(item => item.id === id);
        if (item) {
            if (item.type === 'deluge') {
                if (item.state === 'Paused') {
                    console.log(`Resuming Deluge torrent with id: ${id}`);
                    await axios.post(delugeUrl, {
                        method: "core.resume_torrent",
                        params: [[id]],
                        id: 1
                    }).catch(error => console.log('Error resuming Deluge torrent:', error));
                } else {
                    console.log(`Pausing Deluge torrent with id: ${id}`);
                    await axios.post(delugeUrl, {
                        method: "core.pause_torrent",
                        params: [[id]],
                        id: 1
                    }).catch(error => console.log('Error pausing Deluge torrent:', error));
                }
            } else if (item.type === 'sabnzbd') {
                if (item.state === 'Paused') {
                    console.log(`Resuming SABnzbd download with id: ${id}`);
                    await axios.get(`${SabnzbUrl}/sabnzbd/api`, {
                        params: {
                            mode: 'queue',
                            name: 'resume',
                            value: id,
                            apikey: SabnzbApiKey,
                            output: 'json'
                        }
                    }).catch(error => console.log('Error resuming SABnzbd download:', error));
                } else {
                    console.log(`Pausing SABnzbd download with id: ${id}`);
                    await axios.get(`${SabnzbUrl}/sabnzbd/api`, {
                        params: {
                            mode: 'queue',
                            name: 'pause',
                            value: id,
                            apikey: SabnzbApiKey,
                            output: 'json'
                        }
                    }).catch(error => console.log('Error pausing SABnzbd download:', error));
                }

            }
        }
    }

    // Define your fetchDownloads function
    const fetchDownloads = async (isPullToRefresh = false) => {
        if (isPullToRefresh) setRefreshing(true);

        // Fetch SABnzbd queue
        const sabResponse = await axios.get(`${SabnzbUrl}/sabnzbd/api?output=json&apikey=${SabnzbApiKey}&mode=queue`, { timeout: 5000 });
        const totalSize = sabResponse.data.queue.diskspace1_norm ? sabResponse.data.queue.diskspace1_norm : 'Unknown';
        const sizeLeft = sabResponse.data.queue.sizeleft ? sabResponse.data.queue.sizeleft : 'Unknown';
        const sabQueue = sabResponse.data.queue.slots.map(item => ({
            ...item,
            type: 'sabnzbd',
            id: item.nzo_id,
            name: item.filename,
            progress: item.percentage ? item.percentage : 0,
            state: item.status,
            totalSizeItem: item.mbleft ? item.mbleft : 0,
            speed: sabResponse.data.queue.speed ? sabResponse.data.queue.speed : 'Unknown',
            timeLeft: sabResponse.data.queue.timeleft ? sabResponse.data.queue.timeleft : 'Unknown'
        }));

        // Fetch Deluge torrents
        try {
            const loginResponse = await axios.post(delugeUrl, {
                method: "auth.login",
                params: [delugePassword],
                id: 1
            });
            const torrentsResponse = await axios.post(delugeUrl, {
                method: "core.get_torrents_status",
                params: [filter_dict, keys],
                id: 2
            });

            //console.log(torrentsResponse.data);
            delugeTorrents = Object.values(torrentsResponse.data.result).map(item => ({
                ...item,
                type: 'deluge',
                id: item.hash,
                name: item.name,
                progress: item.progress ? item.progress : 0,
                state: item.state ? item.state : 'Unknown',
                downloadSpeed: item.download_payload_rate ? formatBytes(item.download_payload_rate) : '0 Bytes/s',
                eta: item.eta ? formatTime(item.eta) : 'Unknown',
                totalSizeItem: item.total_size ? formatBytes(item.total_size) : '0.0 KB',
                cat: item.label ? item.label.split('-')[0] : 'Unknown',
                totalSize: totalSize // Use the same totalSize for Deluge
            }));

        } catch (error) {
            console.error("API request error:", error);
        }

        // Merge and set the queues
        const combinedQueue = [...sabQueue, ...delugeTorrents];
        const activeQueue = combinedQueue.filter((item) => item.state === 'Downloading' || item.state === 'Paused'|| item.state === 'Seeding');

        // Calculate the total time remaining, size left, and speed for all items
        let totalTimeRemaining = 0;
        let totalSizeLeft = 0;
        let totalSpeed = 0;
        let totalSizeItem = 0;

        activeQueue.forEach(item => {
            // Convert timeLeft from SABnzbd to seconds
            if (item.type === 'sabnzbd' && item.timeLeft) {
                const timeParts = item.timeLeft.split(':').map(Number);
                const timeInSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
                totalTimeRemaining += timeInSeconds;
                totalSizeItem += item.totalSize;

            } else if (item.type === 'deluge' && item.eta) {
                const etaParts = item.eta.split(' ');
                let etaInSeconds = 0;
                etaParts.forEach(part => {
                    if (part.endsWith('h')) {
                        etaInSeconds += parseInt(part) * 3600;
                    } else if (part.endsWith('m')) {
                        etaInSeconds += parseInt(part) * 60;
                    } else if (part.endsWith('s')) {
                        etaInSeconds += parseInt(part);
                    }
                });
                totalTimeRemaining += etaInSeconds;
            }

            //Convert totalSize from SABnzbd to bytes
            if (item.type === 'sabnzbd' && item.totalSize) {
                const sizeInBytes = parseFloat(item.totalSize) * 1024 * 1024;
                totalSizeItem += sizeInBytes;
            } else if (item.type === 'deluge' && item.total_size) {
                totalSizeItem += item.total_size;
            }

            // Convert speed from SABnzbd to bytes per second
            if (item.type === 'sabnzbd' && item.speed) {
                const speedInBytesPerSecond = parseFloat(item.speed) * 1024;
                totalSpeed += speedInBytesPerSecond;
            } else if (item.type === 'deluge' && item.download_payload_rate) {
                totalSpeed += item.download_payload_rate;
            }
        });
        setQueue(activeQueue);
        setTotalTimeRemaining(totalTimeRemaining);
        setTotalSizeLeft(sizeLeft);
        setTotalSpeed(totalSpeed);
        setTotalSize(totalSize);
        if (isPullToRefresh) setRefreshing(false);
    };

// Call your fetchDownloads function
    useEffect(() => {
        fetchDownloads();
        const intervalId = setInterval(() => fetchDownloads(false), 2000); // Fetches every 2 seconds
        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${secs}s`;
    }
    function getColor(totalSize) {

        if (!totalSize || totalSize === '0') {
            return;
        }
        // Trim whitespace and convert to lowercase
        totalSize = totalSize.trim().toLowerCase();

        // Convert totalSize to GB
        let sizeInGB;
        if (totalSize.endsWith('mb')) {
            sizeInGB = parseFloat(totalSize.slice(0, -2)) / 1024;
        } else if (totalSize.endsWith('g')) {
            sizeInGB = parseFloat(totalSize.slice(0, -1));
        } else {
            return 'black'; // Default color
        }

        // Determine color based on size
        if (sizeInGB > 500) {
            return '#05dc41';
        } else if (sizeInGB > 300) {
            return '#FFCA29';
        } else if (sizeInGB <= 300) {
            return '#FF2929';
        } else {
            return 'green'; // Default color
        }
    }

    useEffect(() => {
        const color = getColor(totalSize);
        if (color) {
            setColor(color);
        }
    }, [totalSize]);

    const renderItem = ({ item }) => {
        return (
            <View style={styles.listItem}>
                <View style={[styles.type,{
                    backgroundColor: item.type === 'sabnzbd' ? '#FFCA29' : '#4c91e8',
                }]}>
                    <Text
                        style={{
                            color: item.type === 'sabnzbd' ? '#000' : '#fff',
                            fontWeight: 'bold',
                        }}
                    >{item.type === 'sabnzbd' ? 'SABnzbd' : 'Deluge'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => {
                        console.log(item);  // Log the item object
                        toggleDownload(item.nzo_id || item.hash, item.type);
                    }} title={item.state === 'Paused' ? "Resume" : "Pause"} >
                        <Ionicons name={item.state === 'Paused' ? "play" : "pause"} size={24} color="white" />
                    </TouchableOpacity>

                    <View style={styles.rowItem}>
                        <Text numberOfLines={1} style={styles.fileName}>{item.name}</Text>
                        <View style={styles.row}>
                            <Text style={styles.fileDet}>
                                {item.state}      `
                                  {(typeof item.progress === 'number' ? item.progress : parseFloat(item.progress || 0)).toFixed(0)} %
                            </Text>

                            <Text style={styles.fileDet}> {item.sizeleft}/ {item.size}</Text>
                            <Text style={styles.fileDet}>{item.cat}</Text>
                        </View>
                        <ProgressBar
                            style={styles.progress}
                            progress={(item.progress || 0) / 100} color={'rgba(45,250,45,0.4)'}
                        />
                    </View>
                </View>
            </View>
        );

    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.rowUser}>
                    <View style={[styles.gridRequests,{
                    }]}>
                        <Text numberOfLines={1} style={styles.gridNumber}>
                            {formatTime(totalTimeRemaining)}
                        </Text>
                        <Text style={styles.gridTitle}>Time Remaining</Text>
                    </View>

                    <View style={styles.gridRequests}>
                        <Text numberOfLines={1}  style={styles.gridNumber}>
                            {totalSizeLeft}
                        </Text>
                        <Text style={styles.gridTitle}>Remaining</Text>
                    </View>

                    <View style={styles.gridRequests}>
                        <Text numberOfLines={1}  style={styles.gridNumber}>
                            {formatBytes(totalSpeed)}/s
                        </Text>
                        <Text style={styles.gridTitle}>Speed</Text>
                    </View>

                    <View style={[styles.gridRequests, {backgroundColor: color}]}>
                        <Text numberOfLines={1}  style={styles.gridNumber}>
                            {totalSize}
                        </Text>
                        <Text style={styles.gridTitle}>Free Space</Text>
                    </View>
                </View>
            </View>
            <FlatList
                key={queue.length}
                data={queue}
                renderItem={renderItem}
                keyExtractor={(item) => item.nzo_id || item.hash + item.type + item.name + Date.now()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchDownloads(true)}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(22,31,46,0.62)',
        marginTop: '15%',
        marginHorizontal: 4,
    },
    listItem: {
        backgroundColor: 'rgba(42,59,76,0.25)',
        padding: 6,
        marginTop: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(217,222,227,0.25)',
        width:'97%',
        marginHorizontal:7,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginTop: 15,
        width: Dimensions.get('window').width - 1,


    },
    playStopButton: {
        backgroundColor: 'rgba(42,59,76,0.25)',
        borderRadius: 10,
        padding: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    progress: {
        height: 5,
        width: '100%',
        backgroundColor: 'rgba(73,73,73,0.38)',
        borderRadius: 10,
        marginTop: 5,
    },
    gridRequests: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(42,59,76,0.25)',
        width: '23%',
        borderWidth: 1,
        borderColor: 'rgba(217,222,227,0.25)',

    },
    gridTitle: {
        color: '#fff',
        fontSize: 12,
    },
    gridNumber: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    rowUser: {
        flexDirection: 'row',
    },
    type: {
        borderRadius: 5,
        paddingHorizontal: 3,
        position: 'absolute',
        top: -13,
        right: -0,
    },
    rowItem: {
        marginLeft: 5,
        width: '90%',
    },



});

export default QueueScreen;
