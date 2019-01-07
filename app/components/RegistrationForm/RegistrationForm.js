import React from 'react';
import { StyleSheet, Text, View, Button, Image, TextInput, Modal, Dimensions } from 'react-native';

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
            <Text style={styles.title}>Registration</Text>
          </View>
        </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 36,
    textAlign: 'center',
    color: 'red'
  },
  container: {
    marginTop: Dimensions.get('window').height/10,
    marginBottom: Dimensions.get('window').height/10,
    marginLeft: Dimensions.get('window').width/8,
    marginRight: Dimensions.get('window').width/8,
    height: (Dimensions.get('window').height -  2*Dimensions.get('window').height/10),
    padding: 20,
    color: 'red',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'gray',
    textAlign: 'center',
    borderWidth: 3,
    borderRadius: 8,
  },
});
