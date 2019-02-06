import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import {
  ACTIVITY_NOT_STARTED,
  ACTIVITY_ONGOING,
  ACTIVITY_COMPLETED,
  REST_PERIOD
} from "../globals/constants.js";

import Colors from "../globals/colors.js";

export default class ActivityTopBar extends Component {
  constructor(props) {
    super(props);
  }

  formatTime(seconds) {
    const date = new Date(null);
    date.setSeconds(seconds);
    const utc = date.toUTCString();
    return utc.substr(utc.indexOf(":") - 2, 8);
  }

  render() {
    return (
      <View>
        <Text style={styles.activityLabel}>
          {this.props.canStart
            ? "Rest period"
            : "Activity " + this.props.activityNumber}
        </Text>
        <Text style={styles.time}>Patient: {this.props.patientId}</Text>
        <Text style={styles.time}>
          Date: {new Date().toISOString().substring(0, 10)}
        </Text>
        <Text style={styles.time}>
          Time elapsed: {this.formatTime(this.props.elapsedTime)}
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            buttonStyle={[
              styles.button,
              {
                backgroundColor: `${
                  !this.props.canStart ? Colors.stopRed : Colors.playGreen
                }`
              }
            ]}
            icon={{
              color: "white",
              name: `${!this.props.canStart ? "pause" : "play-arrow"}`
            }}
            title={`${!this.props.canStart ? "Stop" : "Start"}`}
            onPress={this.props.onPressStart}
          />
          <Button
            disabled={this.props.activityStatus != ACTIVITY_COMPLETED}
            buttonStyle={styles.button}
            icon={{ color: "white", name: "edit" }}
            title="Edit"
          />
          <Button
            buttonStyle={styles.button}
            onPress={this.props.onSave}
            disabled={this.props.activityStatus === ACTIVITY_ONGOING}
            icon={{ color: "white", name: "save" }}
            title="Save"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  activityLabel: {
    fontSize: 30,
    textAlign: "center",
    fontWeight: "bold"
  },
  time: {
    textAlign: "center"
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    padding: 10,
    justifyContent: "space-around",
    zIndex: -100
  },
  button: {
    width: 100,
    height: 50,
    backgroundColor: `${Colors.dark}`
  }
});
