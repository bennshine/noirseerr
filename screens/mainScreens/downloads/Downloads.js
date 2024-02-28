import React from 'react';
import { View, StyleSheet } from 'react-native';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import QueueScreen from './Queue';
import HistoryScreen from './History';

const DownloadsScreen = () => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    return (
        <View style={styles.container}>
            {selectedIndex === 0 ? <QueueScreen /> : <HistoryScreen />}
            <SegmentedControlTab
                values={['Queue', 'History','Deluge Queue']}
                selectedIndex={selectedIndex}
                onTabPress={setSelectedIndex}
                key={selectedIndex}
                />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#161f2e',
        paddingBottom: 86,
        paddingHorizontal: 16,
    },
});

export default DownloadsScreen;
