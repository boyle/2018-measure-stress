import React from "react";
import { BackHandler } from "react-native";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { Button, Card } from "react-native-elements";
import { connect } from "react-redux";
import { setSessionId, updateSessionNotes } from "../ducks/session.js";

import { millisToHMS } from "../utils.js";
import API from "../api.js";
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
    this.session = {
      clocksOffset: null,
      editedEvents: {},
      patientId: "826",
      firstSSQ: {
        symptoms: {
          "0": 0,
          "1": 1,
          "2": 0,
          "3": 1,
          "4": 2,
          "5": 2,
          "6": 1,
          "7": 0,
          "8": 0,
          "9": 0,
          "10": 0,
          "11": 1,
          "12": 0,
          "13": 2,
          "14": 2,
          "15": 2
        },
        timestamp: 1552934758349
      },
      startTimestamp: 1552934758365,
      currentCommonEvent: null,
      events: {
        "01": {
          valid: false,
          type: "domain_variable",
          domain: "VESTIBULAR_DOMAIN",
          value: 0,
          timestamp: 1552934758365
        },
        "02": {
          valid: false,
          type: "domain_variable",
          domain: "HYPERAROUSAL_DOMAIN",
          value: 0,
          timestamp: 1552934758365
        },
        "03": {
          valid: false,
          type: "domain_variable",
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 0,
          timestamp: 1552934758365
        },
        "04": {
          valid: false,
          type: "domain_variable",
          domain: "SENSORY_DOMAIN",
          value: 0,
          timestamp: 1552934758365
        },
        "05": {
          valid: false,
          type: "domain_variable",
          domain: "COGNITIVE_DOMAIN",
          value: 0,
          timestamp: 1552934758365
        },
        "06": {
          valid: false,
          type: "domain_variable",
          domain: "PAIN_LEVEL",
          value: 0,
          timestamp: 1552934758365
        },
        "07": {
          valid: false,
          type: "domain_variable",
          domain: "PERCEIVED_EXERTION",
          value: 0,
          timestamp: 1552934758365
        },
        "1552934762079786": {
          eventId: "1552934762079786",
          type: "domain_variable",
          timestamp: 1552934761734,
          domain: "VESTIBULAR_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1552934763508529": {
          eventId: "1552934763508529",
          type: "domain_variable",
          timestamp: 1552934763202,
          domain: "HYPERAROUSAL_DOMAIN",
          value: 3,
          editRequired: false
        },
        "1552934764115494": {
          eventId: "1552934764115494",
          type: "domain_variable",
          timestamp: 1552934763878,
          domain: "HYPERAROUSAL_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1552934769130717": {
          eventId: "1552934769130717",
          type: "domain_variable",
          timestamp: 1552934768882,
          domain: "VESTIBULAR_DOMAIN",
          value: 5,
          editRequired: false
        },
        "1552934769812405": {
          eventId: "1552934769812405",
          type: "domain_variable",
          timestamp: 1552934769562,
          domain: "VESTIBULAR_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1552934770757399": {
          eventId: "1552934770757399",
          type: "domain_variable",
          timestamp: 1552934770436,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1552934771412977": {
          eventId: "1552934771412977",
          type: "domain_variable",
          timestamp: 1552934771197,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1552934772720279": {
          eventId: "1552934772720279",
          type: "domain_variable",
          timestamp: 1552934772225,
          domain: "SENSORY_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1552934773853693": {
          eventId: "1552934773853693",
          type: "domain_variable",
          timestamp: 1552934773492,
          domain: "PAIN_LEVEL",
          value: 6,
          editRequired: false
        },
        "1552934774693751": {
          eventId: "1552934774693751",
          type: "domain_variable",
          timestamp: 1552934774295,
          domain: "PAIN_LEVEL",
          value: 2,
          editRequired: false
        },
        "1552934778585000": {
          eventId: "1552934778585000",
          type: "domain_variable",
          timestamp: 1552934778289,
          domain: "VESTIBULAR_DOMAIN",
          value: 4,
          editRequired: false
        },
        "1552934779850148": {
          eventId: "1552934779850148",
          type: "domain_variable",
          timestamp: 1552934779177,
          domain: "VESTIBULAR_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1552934784491323": {
          eventId: "1552934784491323",
          type: "domain_variable",
          timestamp: 1552934780602,
          domain: "VESTIBULAR_DOMAIN",
          value: 8,
          editRequired: false
        },
        "1552934790726579": {
          eventId: "1552934790726579",
          type: "domain_variable",
          timestamp: 1552934787254,
          domain: "COGNITIVE_DOMAIN",
          value: 3,
          editRequired: false
        },
        "1552934793060378": {
          eventId: "1552934793060378",
          type: "domain_variable",
          timestamp: 1552934792752,
          domain: "COGNITIVE_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1552934798526950": {
          eventId: "1552934798526950",
          type: "domain_variable",
          timestamp: 1552934797709,
          domain: "VESTIBULAR_DOMAIN",
          value: 5,
          editRequired: false
        },
        "1552934799201919": {
          eventId: "1552934799201919",
          type: "domain_variable",
          timestamp: 1552934798909,
          domain: "VESTIBULAR_DOMAIN",
          value: 3,
          editRequired: false
        },
        "1552934801290905": {
          eventId: "1552934801290905",
          type: "domain_variable",
          timestamp: 1552934801039,
          domain: "COGNITIVE_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1552934806784047": {
          eventId: "1552934806784047",
          start: 1552934806784,
          type: "common_event",
          event: "Patient sitting",
          stop: 1552934816482
        },
        "1552934821517551": {
          eventId: "1552934821517551",
          type: "domain_variable",
          timestamp: 1552934821325,
          domain: "VESTIBULAR_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1552934822066962": {
          eventId: "1552934822066962",
          type: "domain_variable",
          timestamp: 1552934821785,
          domain: "VESTIBULAR_DOMAIN",
          value: 5,
          editRequired: false
        },
        "1552934823121042": {
          eventId: "1552934823121042",
          type: "domain_variable",
          timestamp: 1552934822873,
          domain: "HYPERAROUSAL_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1552934825209905": {
          eventId: "1552934825209905",
          type: "domain_variable",
          timestamp: 1552934824920,
          domain: "SENSORY_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1552934825867786": {
          eventId: "1552934825867786",
          type: "domain_variable",
          timestamp: 1552934825625,
          domain: "SENSORY_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1552934827289094": {
          eventId: "1552934827289094",
          type: "domain_variable",
          timestamp: 1552934826975,
          domain: "COGNITIVE_DOMAIN",
          value: 3,
          editRequired: false
        },
        "1552934827986145": {
          eventId: "1552934827986145",
          type: "domain_variable",
          timestamp: 1552934827718,
          domain: "COGNITIVE_DOMAIN",
          value: 1,
          editRequired: false
        }
      },
      sessionStatus: "RESTING",
      currentActivity: {
        activityId: 0,
        resting: true,
        startTimestamp: 1552934830293,
        startElapsedTime: 71.928,
        endTimestamp: null
      },
      elapsedTime: 75.471,
      endTimestamp: 1552934833957,
      duration: 75592,
      activities: [
        {
          activityId: 0,
          resting: true,
          startTimestamp: 1552934758365,
          startElapsedTime: 0,
          endTimestamp: 1552934767694,
          duration: 9329,
          endElapsedTime: 9.329
        },
        {
          activityId: 9,
          resting: false,
          startTimestamp: 1552934767694,
          startElapsedTime: 9.329,
          endTimestamp: 1552934795245,
          duration: 27551,
          endElapsedTime: 36.88
        },
        {
          activityId: 0,
          resting: true,
          startTimestamp: 1552934795246,
          startElapsedTime: 36.881,
          endTimestamp: 1552934820352,
          duration: 25106,
          endElapsedTime: 61.987
        },
        {
          activityId: 7,
          resting: false,
          startTimestamp: 1552934820352,
          startElapsedTime: 61.987,
          endTimestamp: 1552934830293,
          duration: 9941,
          endElapsedTime: 71.928
        },
        {
          activityId: 0,
          resting: true,
          startTimestamp: 1552934830293,
          startElapsedTime: 71.928,
          endTimestamp: 1552934833957,
          duration: 3664
        }
      ],
      secondSSQ: {
        symptoms: {
          "0": 0,
          "1": 1,
          "2": 0,
          "3": 1,
          "4": 1,
          "5": 2,
          "6": 1,
          "7": 0,
          "8": 2,
          "9": 0,
          "10": 1,
          "11": 1,
          "12": 0,
          "13": 2,
          "14": 2,
          "15": 1
        },
        timestamp: 1552934848814
      },
      sessionId: 2
    };
  }

  componentDidMount() {}

  async submitSession() {
    const { patientId } = this.props.session;
    const sessionId = await API.getSessionId(patientId);
    this.props.setSessionId(sessionId);
    try {
      await API.putSession(patientId, this.props.session);
    } catch (e) {
      console.log(e);
    }
    this.props.navigation.navigate("Home");
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
          toggleEditRequired={this.props.toggleEditRequired}
          elapsedTime={session.elapsedTime}
          editEvent={this.props.editEvent}
          editComment={this.props.editComment}
        />
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
    height: 200,
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
    setSessionId: id => dispatch(setSessionId(id)),
    updateSessionNotes: notes => dispatch(updateSessionNotes(notes))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Summary);
