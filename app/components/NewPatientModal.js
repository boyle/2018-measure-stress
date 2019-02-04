import React, { Component } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { Overlay, Button } from "react-native-elements";

import config from "../app.json";
import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

export default class NewPatientModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patientId: "",
      success: false,
      failure: false,
      buttonsDisabled: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.attemptCreate = this.attemptCreate.bind(this);
    this.close = this.close.bind(this);
  }

  handleChange(id) {
    this.setState({ patientId: id });
  }

  close() {
    this.props.onClose();
  }

  attemptCreate() {
    fetch(`${config.host}/api/v1/p/${this.state.patientId}`, {
      credentials: "same-origin",
      method: "PUT"
    })
      .then(data => data.text())
      .then(text => {
        this.setState({ success: true, buttonsDisabled: true });
        setTimeout(() => {
          this.setState({ success: false });
          this.close();
        }, 1000);
      })
      .catch(err => {
        console.log("error");
        // TODO handle
      });
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
        <Text
          style={{
            textAlign: "center",
            color: `${this.state.success ? "green" : "red"}`
          }}
        >
          {this.state.success && "Patient profile created."}
          {this.state.failure && "Could not save patient."}
        </Text>
        <Button
          disabled={this.state.buttonsDisabled}
          buttonStyle={styles.button}
          onPress={this.attemptCreate}
          title="Create"
        />
        <Button
          disabled={this.state.buttonsDisabled}
          buttonStyle={styles.button}
          onPress={this.close}
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
