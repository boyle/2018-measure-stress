import React from "react";
import { BackHandler } from "react-native";
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
  }

  formIsFilled() {
    typeSpecified = this.state.presession != null;
    allQuestionsAnswered = Object.values(this.state.symptoms).every(
      answer => answer != null
    );

    formFilled = typeSpecified && allQuestionsAnswered;
    return formFilled;
  }

  saveForm() {
    const submittedForm = {
      ...this.state,
      annotatorId: null, // TODO connect to redux,
      patientId: null, // TODO connect to redux,
      timestamp: new Date().toISOString()
    };
    return -1; // TODO -> add to redux (session reducer)
  }

  render() {
    return (
      <PageTemplate>
        <Text style={styles.title}>Simulation Sickness Questionnaire</Text>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around"
          }}
        >
          <CheckBox
            title="Pre-session"
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            checked={this.state.presession === true}
            onPress={() => this.setState({ presession: true })}
          />
          <CheckBox
            title="Post-session"
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            checked={this.state.presession === false}
            onPress={() => this.setState({ presession: false })}
          />
        </View>

        <View style={styles.cardsContainer}>
          <ScrollView>
            {SSQVars.symptoms.map(symptom => (
              <Card>
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
                    backgroundColor: `${
                      buttonColor[this.state.symptoms[symptom.index]]
                    }`
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
          onPress={() => null}
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
  }
});

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

export default connect(
  mapStateToProps,
  null
)(SSQ);
