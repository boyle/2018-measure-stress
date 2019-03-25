import React from "react";
import { BackHandler } from "react-native";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { FileSystem } from "expo";
import { Button, Card } from "react-native-elements";
import { connect } from "react-redux";
import { initializeSession, updateSessionNotes } from "../ducks/session.js";

import { millisToHMS } from "../utils.js";
import API from "../api.js";
import PlotLegend from "../components/PlotLegend.js";
import Apps from "../globals/apps.js";
import config from "../app.json";
import Colors from "../globals/colors.js";
import PageTemplate from "../components/PageTemplate.js";
import ActivityPlot from "../components/ActivityPlot.js";

function ActivityCard(activityNumber, activity) {
  return (
    <Card>
      <Text>
        Activity #{activityNumber} - {Apps[activity.activityId].name}
      </Text>
      <Text>
        {millisToHMS(activity.startElapsedTime * 1000)} -{" "}
        {millisToHMS(activity.endElapsedTime * 1000)} (Duration:{" "}
        {(activity.endElapsedTime - activity.startElapsedTime).toFixed(1)} s)
      </Text>
    </Card>
  );
}

class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: ""
    };

    this.submitSession = this.submitSession.bind(this);
  }

  componentDidMount() {}

  async saveSessionOnDevice(session) {
    let fileName = `/p${session.patientId}s${
      session.sessionId
    }_annotations.json`;
    try {
      // If a file with the same name exists, create a new file and append the word
      // "updated"
      const existingFiles = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory
      );
      if (existingFiles.includes(fileName)) {
        fileName = fileName.replace(".json", "") + "_updated" + ".json";
      }
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + fileName,
        JSON.stringify(this.props.session)
      );
    } catch (e) {
      console.log(e);
    }
  }

  async submitSession() {
    const { patientId } = this.props.session;
    try {
      await API.putSession(this.props.session);
    } catch (e) {
      console.log(e);
      Alert.alert(
        "Internet connection unavailable",
        "The tablet could not connect to the remote server. The session data will be stored on the device and uploaded to the server once a connection is available.",
        [
          {
            text: "OK",
            onPress: () => null
          }
        ],
        { cancelable: true, onDismiss: () => {} }
      );
      this.saveSessionOnDevice(this.props.session);
    }
    this.props.navigation.navigate("Home");
    this.props.initializeSession();
  }

  render() {
    const session = this.props.session;
    return (
      <PageTemplate>
        <View style={{ marginLeft: 100, marginRight: 100 }}>
          <Text style={styles.title}>Session Summary</Text>
          <Text>Patient ID: {session.patientId}</Text>
          <Text>Date: {new Date(session.startTimestamp).toLocaleString()}</Text>
          <Text>Session ID: {session.sessionId}</Text>
          <Text>Session duration: {millisToHMS(session.duration)}</Text>

          <Text>
            Total activity time:{" "}
            {millisToHMS(
              session.activities
                .filter(act => !act.resting)
                .reduce((acc, act) => acc + act.duration, 0)
            )}{" "}
          </Text>
          <Text>
            Total resting time:{" "}
            {millisToHMS(
              session.activities
                .filter(act => act.resting)
                .reduce((acc, act) => acc + act.duration, 0)
            )}
          </Text>
          <Text>
            Number of activities:{" "}
            {session.activities.filter(act => !act.resting).length}
          </Text>
        </View>
        <ActivityPlot
          review={true}
          height={300}
          width={700}
          padding={50}
          resolution={5}
          refreshRate={10}
          sessionStart={session.startTimestamp}
          events={{
            ...session.events,
            ...session.editedEvents
          }}
          activities={[...session.activities, session.currentActivity]}
          activityStatus={this.state.activityStatus}
          toggleEditRequired={null}
          elapsedTime={session.elapsedTime}
          editEvent={() => null}
          editComment={null}
        />
        <PlotLegend />
        <Text style={styles.smallTitle}>Activities</Text>
        <View style={styles.activitiesView}>
          <ScrollView>
            {session.activities
              .filter(act => !act.resting)
              .map((act, i) => ActivityCard(i + 1, act))}
          </ScrollView>
        </View>
        <Text style={styles.smallTitle}>Session notes</Text>
        <TextInput
          multiline
          style={styles.textInput}
          value={session.sessionNotes}
          onChangeText={this.props.updateSessionNotes}
        />
        <Button
          title="Save"
          buttonStyle={styles.button}
          onPress={this.submitSession}
        />
      </PageTemplate>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: `${Colors.dark}`,
    width: "50%",
    marginLeft: "auto",
    marginRight: "auto"
  },
  title: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
    color: `${Colors.dark}`
  },
  smallTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: `${Colors.dark}`,
    margin: 20
  },
  textInput: {
    backgroundColor: "white",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: 20,
    width: "75%",
    height: 150,
    borderRadius: 8,
    borderStroke: "black",
    borderStrokeWidth: 2
  },
  activitiesView: {
    width: "75%",
    height: 100,
    marginLeft: "auto",
    marginRight: "auto"
  }
});

function mapStateToProps(state) {
  return {
    session: state.session
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateSessionNotes: notes => dispatch(updateSessionNotes(notes)),
    initializeSession: () => dispatch(initializeSession())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Summary);
