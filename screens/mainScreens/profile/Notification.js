import {View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity, Platform} from "react-native";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {UserContext} from "../../../context/UserContext";
import {useContext, useEffect, useState} from "react";
import {Checkbox} from "react-native-paper";
import config from "../../../config";

let overserrUrl,
    overseerrApi,
    tmdbApiKey

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey

const Notification = () => {
    const { userDetails, setUserDetails } = useContext(UserContext);
    const [isApprovedChecked, setApprovedChecked] = useState(false);
    const [isDeclinedChecked, setDeclinedChecked] = useState(false);
    const [isAvailableChecked, setAvailableChecked] = useState(false);
    console.log(userDetails)
    async function fetchUserNotificationSettings(userId) {
        const response = await fetch(`${overserrUrl}/api/v1/user/${userId}/settings/notifications`, {
            headers: {
                'Authorization': `${overseerrApi}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    useEffect(() => {
        fetchUserNotificationSettings(userDetails.id)
            .then(data => {
                // Process the fetched notification settings here
                //console.log(data);
            })
            .catch(error => {
                console.error(`Error: ${error}`);
            });
    }, []);


    return (
        <ScrollView>
            <Text style={styles.Title}>Notification Settings</Text>

            <View style={styles.section}/>
            <View style={styles.inputContainer}>
                <TouchableOpacity
                    mode={'outlined'}
                    style={styles.requestButton}
                >
                    <View style={styles.rowCenterCenter}>
                        <Ionicons
                        name={'mail-outline'}
                            size={22} color={'#fff'} />
                        <Text style={styles.requestButtonText}>Email</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.section}/>

            <View style={[styles.section,{paddingBottom:20}]}>
                <Text style={styles.textSection}>Notification Types</Text>
                <View style={styles.checkboxSection}>
                    <TouchableOpacity
                        style={[styles.checkBox,{backgroundColor: isApprovedChecked ? 'rgb(79, 70, 229)' : 'rgba(255,255,255,0.22)'}]}
                        onPress={() => { setApprovedChecked(!isApprovedChecked); }}
                    >
                        {isApprovedChecked && <MaterialCommunityIcons name="check" size={20} color="#fff" />}
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Request Approved</Text>
                        <Text style={styles.titleDescription}>Get notified when your media requests are approved.</Text>
                    </View>
                </View>
                <View style={styles.checkboxSection}>
                    <TouchableOpacity
                        style={[styles.checkBox,{backgroundColor: isDeclinedChecked ? 'rgb(79, 70, 229)' : 'rgba(255,255,255,0.22)'}]}
                        onPress={() => { setDeclinedChecked(!isDeclinedChecked); }}
                    >
                        {isDeclinedChecked && <MaterialCommunityIcons name="check" size={20} color="#fff" />}
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Request Declined</Text>
                        <Text style={styles.titleDescription}>Get notified when your media requests are declined.</Text>
                    </View>
                </View>

                <View style={styles.checkboxSection}>
                    <TouchableOpacity
                        style={[styles.checkBox,{backgroundColor: isAvailableChecked ? 'rgb(79, 70, 229)' : 'rgba(255,255,255,0.22)'}]}
                        onPress={() => { setAvailableChecked(!isAvailableChecked); }}
                    >
                        {isAvailableChecked && <MaterialCommunityIcons name="check" size={20} color="#fff" />}
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Request Available</Text>
                        <Text style={styles.titleDescription}>Get notified when your media requests become available.</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                mode={'outlined'}
                style={styles.requestButton}
            >
                <View style={styles.rowCenterCenter}>
                    <Ionicons name={'download-outline'} size={22} color={'#fff'} />
                    <Text style={styles.requestButtonText}>Save Changes</Text>
                </View>
            </TouchableOpacity>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    rowUser: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#8d8989',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    titleDescription: {
        color: 'rgba(224,222,222,0.96)',
        fontSize: 13,

    },
    userType: {
        color: 'rgba(224,222,222,0.96)',
        fontSize: 14,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.22)',
        color: '#fff',
    },
    requestButton: {
        backgroundColor: '#2b2b2b',
        paddingVertical: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    requestButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        paddingRight: 10,
    },
    rowCenterCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 10,
    },
    Title: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    checkBox: {
        borderWidth: 1,
        borderColor: '#8d8989',
        borderRadius: 50,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    textSection: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        borderBottomColor: 'rgba(255,255,255,0.22)',
        borderBottomWidth: 1,
        marginBottom: 20,
    },
    checkboxSection: {
        flexDirection: 'row', alignItems: 'center', paddingVertical:8
    }
})

export default Notification
