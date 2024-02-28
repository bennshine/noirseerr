import {View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform} from "react-native";
import {TextInput} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
import {UserContext} from "../../../context/UserContext";
import {useContext, useEffect, useState} from "react";
import config from "../../../config";

let overserrUrl,
    overseerrApi,
    tmdbApiKey

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey


const Password = () => {
    const { userDetails, setUserDetails } = useContext(UserContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [hideCurrentPassword, setHideCurrentPassword] = useState(true);
    const [hideNewPassword, setHideNewPassword] = useState(true);
    const [message, setMessage] = useState(null);

    return (
        <ScrollView>
            <View>
                <View style={styles.inputContainer}>
                    <Text style={styles.title}>Current password</Text>
                    <View style={styles.inputWithIcon}>
                        <TextInput
                            mode={'flat'}
                            style={styles.input}
                            placeholderTextColor={'rgba(164,164,164,0.73)'}
                            underlineColor={'transparent'}
                            activeUnderlineColor={'transparent'}
                            textColor={'rgba(224,222,222,0.96)'}
                            theme={{ colors: { primary: '#ffffff' } }}
                            secureTextEntry={hideCurrentPassword}
                            onChangeText={text => setCurrentPassword(text)}
                        />
                        <TouchableOpacity style={styles.icon} onPress={() => setHideCurrentPassword(!hideCurrentPassword)}>
                            <Ionicons name={hideCurrentPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.title}>New password</Text>
                    <View style={styles.inputWithIcon}>
                        <TextInput
                            mode={'flat'}
                            style={styles.input}
                            placeholderTextColor={'rgba(164,164,164,0.73)'}
                            underlineColor={'transparent'}
                            activeUnderlineColor={'transparent'}
                            textColor={'rgba(224,222,222,0.96)'}
                            theme={{ colors: { primary: '#ffffff' } }}
                            secureTextEntry={hideNewPassword}
                            onChangeText={text => setNewPassword(text)}
                        />
                        <TouchableOpacity style={styles.icon} onPress={() => setHideNewPassword(!hideNewPassword)}>
                            <Ionicons name={hideNewPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View
                style={{
                    borderBottomColor: 'rgba(255,255,255,0.22)',
                    borderBottomWidth: 1,
                    marginBottom: 20,
                }}
            />
            <TouchableOpacity
                mode={'outlined'}
                style={styles.requestButton}
                onPress={async () => {
                    // Make a POST request to the Overseerr API
                    const response = await fetch(`${overserrUrl}/api/v1/user/${userDetails.id}/settings/password`, {
                        method: 'POST',
                        headers: {
                            'X-Api-Key': `${overseerrApi}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            currentPassword: currentPassword,
                            newPassword: newPassword,
                        }),
                    });
                    console.log(response);
                    // Check the response
                    if (response.ok) {
                        setMessage('Password changed successfully');
                        // Make the message disappear after 10 seconds
                        setTimeout(() => {
                            setMessage(null);
                        }, 5000);
                    } else {
                        const data = await response.json();
                        setErrorMessage(data.message);
                        console.log('error data' + data);
                    }
                }}
            >
                <View style={styles.rowCenterCenter}>
                    <Ionicons name={'download-outline'} size={22} color={'#fff'} />
                    <Text style={styles.requestButtonText}>Save Changes</Text>
                </View>
            </TouchableOpacity>
            <>{message && <Text style={{ color: 'green' }}>{message}</Text>}</>
            {errorMessage && <Text style={{ color: 'red'}}>{errorMessage}</Text>}

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
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
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
        width: '100%',

    },
    inputWithIcon: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    icon: {
        position: 'absolute',
        right: 10,
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
    },
    rowCenterCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    Title: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 15,
    },
})

export default Password
