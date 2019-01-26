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

import { showModal, hideModal } from "../ducks/ui.js";
import Colors from "../globals/colors.js";
import PageTemplate from "../components/PageTemplate.js";
import IconButton from "../components/IconButton.js";
import NewPatient from "../components/NewPatient.js";

function StatsCard({ statsName, statsValue }) {
  return (
    <Card style={styles.statsContainer}>
      <Text style={styles.statsValue}>0</Text>
      <Text style={styles.stateName}>{statsName}</Text>
    </Card>
  );
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayNewPatientOverlay: false
    };
  }
  render() {
    const iconHeight = 140;
    const iconWidth = 140;
    const iconColor = `${Colors.lighter}`;
    return (
      <PageTemplate>
        <View style={styles.container}>
          {this.state.displayNewPatientOverlay && (
            <NewPatient
              onSave={() => null}
              onCancel={() =>
                this.setState({ displayNewPatientOverlay: false })
              }
            />
          )}
          <Text style={styles.title}>Welcome, Francois!</Text>
          <Text>Here are some stats:</Text>
          <View style={styles.statsContainer}>
            <StatsCard statsName="Minutes" />
            <StatsCard statsName="Sessions" />
            <StatsCard statsName="Patients" />
          </View>

          <View style={styles.buttonsContainer}>
            <IconButton
              iconName="face"
              iconColor={iconColor}
              title="New Patient"
              buttonStyle={styles.button}
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              textStyle={styles.buttonTitle}
              action={() => this.setState({ displayNewPatientOverlay: true })}
            />
            <IconButton
              iconName="create"
              iconColor={iconColor}
              title="New Session"
              buttonStyle={styles.button}
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              textStyle={styles.buttonTitle}
              action={() => this.props.navigation.navigate("SSQ")}
            />
            <IconButton
              iconName="description"
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
              iconName="build"
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
              iconName="info"
              iconColor={iconColor}
              title="Help"
              buttonStyle={styles.button}
              iconHeight={iconHeight}
              iconWidth={iconWidth}
              textStyle={styles.buttonTitle}
              action={() => this.props.navigation.navigate("Activity")}
            />
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
    hideModal: () => dispatch(hideModal())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
