import React from "react";
import { BackHandler, ToastAndroid } from "react-native";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView
} from "react-native";
import { Button, Card, ButtonGroup, CheckBox } from "react-native-elements";
import { connect } from "react-redux";

import { saveSSQ } from "../ducks/session.js";
import Colors from "../globals/colors.js";
import PageTemplate from "../components/PageTemplate.js";
import SSQVars from "../globals/ssq.js";

const buttonColor = {
  0: "green",
  1: "yellow",
  2: "orange",
  3: "red"
};

class SSQ extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...SSQVars.emptySSQForm };

    this.saveForm = this.saveForm.bind(this);
    this.formIsFilled = this.formIsFilled.bind(this);
    this.isFirstSSQ = this.isFirstSSQ.bind(this);
  }

  isFirstSSQ() {
    return !this.props.session.firstSSQ;
  }

  formIsFilled() {
    const allQuestionsAnswered = Object.values(this.state.symptoms).every(
      answer => answer != null
    );

    return allQuestionsAnswered;
  }

  saveForm() {
    const submittedForm = {
      ...this.state,
      timestamp: new Date().toISOString()
    };
    this.props.saveSSQ(submittedForm);

    ToastAndroid.showWithGravity(
      "Saved the SSQ.",
      ToastAndroid.LONG,
      ToastAndroid.CENTER
    );

    this.setState({ ...SSQVars.emptySSQForm });
    this.props.navigation.navigate("Activity");
  }

  render() {
    return (
      <PageTemplate>
        <Text style={styles.title}>Simulation Sickness Questionnaire</Text>
        <Text style={styles.sessionLabel}>
          {this.isFirstSSQ() ? "Pre" : "Post"}-session
        </Text>
        <View style={styles.cardsContainer}>
          <ScrollView>
            {SSQVars.symptoms.map((symptom, i) => (
              <Card key={`symptom-${i}`}>
                <Text style={styles.symptom}>{symptom.label}</Text>
                <ButtonGroup
                  onPress={index =>
                    this.setState({
                      symptoms: {
                        ...this.state.symptoms,
                        [symptom.index]: index
                      }
                    })
                  }
                  selectedIndex={this.state.symptoms[symptom.index]}
                  selectedButtonStyle={{
                    backgroundColor: `${buttonColor[
                      this.state.symptoms[symptom.index]
                    ] || "white"}`
                  }}
                  buttons={["None", "Slight", "Moderate", "Severe"]}
                  containerStyle={{ height: 50 }}
                />
              </Card>
            ))}
          </ScrollView>
        </View>
        <Button
          title="Save"
          disabled={!this.formIsFilled()}
          onPress={() => this.saveForm()}
        />
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
  cardsContainer: {
    height: "80%"
  },
  statsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around"
  },
  symptom: {
    fontSize: 18,
    fontWeight: "bold",
    color: `${Colors.dark}`,
    textAlign: "center"
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
  },
  sessionLabel: {
    textAlign: "center"
  }
});

function mapStateToProps(state) {
  return {
    user: state.user,
    session: state.session
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveSSQ: ssq => dispatch(saveSSQ(ssq))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SSQ);
