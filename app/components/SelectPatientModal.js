import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  Picker
} from "react-native";
import { Overlay, Button } from "react-native-elements";

import API from "../api.js";
import config from "../app.json";
import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

export default class SelectPatientModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patientsList: [],
      patientId: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.attemptCreate = this.attemptCreate.bind(this);
    this.close = this.close.bind(this);
  }

  async componentWillMount() {
    const patientsList = await API.getPatientsList();
    this.setState({ patientsList, patientId: patientsList[0] });
  }

  handleChange(id) {
    this.setState({ patientId: id });
  }

  close() {
    this.props.onClose();
  }

  attemptCreate() {
    this.setState({ success: true, buttonsDisabled: true });
    setTimeout(() => {
      this.setState({ success: false });
      this.close();
    }, 1000);
  }

  render() {
    return (
      <ModalContainer>
        <Text style={styles.title}>Select a patient</Text>
        <Text>Please select the patient who is undergoing therapy today.</Text>

        <Picker
          selectedValue={this.state.patientId}
          onValueChange={(itemValue, itemIndex) =>
            this.setState({ patientId: itemValue })
          }
        >
          {this.state.patientsList.map((id, i) => (
            <Picker.Item
              key={`patient-${i}`}
              label={`Patient ${id}`}
              value={id}
            />
          ))}
        </Picker>

        <Button
          disabled={!this.state.patientId}
          buttonStyle={styles.button}
          onPress={() => this.props.onPatientSelected(this.state.patientId)}
          title="Select"
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
