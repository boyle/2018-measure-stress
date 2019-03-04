import React, { Component } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { BarCodeScanner, Permissions } from "expo";
import { Overlay, Button } from "react-native-elements";

import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

export default class SynchronizationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasCameraPermission: null
    };
    this.onQRDetected = this.onQRDetected.bind(this);
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  onQRDetected({ type, data }) {
    const offsetInMillis = new Date().getTime() - parseInt(data);
    this.props.onOffsetComputed(offsetInMillis);
  }

  render() {
    return (
      <ModalContainer>
        <Text style={styles.title}>Please synchronize the clocks</Text>
        <Text style={{ textAlign: "center" }}>
          Scan the QR code in the computer.
        </Text>
        <View
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            height: 400,
            width: 400
          }}
        >
          <BarCodeScanner
            onBarCodeScanned={this.onQRDetected}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <Button
          buttonStyle={styles.button}
          onPress={this.props.onSkip}
          title="Skip"
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
