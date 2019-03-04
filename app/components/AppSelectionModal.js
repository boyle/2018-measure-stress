import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  Picker
} from "react-native";
import { Overlay, Button } from "react-native-elements";

import config from "../app.json";
import Apps from "../globals/apps.js";
import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

export default class AppSelectionModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: "",
      selectedApp: 1,
      activities: Object.values(Apps)
    };

    this.handleChange = this.handleChange.bind(this);
    this.close = this.close.bind(this);
  }

  handleChange(searchString) {
    const activities = Object.values(Apps).filter(app =>
      app.name.toLowerCase().includes(searchString.toLowerCase())
    );
    this.setState({ searchString: searchString, activities });
  }

  close() {
    this.props.onClose();
  }

  render() {
    return (
      <ModalContainer>
        <Text style={styles.title}>Select an app</Text>
        <Text>Please select the app that will be used for the activity.</Text>

        <TextInput
          onChangeText={this.handleChange}
          value={this.state.searchString}
        />

        <Picker
          selectedValue={this.state.selectedApp}
          onValueChange={itemIndex => {
            this.setState({ selectedApp: itemIndex });
          }}
        >
          {this.state.activities.map((app, i) => {
            return (
              <Picker.Item key={`app-${i}`} label={`${app.name}`} value={i} />
            );
          })}
        </Picker>
        <Button
          disabled={!this.state.selectedApp}
          buttonStyle={styles.button}
          onPress={() => this.props.onAppSelected(this.state.selectedApp)}
          title="Start"
        />
        <Button
          disabled={this.state.buttonsDisabled}
          buttonStyle={styles.button}
          onPress={this.close}
          title="Cancel"
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
