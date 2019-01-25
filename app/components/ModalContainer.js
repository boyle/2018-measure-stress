import React, { Component } from "react";
import { View, StyleSheet, Text, TextInput, Modal } from "react-native";
import { Overlay, Button } from "react-native-elements";

import Colors from "../globals/colors.js";

export default class ModalContainer extends Component {
  render() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible
        onRequestClose={() => null}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flex: 1
          }}
        >
          <View
            style={{
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: `${Colors.dark}`,
              borderRadius: 8,
              width: 600,
              backgroundColor: "white",
              padding: 50
            }}
          >
            {this.props.children}
          </View>
        </View>
      </Modal>
    );
  }
}
