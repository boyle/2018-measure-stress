import React from 'react';
/*
 * RegistrationForm.js
 * Author: Francois Charih <francoischarih@sce.carleton.ca>
 *
 * Description: Form to be filled by the clinical so that a profile can be created.
 */
import { StyleSheet, Text, View, Button, Image, TextInput } from 'react-native';

export default class RegistrationForm extends React.Component {

  render() {
    return (
      <View style={styles.container}>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    padding: 0,
  },
});
