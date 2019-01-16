import React, { Component } from "react";
import { Image, TouchableOpacity, Text } from "react-native";
import { Icon } from "react-native-elements";

class IconButton extends Component {
  render() {
    return (
      <TouchableOpacity
        style={this.props.buttonStyle}
        onPress={() => {
          this.props.action ? this.props.action() : null;
        }}
      >
        <Icon
          name={this.props.iconName}
          size={100}
          color={this.props.iconColor}
        />
        <Text style={this.props.textStyle}>{this.props.title}</Text>
      </TouchableOpacity>
    );
  }
}

export default IconButton;
