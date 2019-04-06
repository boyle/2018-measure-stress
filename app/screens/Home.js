import React from "react";
import { BackHandler } from "react-native";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Button, Card } from "react-native-elements";
import { connect } from "react-redux";
import { withNavigationFocus } from "react-navigation";

import { FileSystem } from "expo";
import app from "../app.json";
import API from "../api.js";
import { showModal, hideModal } from "../ducks/ui.js";
import { addPatient } from "../ducks/user.js";
import {
  startSession,
  selectPatient,
  setOffset,
  setSessionId
} from "../ducks/session.js";
import Colors from "../globals/colors.js";
import PageTemplate from "../components/PageTemplate.js";
import IconButton from "../components/IconButton.js";
import NewPatientModal from "../components/NewPatientModal.js";
import InitializeSessionModal from "../components/InitializeSessionModal.js";
import SelectPatientModal from "../components/SelectPatientModal.js";
import SynchronizationModal from "../components/SynchronizationModal.js";

function StatsCard({ statsName, statsValue }) {
  return (
    <Card style={styles.card}>
      {!statsValue && <ActivityIndicator size="large" />}
      {statsValue && <Text style={styles.statsValue}>{statsValue}</Text>}
      <Text style={styles.stateName}>{statsName}</Text>
    </Card>
  );
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numPatients: null,
      numSessions: null,
      numLocalFiles: null
    };

    this.onPatientSelected = this.onPatientSelected.bind(this);
    this.pushLocalFiles = this.pushLocalFiles.bind(this);
    this.countLocalFiles = this.countLocalFiles.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    this.focusListener = this.props.navigation.addListener(
      "didFocus",
      this.refresh
    );
  }

  async pushLocalFiles() {
    const localFiles = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory
    );
    for (let i = 0; i < localFiles.length; i++) {
      let fileUrl = `${FileSystem.documentDirectory}/${localFiles[i]}`;
      try {
        let content = JSON.parse(await FileSystem.readAsStringAsync(fileUrl));
        await API.putSession(content);
        await FileSystem.deleteAsync(fileUrl);
      } catch (e) {
        console.log(e);
      }
      this.refresh();
    }
  }

  async countLocalFiles() {
    const numLocalFiles = (await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory
    )).length;
    this.setState({ numLocalFiles: `${numLocalFiles}` });
  }

  async refresh() {
    this.countLocalFiles();

    const patients = await API.getPatientsList();
    let numSessions = 0;
    for (let i = 0; i < patients.length; i++) {
      // need to use explicit for loop because of await
      numSessions += (await API.getSessionsList(patients[i])).length;
    }
    this.setState({ numPatients: patients.length, numSessions });
  }

  onPatientSelected(patientId, sessionId) {
    this.props.hideModal();
    this.props.selectPatient(patientId);
    this.props.setSessionId(sessionId);
    this.props.startSession(patientId);
    this.props.navigation.navigate("SSQ");
  }

  render() {
    const iconHeight = 140;
    const iconWidth = 140;
    const iconColor = `${Colors.lighter}`;
    return (
      <PageTemplate>
        <View style={styles.container}>
          {this.props.ui.modal.modalName === "NewPatientModal" && (
            <NewPatientModal
              onSave={this.refreshStats}
              onClose={this.props.hideModal}
            />
          )}
          {this.props.ui.modal.modalName === "SynchronizationModal" && (
            <SynchronizationModal
              onOffsetComputed={offset => {
                this.props.setOffset(offset);
                this.props.showModal("InitializeSessionModal");
              }}
              onSkip={() => this.props.showModal("InitializeSessionModal")}
              onClose={this.props.hideModal}
            />
          )}
          {this.props.ui.modal.modalName === "InitializeSessionModal" && (
            <InitializeSessionModal
              onPatientSelected={this.onPatientSelected}
              onClose={this.props.hideModal}
            />
          )}
          {this.props.ui.modal.modalName === "SelectPatientModal" && (
            <SelectPatientModal
              onPatientSelected={patientId => {
                this.props.hideModal();
                this.props.navigation.navigate("Review", { patientId });
              }}
              onClose={this.props.hideModal}
            />
          )}
          <Text style={styles.title}>Hi, {this.props.user.username}!</Text>
          <View style={styles.statsBox}>
            <Text style={styles.title}>Project Progress</Text>
            <View style={styles.statsContainer}>
              <StatsCard
                statsName="Sessions"
                statsValue={this.state.numSessions}
              />
              <StatsCard
                statsName="Patients"
                statsValue={this.state.numPatients}
              />
              <StatsCard
                statsName="Files on device"
                statsValue={this.state.numLocalFiles}
              />
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <IconButton
              iconName="user"
              iconColor={iconColor}
              title="New Patient"
              buttonStyle={styles.button}
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              textStyle={styles.buttonTitle}
              action={() => this.props.showModal("NewPatientModal")}
            />
            <IconButton
              iconName="plus-circle"
              iconColor={iconColor}
              title="New Session"
              buttonStyle={styles.button}
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              textStyle={styles.buttonTitle}
              action={() => this.props.showModal("SynchronizationModal")}
            />
            <IconButton
              iconName="search"
              iconColor={iconColor}
              title="Review"
              buttonStyle={styles.button}
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              textStyle={styles.buttonTitle}
              action={() => this.props.showModal("SelectPatientModal")}
            />
            {/*
            <IconButton
              disabled
              iconName="file-alt"
              iconColor={iconColor}
              title="Review"
              buttonStyle={styles.button}
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              textStyle={styles.buttonTitle}
              action={() => this.props.navigation.navigate("Activity")}
            />
            <IconButton
              disabled
              iconName="cogs"
              iconColor={iconColor}
              title="Settings"
              buttonStyle={styles.button}
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              textStyle={styles.buttonTitle}
              action={() => this.props.navigation.navigate("Activity")}
            />
            <IconButton
              disabled
              iconName="info-circle"
              iconColor={iconColor}
              title="Help"
              buttonStyle={styles.button}
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              textStyle={styles.buttonTitle}
              action={() => this.props.navigation.navigate("Activity")}
						/> */}
            <IconButton
              iconName="lock"
              iconColor={iconColor}
              title="Log Out"
              buttonStyle={styles.button}
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              textStyle={styles.buttonTitle}
              action={() => this.props.navigation.navigate("Login")}
            />
          </View>
        </View>
        <Text style={styles.version}>Version {app.expo.version}</Text>
      </PageTemplate>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
    color: `${Colors.dark}`
  },
  container: {
    flex: 1,
    padding: 30,
    flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around"
  },
  statsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around"
  },
  card: {
    height: 300,
    width: 300
  },
  button: {
    margin: 10,
    width: 200,
    height: 200,
    backgroundColor: `${Colors.dark}`,
    padding: 30,
    borderRadius: 8
  },
  buttonIcon: {
    width: 150,
    height: 150
  },
  buttonTitle: {
    textAlign: "center",
    color: "white",
    fontSize: 24
  },
  buttonsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  statsValue: {
    textAlign: "center",
    fontSize: 42,
    fontWeight: "bold",
    color: `${Colors.dark}`
  },
  statsName: {
    textAlign: "center",
    fontSize: 32
  },
  statsBox: {
    width: "75%",
    padding: 20,
    borderWidth: 2,
    stroke: `${Colors.dark}`,
    borderRadius: 8
  },
  version: {
    textAlign: "center",
    margin: 10
  }
});

function mapStateToProps(state) {
  return {
    user: state.user,
    ui: state.ui
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showModal: modalName => dispatch(showModal(modalName)),
    hideModal: () => dispatch(hideModal()),
    addPatient: patientId => dispatch(addPatient(patientId)),
    selectPatient: patientId => dispatch(selectPatient(patientId)),
    startSession: patientId => dispatch(startSession(patientId)),
    setOffset: offset => dispatch(setOffset(offset)),
    setSessionId: sessionId => dispatch(setSessionId(sessionId))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
