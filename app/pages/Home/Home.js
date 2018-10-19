/*
 * Home.js
 * Author: Francois Charih <francoischarih@sce.carleton.ca>
 *
 * Description: Home page show upon login.
 */

import React from 'react';
import { StyleSheet, Text, View, Button, Image, TextInput } from 'react-native';

export default class Home extends React.Component {
  render() {
    return (
            <View style={styles.container}>
            <Text>Welcome, Francois</Text>
            <Button onPress={() => this.props.navigation.navigate('Activity')} title="Launch a session" />
            <Button onPress={() => this.props.navigation.navigate('Activity')} title="Consult a patient record" />
            <Button onPress={() => this.props.navigation.navigate('Activity')} title="Create a new patient profile" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
	appTitle: {
		fontSize: 30,
		fontWeight: 'bold',
	},
  container: {
		flex: 1,
		padding: 30,
		flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
