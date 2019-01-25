import React, { Component } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { Overlay, Button } from "react-native-elements";

import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

export default class NewPatient extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patientId: ""
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(id) {
    this.setState({ patientId: id });
  }

  render() {
    return (
      <ModalContainer>
        <Text style={styles.title}>New Patient</Text>
        <Text>
          Please enter the ID of the patient you wish to add to your profile.
        </Text>
        <TextInput
          value={this.state.patientId}
          style={styles.textInput}
          placeholder="Patient ID"
          onChangeText={text => this.setState({ patientId: text })}
          underlineColorAndroid={`${Colors.dark}`}
        />
        <Button buttonStyle={styles.button} onPress={null} title="Create" />
        <Button
          buttonStyle={styles.button}
          onPress={this.props.onCancel}
          title="Cancel"
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
