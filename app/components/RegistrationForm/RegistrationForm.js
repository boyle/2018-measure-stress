/*
 * RegistrationForm.js
 * Author: Francois Charih <francoischarih@sce.carleton.ca>
 *
 * Description: Form to be filled by the clinical so that a profile can be created.
 */
import React from 'react';
import { StyleSheet, Text, View, Button, Image, TextInput, Modal } from 'react-native';

export default class RegistrationForm extends React.Component {

  render() {
    return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={() => {}}
        >
          <View style={styles.container}>
            <Text>My modal</Text>
          </View>
        </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'blue',
    width: "50%",
    textAlign: 'center',
  },
});
