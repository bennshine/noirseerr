import React, {useContext, useRef, useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Discover from './screens/mainScreens/movietv/Discover';
import Movies from './screens/mainScreens/movietv/Movies';
import TV from './screens/mainScreens/movietv/TV';
import Requests from './screens/mainScreens/movietv/Requests';
import Admin from './screens/mainScreens/admin/Admin';
import Login from './screens/Login';
import {Entypo, Fontisto, Ionicons, Octicons} from "@expo/vector-icons";
import {UserContext, UserProvider} from "./context/UserContext";
import {FlatList, Platform, ScrollView, TouchableOpacity} from "react-native";
import MediaDetails from "./screens/mainScreens/movietv/MediaDetails";
import Profile from "./screens/mainScreens/profile/Profile";
import ActorDetails from "./screens/mainScreens/movietv/ActorDetails";
import {BottomSheetModal, BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import ModalContext from './context/ModalContext';
import {Text, TextInput, View} from "react-native";
import {Button} from "react-native-paper";
import {Image, ImageBackground} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import Downloads from "./screens/mainScreens/downloads/Downloads";
import { useUpdates } from 'expo-updates';
import Studio from "./screens/mainScreens/movietv/Studio";
import Network from "./screens/mainScreens/movietv/Network";
import {SafeAreaProvider} from "react-native-safe-area-context";
import Languages from "./screens/mainScreens/movietv/Languages";
import Collection from "./screens/mainScreens/movietv/Collection";
import Music from "./screens/mainScreens/music/Music";
import MusicDetails from "./screens/mainScreens/music/MusicDetails";
import MusicPlaylist from "./screens/mainScreens/music/MusicPlaylist";
import TokenContext from './context/TokenContext';
import ArtistDetails from "./screens/mainScreens/music/ArtistDetails";
import Genres from "./screens/mainScreens/movietv/Genres";
import config from "./config";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

let overserrUrl,
    overseerrApi,
    tmdbApiKey

overserrUrl = config.overserrUrl
overseerrApi = config.overseerrApi
tmdbApiKey = config.tmdbApiKey

function MainTabs({route, navigation}) {
    const { userDetails } = useContext(UserContext);
    const bottomSheetModalSearchRef = useRef(null);
    const [results, setResults] = React.useState([]);  // Create a state variable to store the results
    //console.log(results)
    const openSearchModal = () => {
        setResults([]);  // Clear the results

        bottomSheetModalSearchRef.current.present();
    };
    const handleCancelPress = () => {
        setResults([]);  // Clear the results
        bottomSheetModalSearchRef.current.dismiss();
    };


    const handleSearchPress = async (searchQuery) => {
        try {
            const response = await fetch(`${overserrUrl}/api/v1/search?query=${searchQuery}&page=1&language=en`, {
                headers: {
                    'Authorization': `Bearer ${overseerrApi}`  // Replace 'your_api_key' with your actual API key
                }
            });
            const data = await response.json();  // Parse the response as JSON
            setResults(data.results);  // Update the 'results' state
        } catch (error) {
            console.error(error);
        }
    };
    return (
<>
    <ModalContext.Provider value={{ openSearchModal, bottomSheetModalSearchRef }}>
      <Tab.Navigator
          screenOptions={({ route }) => ({
              tabBarStyle: {
                  backgroundColor:'#111827',
                  position: 'absolute',
                  borderTopWidth: 0
              },
              tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Discover') {
                iconName = focused ? 'star' : 'star-outline';
              } else if (route.name === 'Movies') {
                iconName = focused ? 'film' : 'film-outline';
              }
              else if (route.name === 'TV') {
                iconName = focused ? 'tv' : 'tv-outline';
              }
              else if (route.name === 'Music') {
                iconName = focused ? 'musical-notes' : 'musical-notes-outline';
              }
              else if (route.name === 'Requests') {
                iconName = focused ? 'chatbox' : 'chatbox-outline';
              }
              else if (route.name === 'Admin') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
                else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                }
                else if (route.name === 'Downloads') {
                    iconName = focused ? 'download' : 'download-outline';
                }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
          screenBarOptions={{
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',

          }}
      >
        <Tab.Screen
            options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerRight: () => (
                    <Ionicons
                        name="search"
                        size={26}
                        color="#ffffff"
                        style={{ marginRight: 15 }}
                        onPress={() => {
                            bottomSheetModalSearchRef.current.present();
                        }}

                    />
                ),
            }}


            name="Discover" component={Discover} />
        <Tab.Screen name="Movies" component={Movies}
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerTransparent: true,
                        headerRight: () => (
                            <Ionicons
                                name="search"
                                size={26}
                                color="#ffffff"

                                style={{
                                    marginRight: 15,
                                    paddingTop: Platform.OS === 'ios' ? 23 : 10,
                                }}
                                onPress={() => {
                                    bottomSheetModalSearchRef.current.present();
                                }}

                            />
                        ),
                    }}


        />
        <Tab.Screen name="TV" component={TV}
            options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerRight: () => (
                    <Ionicons
                        name="search"
                        size={26}
                        color="#ffffff"
                        style={{ marginRight: 15 }}
                        onPress={() => {
                            bottomSheetModalSearchRef.current.present();
                        }}

                    />
                ),
            }}
        />
          {/*{userDetails?.permissions === 16777506 && (*/}

              <Tab.Screen name="Music" component={Music}
            options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerRight: () => (
                    <Ionicons
                        name="search"
                        size={26}
                        color="#ffffff"
                        style={{ marginRight: 15 }}
                        onPress={() => {
                            bottomSheetModalSearchRef.current.present();
                        }}

                    />
                ),
            }}
        />
            {/*)}*/}
        <Tab.Screen name="Requests" component={Requests}
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerTransparent: true,
                        headerRight: () => (
                            <Ionicons
                                name="search"
                                size={26}
                                color="#ffffff"
                                style={{ marginRight: 15 }}
                                onPress={() => {
                                    bottomSheetModalSearchRef.current.present();
                                }}

                            />
                        ),
                    }}
        />
          {userDetails?.permissions === 16777506 && (
              <Tab.Screen name="Downloads" component={Downloads}
                            options={{
                                headerShown: true,
                                headerTitle: '',
                                headerTransparent: true,
                            }}
              />)
          }
          {
              userDetails && userDetails.permissions === 16777506 ?
                  <Tab.Screen
                      name="Admin"
                      component={Admin}
                        options={{
                            headerShown: true,
                            headerTitle: '',
                            headerTransparent: true,
                        }}
                  />
                  :
                  <Tab.Screen
                      options={{
                            headerShown: true,
                            headerTitle: '',
                            headerTransparent: true,
                            headerRight: () => (
                                <Ionicons
                                    name="search"
                                    size={26}
                                    color="#ffffff"
                                    style={{ marginRight: 15 }}
                                    onPress={() => {
                                        bottomSheetModalSearchRef.current.present();
                                    }}

                                />
                            ),
                      }}
                      name="Profile" component={Profile} />
          }


      </Tab.Navigator>
        </ModalContext.Provider>
    <BottomSheetModalProvider>
        <BottomSheetModal
            ref={bottomSheetModalSearchRef}
            index={1}
            snapPoints={[300, '94%']}
            backgroundComponent={({ style }) => <View style={[style, { backgroundColor: 'rgba(22,31,46,0.91)' }]} />}  // Make the background transparent
            handleComponent={null}  // Add this line

        >
            <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal:10, backgroundColor: '#161f2e',height:60, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                <TextInput
                    mode={'flat'}
                    activeUnderlineColor={'transparent'}
                    textColor={'rgba(224,222,222,0.96)'}
                    placeholderTextColor={'rgba(255,255,255,0.73)'}
                    theme={{ colors: { primary: '#ffffff' } }}
                    placeholder="Search..."
                    style={{color:'#ffffff', flex: 1, height:40,borderWidth: 1, borderColor: '#ffffff', borderRadius: 5, marginRight: 10,paddingHorizontal:10, backgroundColor: 'rgba(255,255,255,0.07)' }}
                    onSubmitEditing={(event) => handleSearchPress(event.nativeEvent.text)}
                />

                <Button
                    textColor={'#ffffff'}
                    onPress={handleCancelPress}>
                    Cancel
                </Button>
            </View>
            <View>
                <FlatList
                    data={results}
                    showsVerticalScrollIndicator={false}
                    numColumns={3}
                    contentContainerStyle={{ paddingBottom: 300 }}  // Add bottom padding
                    renderItem={({ item }) => {
                        return (
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    margin: 4

                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => {

                                        if (item.mediaType === 'person') {
                                            navigation.navigate('ActorDetails', {castid: item.id});
                                        }
                                        else {
                                            navigation.navigate('MediaDetails', { id: item.id, mediaType: item.mediaType });
                                        }
                                    }}
                                    style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', margin: 1 }}
                                >
                                    {item.mediaType === 'person' && item.profilePath ? (
                                        <Image
                                            source={{
                                                uri: `https://image.tmdb.org/t/p/w500${item.profilePath}`
                                            }}
                                            style={styles.poster}
                                            contentFit={'cover'}
                                            transitionDuration={1000}
                                        />
                                    ) : item.posterPath ? (
                                        <Image
                                            source={{
                                                uri: `https://image.tmdb.org/t/p/w500${item.posterPath}`
                                            }}
                                            style={styles.poster}
                                            contentFit={'cover'}
                                            transitionDuration={1000}
                                        />
                                    ) : (
                                        <ImageBackground
                                            source={require('./assets/icon.png')}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                position: 'absolute',
                                                borderRadius: 5,
                                                alignSelf: 'center',
                                            }}
                                            imageStyle={{ borderRadius: 5 }}  // Apply the border radius to the image
                                        >
                                            <LinearGradient
                                                colors={['rgba(31,31,31,0.93)', 'rgba(30,28,28,0.87)']}
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    right: 0,
                                                    top: 0,
                                                    height: 190,
                                                    borderRadius: 5,
                                                }}
                                            />
                                            <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 6 }}>
                                                <Text
                                                    style={{
                                                        color: 'rgba(107,103,103,0.96)',
                                                        fontSize: 15,
                                                        fontWeight: 'bold',
                                                        textAlign: 'center',

                                                    }}
                                                >
                                                    POSTER NOT FOUND
                                                </Text>
                                            </View>
                                        </ImageBackground>
                                    )}


                                    <View style={styles.topTextMediaTextRow}>
                                        <View style={[styles.topTextMediaContainer,
                                            {borderWidth:2,
                                                //borderColor: 'rgba(37,99,235,0.99)',
                                                borderColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.63)' : 'rgba(37,99,235,0.99)',
                                                backgroundColor: item.mediaType === 'tv' ? 'rgba(147,51,234,0.73)' : 'rgba(37,99,235,0.65)'}]}
                                        >
                                            <Text style={styles.topTextMediaText}>{item.mediaType === 'tv' ? 'SERIES' : item.mediaType}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {item.mediaInfo &&
                                                <View style={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: 100,
                                                    backgroundColor: item.mediaInfo && item.mediaInfo.status === 3 ? 'rgba(99, 102, 241, 0.8)' : '#dcfce7',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    marginRight: 5,
                                                    borderWidth: item.mediaInfo && item.mediaInfo.status === 3 ? 0 : 2,
                                                    borderColor: item.mediaInfo && item.mediaInfo.status === 3 ? 'transparent' : '#059b2e',
                                                }}>

                                                    {item.mediaInfo && item.mediaInfo.status === 5 && <Entypo name="check" size={14} color="#059b2e" />}
                                                    {item.mediaInfo && item.mediaInfo.status === 4 && <Octicons name="dash" size={14} color="#059b2e" />}
                                                    {item.mediaInfo && item.mediaInfo.status === 3 && <Ionicons name="time-sharp" size={21} color="white" />}
                                                </View>
                                            }
                                            <Text style={styles.title}>{item.status}</Text>
                                        </View>

                                    </View>
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                    keyExtractor={item => item.id.toString()}
                />
            </View>
        </BottomSheetModal>
    </BottomSheetModalProvider>
</>


);
}

export default function App() {
    const [token, setToken] = useState(null);

    return (

        <SafeAreaProvider >
            <TokenContext.Provider value={{ token, setToken }}>

            <UserProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                <Stack.Screen

                    name="Main"
                    component={MainTabs}
                    options={{
                        headerRight: () => (
                            <Ionicons
                                name="search"
                                size={26}
                                color="#ffffff"
                                style={{ marginRight: 15}}
                                onPress={() => {
                                    openSearchModal();  // Call the openSearchModal function
                                }

                                    }

                            />
                        ),
                        headerShown: false }}
                />
                <Stack.Screen
                    name={"MediaDetails"}
                    component={MediaDetails}
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerTransparent: true,
                        headerLeft: (props) => (
                            <TouchableOpacity
                                style={{ marginLeft: 10 }}
                                onPress={props.onPress}>
                                <Ionicons name="chevron-back-circle" size={30} color="#ffffff" />
                            </TouchableOpacity>
                        ),

                    }}
                />
                  <Stack.Screen
                    name={"MusicDetails"}
                    component={MusicDetails}
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerTransparent: true,
                        headerLeft: (props) => (
                            <TouchableOpacity
                                style={{ marginLeft: 10 }}
                                onPress={props.onPress}>
                                <Ionicons name="chevron-back-circle" size={30} color="#ffffff" />
                            </TouchableOpacity>
                        ),

                    }}
                />
                  <Stack.Screen
                    name={"Genres"}
                    component={Genres}
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerTransparent: true,
                        headerLeft: (props) => (
                            <TouchableOpacity
                                style={{ marginLeft: 10 }}
                                onPress={props.onPress}>
                                <Ionicons name="chevron-back-circle" size={30} color="#ffffff" />
                            </TouchableOpacity>
                        ),

                    }}
                />
                  <Stack.Screen
                    name={"ArtistDetails"}
                    component={ArtistDetails}
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerTransparent: true,
                        headerLeft: (props) => (
                            <TouchableOpacity
                                style={{ marginLeft: 10 }}
                                onPress={props.onPress}>
                                <Ionicons name="chevron-back-circle" size={30} color="#ffffff" />
                            </TouchableOpacity>
                        ),

                    }}
                />
                  <Stack.Screen
                    name={"MusicPlaylist"}
                    component={MusicPlaylist}
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerTransparent: true,
                        headerLeft: (props) => (
                            <TouchableOpacity
                                style={{ marginLeft: 10 }}
                                onPress={props.onPress}>
                                <Ionicons name="chevron-back-circle" size={30} color="#ffffff" />
                            </TouchableOpacity>
                        ),

                    }}
                />
                  <Stack.Screen
                      name={"ActorDetails"}
                      component={ActorDetails}
                      options={{
                          headerShown: true,
                          headerTitle: '',
                          headerTransparent: true,
                          headerLeft: (props) => (
                              <TouchableOpacity
                                  style={{ marginLeft: 10 }}
                                  onPress={props.onPress}>
                                  <Ionicons name="chevron-back-circle" size={30} color="#ffffff" />
                              </TouchableOpacity>
                          ),
                      }}
                  />
                  <Stack.Screen
                        name={"Studio"}
                        component={Studio}
                        options={{
                            headerShown: true,
                            headerTitle: '',
                            headerTransparent: true,
                            headerLeft: (props) => (
                                <TouchableOpacity
                                    style={{ marginLeft: 10 }}
                                    onPress={props.onPress}>
                                    <Ionicons name="chevron-back-circle" size={30} color="#ffffff" />
                                </TouchableOpacity>
                            ),
                        }}
                    />
                  <Stack.Screen
                        name={"Network"}
                        component={Network}
                        options={{
                            headerShown: true,
                            headerTitle: '',
                            headerTransparent: true,
                            headerLeft: (props) => (
                                <TouchableOpacity
                                    style={{ marginLeft: 10 }}
                                    onPress={props.onPress}>
                                    <Ionicons name="chevron-back-circle" size={30} color="#ffffff" />
                                </TouchableOpacity>
                            ),
                        }}
                    />
                  <Stack.Screen
                        name={"Languages"}
                        component={Languages}
                        options={{
                            headerShown: true,
                            headerTitle: '',
                            headerTransparent: true,
                            headerLeft: (props) => (
                                <TouchableOpacity
                                    style={{ marginLeft: 10 }}
                                    onPress={props.onPress}>
                                    <Ionicons name="chevron-back-circle" size={30} color="#ffffff" />
                                </TouchableOpacity>
                            ),
                        }}
                    />
                  <Stack.Screen
                        name={"Collection"}
                        component={Collection}
                        options={{
                            headerShown: true,
                            headerTitle: '',
                            headerTransparent: true,
                            headerLeft: (props) => (
                                <TouchableOpacity
                                    style={{ marginLeft: 10 }}
                                    onPress={props.onPress}>
                                    <Ionicons name="chevron-back-circle" size={30} color="#ffffff" />
                                </TouchableOpacity>
                            ),
                        }}
                    />
              </Stack.Navigator>


            </NavigationContainer>
          </UserProvider>
            </TokenContext.Provider>
        </SafeAreaProvider>
  );
}

const styles = {
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
    button: {
        marginTop: 20,
        paddingVertical: 5,
        alignItems: 'center',
        backgroundColor: '#059b2e',
        borderColor: '#059b2e',
        borderWidth: 1,
        borderRadius: 5,
        width: 200,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    topTextMediaContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        margin: 3,
    },
    topTextMediaText: {
        color: '#fff',
        fontSize: 12,
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
    poster :{
        height: 190,
        borderRadius: 5,
        width: '100%',
    }
}
