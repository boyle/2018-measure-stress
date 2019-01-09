import React from "react";
import { StyleSheet, View } from "react-native";
import Colors from "../../styles/colors.js";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.topBar} />
        <View style={styles.contentContainer}>{this.props.children}</View>
        <View style={styles.bottomBar} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  topBar: {
    height: 40,
    width: "100%",
    backgroundColor: `${Colors.dark}`
  },
  bottomBar: {
    height: 80,
    width: "100%",
    backgroundColor: `${Colors.dark}`
  },
  contentContainer: {
    flex: 1
  }
});
