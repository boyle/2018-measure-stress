import React, { Component } from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import { Icon } from "react-native-elements";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

class IconButton extends Component {
  render() {
    const opacity = this.props.disabled ? 0.5 : 1;
    return (
      <TouchableOpacity
        disabled={this.props.disabled}
        style={[this.props.buttonStyle, { opacity: opacity }]}
        onPress={() => {
          this.props.action ? this.props.action() : null;
        }}
      >
        <View style={{ marginLeft: "auto", marginRight: "auto" }}>
          <FontAwesomeIcon
            size={100}
            icon={this.props.iconName}
            color={this.props.iconColor}
          />
          <Text
            style={[
              this.props.textStyle || { textAlign: "center" },
              { marginTop: 10 }
            ]}
          >
            {this.props.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

export default IconButton;
