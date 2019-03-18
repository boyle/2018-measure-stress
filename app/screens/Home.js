import React from "react";
import { BackHandler } from "react-native";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity
} from "react-native";
import { Button, Card } from "react-native-elements";
import { connect } from "react-redux";
import { withNavigationFocus } from "react-navigation";

import API from "../api.js";
import { showModal, hideModal } from "../ducks/ui.js";
import { addPatient } from "../ducks/user.js";
import { startSession, selectPatient, setOffset } from "../ducks/session.js";
import Colors from "../globals/colors.js";
import PageTemplate from "../components/PageTemplate.js";
import IconButton from "../components/IconButton.js";
import NewPatientModal from "../components/NewPatientModal.js";
import SelectPatientModal from "../components/SelectPatientModal.js";
import SynchronizationModal from "../components/SynchronizationModal.js";

function StatsCard({ statsName, statsValue }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.statsValue}>{statsValue}</Text>
      <Text style={styles.stateName}>{statsName}</Text>
    </Card>
  );
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numPatients: 0,
      numSessions: 0
    };

    this.onPatientSelected = this.onPatientSelected.bind(this);
    this.refreshStats = this.refreshStats.bind(this);
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener(
      "didFocus",
      this.refreshStats
    );
  }

  async refreshStats() {
    const patients = await API.getPatientsList();
    let numSessions = 0;
    for (let i = 0; i < patients.length; i++) {
      // need to use explicit for loop because of await
      numSessions += (await API.getSessionsList(patients[i])).length;
    }
    this.setState({ numPatients: patients.length, numSessions });
  }

  onPatientSelected(patientId) {
    this.props.hideModal();
    this.props.selectPatient(patientId);
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
                this.props.showModal("SelectPatientModal");
              }}
              onSkip={() => this.props.showModal("SelectPatientModal")}
              onClose={this.props.hideModal}
            />
          )}
          {this.props.ui.modal.modalName === "SelectPatientModal" && (
            <SelectPatientModal
              patientIdsList={this.props.user.patientIdsList}
              onPatientSelected={this.onPatientSelected}
              onClose={this.props.hideModal}
            />
          )}
          <Text style={styles.title}>
            Hi there! Ready to acquire some data?!
          </Text>
          <Text>Here are some stats:</Text>
          <View style={styles.statsContainer}>
            <StatsCard
              statsName="Sessions"
              statsValue={this.state.numSessions}
            />
            <StatsCard
              statsName="Patients"
              statsValue={this.state.numPatients}
            />
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
      </PageTemplate>
    );
  }
}

const styles = StyleSheet.create({
  title: {
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
    justifyContent: "space-between",
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
    setOffset: offset => dispatch(setOffset(offset))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
