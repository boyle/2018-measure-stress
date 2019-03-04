import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";

import Colors from "../globals/colors.js";
import IconButton from "../components/IconButton.js";
import CommonEventsList from "../globals/common_events.js";

export default class CommonEvents extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const iconHeight = 140;
    const iconWidth = 140;
    const iconColor = `${Colors.lighter}`;
    return (
      <View style={styles.container}>
        {CommonEventsList.map(event => (
          <IconButton
            type="font-awesome"
            iconName={event.icon}
            iconColor={event.color}
            title={event.label}
            buttonStyle={styles.button}
            iconHeight={iconHeight}
            iconWidth={iconWidth}
            textStyle={styles.buttonTitle}
            action={() => this.props.onLog(event.label)}
          />
        ))}
        <IconButton
          type="font-awesome"
          iconName="times-circle"
          iconColor="red"
          title="Close"
          buttonStyle={styles.button}
          iconHeight={iconHeight}
          iconWidth={iconWidth}
          textStyle={styles.buttonTitle}
          action={this.props.onQuit}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 25,
    justifyContent: "center"
  },
  button: {
    margin: 10,
    width: 200,
    height: 200,
    backgroundColor: `white`,
    borderColor: `${Colors.dark}`,
    borderWidth: 2,
    padding: 30,
    borderRadius: 8
  }
});
