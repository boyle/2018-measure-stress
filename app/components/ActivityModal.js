import React, { Component } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { Overlay, Button } from "react-native-elements";
import {
  ACTIVITY_NOT_STARTED,
  ACTIVITY_ONGOING,
  ACTIVITY_COMPLETED
} from "../globals/constants.js";

import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

export default class ActivityModal extends Component {
  render() {
    return (
      <ModalContainer>
        <Text style={styles.title}>What next?</Text>
        <Text>
          Should we move on to another activity or go to the post-session SSQ.
        </Text>
        {this.props.activityStatus === ACTIVITY_COMPLETED && (
          <Button
            buttonStyle={styles.button}
            onPress={this.props.onNextActivity}
            title="Next activity"
          />
        )}
        <Button
          buttonStyle={styles.button}
          onPress={this.props.onSSQ}
          title="End session"
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
