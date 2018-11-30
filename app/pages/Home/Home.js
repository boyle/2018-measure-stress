import React from 'react';
/*
 * Home.js
 * Author: Francois Charih <francoischarih@sce.carleton.ca>
 *
 * Description: Home page show upon login.
 */
import { StyleSheet, Text, View, Button, Image, TextInput } from 'react-native';
import { connect } from 'react-redux';

class Home extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Welcome, {this.props.user.name}</Text>
        <Button
          onPress={() => this.props.navigation.navigate('Activity')}
          title="Launch a session"
        />
        <Button
          onPress={() => this.props.navigation.navigate('Activity')}
          title="Consult a patient record"
        />
        <Button
          onPress={() => this.props.navigation.navigate('Activity')}
          title="Create a new patient profile"
        />
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

function mapStateToProps(state) {
  return {
    user: state.user,
  }
}

export default connect(mapStateToProps, null)(Home);
