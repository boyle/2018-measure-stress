import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import {
  ACTIVITY_NOT_STARTED,
  ACTIVITY_ONGOING,
  ACTIVITY_COMPLETED
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
          Activity {this.props.activityNumber}
        </Text>
        <Text style={styles.time}>
          Time elapsed: {this.formatTime(this.props.elapsedTime)}
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            raised
            disabled={this.props.activityStatus === ACTIVITY_COMPLETED}
            buttonStyle={styles.button}
            icon={{
              name: `${
                this.props.activityStatus === ACTIVITY_ONGOING
                  ? "pause"
                  : "play-arrow"
              }`
            }}
            backgroundColor={`${
              this.props.activityStatus === ACTIVITY_ONGOING
                ? Colors.stopRed
                : Colors.playGreen
            }`}
            title={`${
              this.props.activityStatus === ACTIVITY_ONGOING ? "Stop" : "Start"
            }`}
            onPress={this.props.onPressStart}
          />
          <Button
            raised
            disabled={this.props.activityStatus != ACTIVITY_COMPLETED}
            buttonStyle={styles.button}
            icon={{ name: "play-arrow" }}
            title="Edit"
          />
          <Button
            raised
            disabled={this.props.activityStatus != ACTIVITY_COMPLETED}
            buttonStyle={styles.button}
            icon={{ name: "play-arrow" }}
            title="Next"
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
    justifyContent: "space-around"
  },
  button: {
    width: 100,
    height: 50
  }
});
