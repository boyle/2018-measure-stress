import React, { Component } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { Overlay, Button } from "react-native-elements";

import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

export default class SynchronizationModal extends Component {
  render() {
    return (
      <ModalContainer>
        <Text style={styles.title}>Please synchronize the clocks</Text>
        <Text>
          Move the tablet next to the computer, launch the Java program on the
          computer and click on the button "Synchronize".
        </Text>
        <Button
          buttonStyle={styles.button}
          onPress={this.attemptSynchronization}
          title="Synchronize"
        />
        <Button
          buttonStyle={styles.button}
          onPress={this.props.onClose}
          title="Go back"
        />
      </ModalContainer>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 32,
    color: `${Colors.dark}`
  },
  textInput: {
    margin: 30
  },
  button: {
    backgroundColor: `${Colors.dark}`,
    width: "50%",
    marginTop: 20,
    marginBottom: 20,
    marginLeft: "auto",
    marginRight: "auto"
  }
});
