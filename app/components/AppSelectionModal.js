import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  Picker,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { Overlay, Button, Card } from "react-native-elements";

import config from "../app.json";
import Apps from "../globals/apps.js";
import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

function ActivityCard({ activity, onPress, selected }) {
  const selectedStyle = selected ? { backgroundColor: `${Colors.dark}` } : null;
  return (
    <TouchableOpacity
      style={[styles.activityButton, selectedStyle]}
      onPress={onPress}
    >
      <Text style={{ color: selected ? "white" : "black" }}>
        {activity.name}
      </Text>
    </TouchableOpacity>
  );
}

export default class AppSelectionModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: "",
      selectedApp: null,
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
          style={{
            borderWidth: 0.5,
            borderStyle: "solid",
            borderColor: `${Colors.dark}`,
            borderRadius: 8,
            marginLeft: "auto",
            marginRight: "auto",
            width: "75%",
            padding: 10,
            margin: 10
          }}
        />

        <View style={styles.activitiesView}>
          <ScrollView>
            {this.state.activities.map((activity, i) => (
              <ActivityCard
                selected={activity.id === this.state.selectedApp}
                activity={activity}
                onPress={() => this.setState({ selectedApp: activity.id })}
              />
            ))}
          </ScrollView>
        </View>
        <Button
          disabled={this.state.selectedApp === null}
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
  },
  activitiesView: {
    width: "75%",
    height: 100,
    marginLeft: "auto",
    marginRight: "auto"
  },
  activityButton: {
    width: "100%",
    backgroundColor: "white",
    padding: 10,
    margin: 5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#d6d7da"
  }
});
