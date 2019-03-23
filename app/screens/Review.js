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
import { FileSystem } from "expo";
import { Button, Card } from "react-native-elements";
import { connect } from "react-redux";
import { Dropdown } from "react-native-material-dropdown";

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

class Review extends React.Component {
  constructor(props) {
    super(props);
    console.log(props.navigation.getParam("patientId"));

    this.state = {
      patientId: props.navigation.getParam("patientId") || 0,
      sessionSelectedIndex: 0,
      sessions: []
    };

    this.getSessions = this.getSessions.bind(this);

    this.session = {
      clocksOffset: null,
      editedEvents: {},
      sessionNotes: "",
      patientId: "0",
      sessionId: "100",
      firstSSQ: {
        symptoms: {
          "0": 0,
          "1": 0,
          "2": 1,
          "3": 0,
          "4": 1,
          "5": 0,
          "6": 2,
          "7": 2,
          "8": 1,
          "9": 0,
          "10": 0,
          "11": 2,
          "12": 2,
          "13": 2,
          "14": 1,
          "15": 2
        },
        timestamp: 1553299805337
      },
      startTimestamp: 1553299805354,
      currentCommonEvent: null,
      events: {
        "01": {
          valid: false,
          type: "domain_variable",
          domain: "VESTIBULAR_DOMAIN",
          value: 0,
          timestamp: 1553299805354
        },
        "02": {
          valid: false,
          type: "domain_variable",
          domain: "HYPERAROUSAL_DOMAIN",
          value: 0,
          timestamp: 1553299805354
        },
        "03": {
          valid: false,
          type: "domain_variable",
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 0,
          timestamp: 1553299805354
        },
        "04": {
          valid: false,
          type: "domain_variable",
          domain: "SENSORY_DOMAIN",
          value: 0,
          timestamp: 1553299805354
        },
        "05": {
          valid: false,
          type: "domain_variable",
          domain: "COGNITIVE_DOMAIN",
          value: 0,
          timestamp: 1553299805354
        },
        "06": {
          valid: false,
          type: "domain_variable",
          domain: "PAIN_LEVEL",
          value: 0,
          timestamp: 1553299805354
        },
        "07": {
          valid: false,
          type: "domain_variable",
          domain: "PERCEIVED_EXERTION",
          value: 0,
          timestamp: 1553299805354
        },
        "1553299809594642": {
          eventId: "1553299809594642",
          type: "domain_variable",
          timestamp: 1553299809274,
          domain: "VESTIBULAR_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1553299810399005": {
          eventId: "1553299810399005",
          type: "domain_variable",
          timestamp: 1553299810050,
          domain: "VESTIBULAR_DOMAIN",
          value: 4,
          editRequired: false
        },
        "1553299812075377": {
          eventId: "1553299812075377",
          type: "domain_variable",
          timestamp: 1553299811746,
          domain: "VESTIBULAR_DOMAIN",
          value: 0,
          editRequired: false
        },
        "1553299812953284": {
          eventId: "1553299812953284",
          type: "domain_variable",
          timestamp: 1553299812694,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1553299813894032": {
          eventId: "1553299813894032",
          type: "domain_variable",
          timestamp: 1553299813610,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 3,
          editRequired: false
        },
        "1553299815746533": {
          eventId: "1553299815746533",
          type: "domain_variable",
          timestamp: 1553299815289,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1553299817377973": {
          eventId: "1553299817377973",
          type: "domain_variable",
          timestamp: 1553299817082,
          domain: "HYPERAROUSAL_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1553299819204707": {
          eventId: "1553299819204707",
          type: "domain_variable",
          timestamp: 1553299818915,
          domain: "HYPERAROUSAL_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1553299826911579": {
          eventId: "1553299826911579",
          type: "domain_variable",
          timestamp: 1553299826546,
          domain: "HYPERAROUSAL_DOMAIN",
          value: 3,
          editRequired: false
        },
        "1553299827801109": {
          eventId: "1553299827801109",
          type: "domain_variable",
          timestamp: 1553299827441,
          domain: "HYPERAROUSAL_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1553299829355822": {
          eventId: "1553299829355822",
          type: "domain_variable",
          timestamp: 1553299828977,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 3,
          editRequired: false
        },
        "1553299830244122": {
          eventId: "1553299830244122",
          type: "domain_variable",
          timestamp: 1553299829922,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1553299840472872": {
          eventId: "1553299840472872",
          type: "domain_variable",
          timestamp: 1553299840195,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1553299834257722": {
          eventId: "1553299834257722",
          start: 1553299834257,
          type: "common_event",
          event: "Repositioning a marker",
          end: 1553299842127
        },
        "1553299845079935": {
          eventId: "1553299845079935",
          type: "domain_variable",
          timestamp: 1553299844754,
          domain: "VESTIBULAR_DOMAIN",
          value: 4,
          editRequired: false
        },
        "1553299846260675": {
          eventId: "1553299846260675",
          type: "domain_variable",
          timestamp: 1553299845893,
          domain: "VESTIBULAR_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1553299852272446": {
          eventId: "1553299852272446",
          type: "domain_variable",
          timestamp: 1553299851922,
          domain: "PAIN_LEVEL",
          value: 3,
          editRequired: false
        },
        "1553299853118182": {
          eventId: "1553299853118182",
          type: "domain_variable",
          timestamp: 1553299852816,
          domain: "PAIN_LEVEL",
          value: 0,
          editRequired: false
        },
        "1553299865865684": {
          eventId: "1553299865865684",
          type: "domain_variable",
          timestamp: 1553299865596,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 3,
          editRequired: false
        },
        "1553299867059180": {
          eventId: "1553299867059180",
          type: "domain_variable",
          timestamp: 1553299866537,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1553299869738822": {
          eventId: "1553299869738822",
          type: "domain_variable",
          timestamp: 1553299869488,
          domain: "MOTOR_SYSTEM_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1553299870659455": {
          eventId: "1553299870659455",
          type: "domain_variable",
          timestamp: 1553299870393,
          domain: "COGNITIVE_DOMAIN",
          value: 3,
          editRequired: false
        },
        "1553299871567007": {
          eventId: "1553299871567007",
          type: "domain_variable",
          timestamp: 1553299871257,
          domain: "COGNITIVE_DOMAIN",
          value: 2,
          editRequired: false
        },
        "1553299876079438": {
          eventId: "1553299876079438",
          start: 1553299876079,
          type: "common_event",
          event: "Repositioning a marker",
          end: 1553299883472
        },
        "1553299886184163": {
          eventId: "1553299886184163",
          type: "domain_variable",
          timestamp: 1553299885928,
          domain: "COGNITIVE_DOMAIN",
          value: 1,
          editRequired: false
        },
        "1553299887280529": {
          eventId: "1553299887280529",
          type: "domain_variable",
          timestamp: 1553299886984,
          domain: "COGNITIVE_DOMAIN",
          value: 0,
          editRequired: false
        }
      },
      sessionStatus: "RESTING",
      currentActivity: {
        activityId: 0,
        resting: true,
        startTimestamp: 1553299890773,
        startElapsedTime: 85.419,
        endTimestamp: null
      },
      elapsedTime: 88.328,
      endTimestamp: 1553299893760,
      duration: 88406,
      activities: [
        {
          activityId: 0,
          resting: true,
          startTimestamp: 1553299805354,
          startElapsedTime: 0,
          endTimestamp: 1553299822951,
          duration: 17597,
          endElapsedTime: 17.597
        },
        {
          activityId: 6,
          resting: false,
          startTimestamp: 1553299822951,
          startElapsedTime: 17.597,
          endTimestamp: 1553299849239,
          duration: 26288,
          endElapsedTime: 43.885
        },
        {
          activityId: 0,
          resting: true,
          startTimestamp: 1553299849239,
          startElapsedTime: 43.885,
          endTimestamp: 1553299863662,
          duration: 14423,
          endElapsedTime: 58.308
        },
        {
          activityId: 15,
          resting: false,
          startTimestamp: 1553299863662,
          startElapsedTime: 58.308,
          endTimestamp: 1553299890773,
          duration: 27111,
          endElapsedTime: 85.419
        },
        {
          activityId: 0,
          resting: true,
          startTimestamp: 1553299890773,
          startElapsedTime: 85.419,
          endTimestamp: 1553299893760,
          duration: 2987
        }
      ],
      secondSSQ: {
        symptoms: {
          "0": 0,
          "1": 1,
          "2": 0,
          "3": 1,
          "4": 0,
          "5": 2,
          "6": 1,
          "7": 0,
          "8": 0,
          "9": 2,
          "10": 1,
          "11": 0,
          "12": 1,
          "13": 1,
          "14": 2,
          "15": 2
        },
        timestamp: 1553299905673
      }
    };
  }

  componentDidMount() {
    this.getSessions();
  }

  async getSessions() {
    const sessionIds = await API.getSessionsList(this.state.patientId);
    let sessions = [];
    for (let i = 0; i < sessionIds.length; i++) {
      sessions.push(await API.getSession(this.state.patientId, sessionIds[i]));
    }
    sessions.sort((a, b) => a.startTimestamp < b.startTimestamp);
    this.setState({ sessions });
  }
  render() {
    if (this.state.sessions.length === 0)
      return (
        <PageTemplate>
          <View>
            <Button
              style={styles.button}
              title="Go home"
              onPress={() => this.props.navigation.navigate("Home")}
            />
          </View>
        </PageTemplate>
      );
    const session = this.state.sessions[this.state.sessionSelectedIndex];
    let data = this.state.sessions.map(session => {
      return { value: session.sessionId };
    });
    return (
      <PageTemplate>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ marginLeft: 100, marginRight: 100 }}>
            <Text style={styles.title}>Session Summary</Text>
            <Text>Patient ID: {session.patientId}</Text>
            <Text>Session ID: {session.sessionId}</Text>
            <Text>
              Date: {new Date(session.startTimestamp).toLocaleString()}
            </Text>
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
          <Dropdown
            containerStyle={{ width: 200 }}
            label="Session ID"
            data={data}
            value={data[this.state.sessionSelectedIndex].value}
            onChangeText={(value, index) =>
              this.setState({ sessionSelectedIndex: index })
            }
          />
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
          activityStatus={null}
          toggleEditRequired={() => null}
          elapsedTime={session.elapsedTime}
          editEvent={() => null}
          editComment={() => null}
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
          title="Close"
          buttonStyle={styles.button}
          onPress={() => this.props.navigation.navigate("Home")}
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
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Review);
