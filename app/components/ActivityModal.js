import React, { Component } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { Overlay, Button } from "react-native-elements";

import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

export default class ActivityModal extends Component {
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
        <Text style={styles.title}>What next?</Text>
        <Text>
          Should we move on to another activity or go to the post-session SSQ.
        </Text>
        <Button
          buttonStyle={styles.button}
          onPress={this.props.onNextActivity}
          title="Next activity"
        />
        <Button
          buttonStyle={styles.button}
          onPress={this.props.onSSQ}
          title="Go to SSQ"
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
