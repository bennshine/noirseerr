import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from "react-native";
import {TextInput} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
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

const Password = () => {
    return (
        <ScrollView>
            <View style={styles.inputContainer}>
                <Text style={styles.title}>Current password</Text>
                <TextInput
                    mode={'flat'}
                    style={styles.input}
                    placeholderTextColor={'rgba(164,164,164,0.73)'}
                    underlineColor={'transparent'}
                    activeUnderlineColor={'transparent'}
                    textColor={'rgba(224,222,222,0.96)'}
                    theme={{ colors: { primary: '#ffffff' } }}
                    secureTextEntry={true}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.title}>New password</Text>
                <TextInput
                    mode={'flat'}
                    style={styles.input}
                    placeholderTextColor={'rgba(164,164,164,0.73)'}
                    underlineColor={'transparent'}
                    activeUnderlineColor={'transparent'}
                    textColor={'rgba(224,222,222,0.96)'}
                    theme={{ colors: { primary: '#ffffff' } }}
                    secureTextEntry={true}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.title}>Confirm password</Text>
                <TextInput
                    mode={'flat'}
                    style={styles.input}
                    placeholderTextColor={'rgba(164,164,164,0.73)'}
                    underlineColor={'transparent'}
                    activeUnderlineColor={'transparent'}
                    textColor={'rgba(224,222,222,0.96)'}
                    theme={{ colors: { primary: '#ffffff' } }}
                    secureTextEntry={true}
                />
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
                    const response = await fetch(`${overserrUrl}/api/v1/user/password`, {
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

                    // Check the response
                    if (response.ok) {
                        console.log('Password changed successfully');
                    } else {
                        console.log('Failed to change password:', response.status);
                    }
                }}
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
