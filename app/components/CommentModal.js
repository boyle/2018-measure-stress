import React, { Component } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { Overlay, Button, CheckBox } from "react-native-elements";

import { generateRandomNum } from "../utils.js";

import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

const CLINICIAN = 'CLINICIAN';
const PATIENT = 'PATIENT';

export default class CommentModal extends Component {
  constructor(props) {
    super(props);
      this.state = {
        commentId: generateRandomNum(),
        elapsedTime: this.props.getElapsedTime(),
        reportedBy: CLINICIAN,
        comment: "",
    };

    this.close = this.close.bind(this);
  }

  close() {
    this.props.onClose();
  }

  render() {
    return (
      <ModalContainer>
        <Text style={styles.title}>Comment</Text>
        <Text>
          You may enter a note for an other observation or patient-reported symptom.
            </Text>
            <CheckBox
                title="Clinician-reported comment"
                onPress={() => this.setState({ reportedBy: CLINICIAN })}
        checked={this.state.reportedBy === CLINICIAN}
        checkedIcon='dot-circle-o'
        uncheckedIcon='circle-o'
        uncheckedColor={`${Colors.dark}`}
        checkedColor={`${Colors.dark}`}
            />
            <CheckBox
                title="Patient-reported comment"
                onPress={() => this.setState({ reportedBy: PATIENT })}
        checked={this.state.reportedBy === PATIENT}
        checkedIcon='dot-circle-o'
        uncheckedIcon='circle-o'
        uncheckedColor={`${Colors.dark}`}
        checkedColor={`${Colors.dark}`}
            />
            <View style={{
                backgroundColor: this.state.text,
                borderColor: '#000000',
                borderWidth: 1,
                height: 200
             }}
            >
            <TextInput
        multiline = {true}
        numberOfLines = {20}
        onChangeText={(text) => this.setState({comment: text})}
        value={this.state.comment}
            />
            </View>
            
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
        <Button
          disabled={this.state.buttonsDisabled}
          buttonStyle={styles.button}
        onPress={() => {this.props.logComment(this.state); this.props.onClose()}}
          title="Save"
        />
        <Button
          disabled={this.state.buttonsDisabled}
          buttonStyle={styles.button}
          onPress={this.close}
          title="Close"
            />
            </View>
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
