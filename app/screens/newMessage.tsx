import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewMessage = () => {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text>NewMessage</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({})

export default NewMessage;
