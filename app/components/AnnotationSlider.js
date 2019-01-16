import React from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";
import { Slider } from "react-native-elements";

import PageTemplate from "../components/PageTemplate.js";
import Colors from "../globals/colors.js";

export default class AnnotationSlider extends React.Component {
  render() {
    return (
      <View style={{ width: this.props.width, margin: 20 }}>
        <Text style={styles.variable}>{this.props.label}</Text>
        <Slider
          maximumValue={this.props.maxIndex}
          minimumValue={this.props.minIndex}
          step={1}
          value={this.props.value}
          thumbTintColor={`${Colors.dark}`}
          onSlidingStart={value =>
            this.props.onSlideStart(this.props.domain, value)
          }
          onSlidingComplete={value =>
            this.props.onSlideComplete(this.props.domain, value)
          }
          onValueChange={value => this.props.onSlideDrag(value)}
        />
        <Text style={styles.currentState}>{this.props.valueLabel}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  variable: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center"
  },
  currentState: {
    fontSize: 14,
    textAlign: "center"
  }
});
