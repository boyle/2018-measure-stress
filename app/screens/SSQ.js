import React from 'react';
import {BackHandler} from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import {Button, Card, ButtonGroup, CheckBox} from 'react-native-elements';
import {connect} from 'react-redux';

import {initializeSession, saveSSQ} from '../ducks/session.js';
import Colors from '../globals/colors.js';
import PageTemplate from '../components/PageTemplate.js';
import SSQVars from '../globals/ssq.js';

const buttonColor = {
  0: 'green',
  1: 'yellow',
  2: 'orange',
  3: 'red',
};

class SSQ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {...SSQVars.emptySSQForm};

    this.saveForm = this.saveForm.bind(this);
    this.formIsFilled = this.formIsFilled.bind(this);
    this.isFirstSSQ = this.isFirstSSQ.bind(this);
    this.isSecondSSQ = this.isSecondSSQ.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
  }

  componentDidMount() {
    this.scrollToTop();
    /*
    this.focusListener = this.props.navigation.addListener(
      "didFocus",
      this.scrollToTop
    );
    */
  }

  isFirstSSQ() {
    return !this.props.session.firstSSQ;
  }

  isSecondSSQ() {
    return !this.isFirstSSQ();
  }

  formIsFilled() {
    const allQuestionsAnswered = Object.values(this.state.symptoms).every(
      answer => answer != null,
    );

    return allQuestionsAnswered;
  }

  saveForm() {
    const submittedForm = {
      ...this.state,
      timestamp: Date.now(),
    };
    this.props.saveSSQ(submittedForm);

		this.setState({...SSQVars.emptySSQForm});

		this.props.onHide();

  }

  scrollToTop() {
    this.scrollViewRef.scrollTo({y: 0});
    this.y = 0;
  }

  render() {
    return (
      <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "white" }}>
        <Text style={styles.title}>Simulation Sickness Questionnaire</Text>
        <Text style={styles.sessionLabel}>
          {this.isFirstSSQ() ? 'Pre' : 'Post'}-session
        </Text>
        <View style={styles.cardsContainer}>
          <ScrollView
            onScroll={event => (this.y = event.nativeEvent.contentOffset.y)}
            ref={ref => {
              this.scrollViewRef = ref;
            }}>
            {SSQVars.symptoms.map((symptom, i) => (
              <Card key={`symptom-${i}`}>
                <Text style={styles.symptom}>{symptom.label}</Text>
                <ButtonGroup
                  textStyle={{color: `${Colors.dark}`}}
                  selectedTextStyle={{color: `${Colors.dark}`}}
                  onPress={index => {
                    this.setState({
                      symptoms: {
                        ...this.state.symptoms,
                        [symptom.index]: index,
                      },
                    });
                  }}
                  selectedIndex={this.state.symptoms[symptom.index]}
                  selectedButtonStyle={{
                    backgroundColor: `${buttonColor[
                      this.state.symptoms[symptom.index]
                    ] || 'white'}`,
                  }}
                  buttons={['None', 'Slight', 'Moderate', 'Severe']}
                  containerStyle={{height: 50}}
                />
              </Card>
            ))}
          </ScrollView>
				</View>
				<View style={{ marginTop: 20, display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
        <Button
          title="Save"
          disabled={!this.formIsFilled()}
          buttonStyle={styles.button}
          onPress={() => this.saveForm()}
				/>
				<Button
          title="Close"
          buttonStyle={styles.button}
          onPress={this.props.onHide}
				/>
			</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: `${Colors.dark}`,
  },
  container: {
    flex: 1,
    padding: 30,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  cardsContainer: {
    height: '80%',
  },
  statsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  symptom: {
    fontSize: 18,
    fontWeight: 'bold',
    color: `${Colors.dark}`,
    textAlign: 'center',
  },
  button: {
    backgroundColor: `${Colors.dark}`,
    width: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  buttonIcon: {
    width: 150,
    height: 150,
  },
  buttonTitle: {
    textAlign: 'center',
    color: 'white',
    fontSize: 24,
  },
  buttonsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statsValue: {
    textAlign: 'center',
    fontSize: 42,
    fontWeight: 'bold',
    color: `${Colors.dark}`,
  },
  statsName: {
    textAlign: 'center',
    fontSize: 32,
  },
  sessionLabel: {
    textAlign: 'center',
  },
});

function mapStateToProps(state) {
  return {
    user: state.user,
    session: state.session,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveSSQ: ssq => dispatch(saveSSQ(ssq)),
    initializeSession: () => dispatch(initializeSession()),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SSQ);
