import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Slider, Icon } from "react-native-elements";

import Colors from "../globals/colors.js";
import Variables from "../globals/tracked_variables.js";

export default class EditBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      domain: props.editedEvent.domain,
      value: props.editedEvent.value,
      activeSliderStart: null
    };
  }

  render() {
    const { editedEvent } = this.props;
    return (
      <View style={styles.editBox}>
        <Slider
          maximumValue={
            Object.keys(Variables[this.state.domain].levels).length - 1
          }
          minimumValue={0}
          step={1}
          value={this.state.value}
          thumbTintColor={Variables[this.state.domain].color}
          onSlidingComplete={value => this.setState({ value })}
          onValueChange={value => this.setState({ value })}
        />
        <Text style={styles.label}>
          {Variables[this.state.domain].levels[this.state.value]}
        </Text>
        <View style={styles.buttonsContainer}>
          <Icon
            reverse
            name="check"
            type="font-awesome"
            color="green"
            onPress={() =>
              this.props.onLog({
                ...editedEvent,
                value: this.state.value
              })
            }
          />
          <Icon
            reverse
            name="trash"
            type="font-awesome"
            color="red"
            onPress={() => this.props.onDelete(editedEvent.eventId)}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  editBox: {
    width: 500,
    position: "absolute",
    backgroundColor: "white",
    zIndex: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: `${Colors.dark}`,
    top: 600,
    left: 140,
    padding: 30,
    marginLeft: "auto",
    marginRight: "auto"
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center"
  },
  label: {
    textAlign: "center"
  }
});
