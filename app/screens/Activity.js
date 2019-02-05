import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ToastAndroid,
  Alert,
  Dimensions
} from "react-native";
import { Slider, Button } from "react-native-elements";
import { scaleLinear } from "d3-scale";
import { connect } from "react-redux";

import { generateRandomNum } from "../utils.js";
import {
  ACTIVITY_NOT_STARTED,
  ACTIVITY_ONGOING,
  ACTIVITY_COMPLETED
} from "../globals/constants.js";

import {
  startSession,
  logActivity,
  logEvent,
  toggleEditRequired
} from "../ducks/session.js";
import { showModal, hideModal } from "../ducks/ui.js";

import ActivityModal from "../components/ActivityModal.js";
import CommentModal from "../components/CommentModal.js";
import ActivityPlot from "../components/ActivityPlot.js";
import AnnotationSlider from "../components/AnnotationSlider.js";
import PageTemplate from "../components/PageTemplate.js";
import Colors from "../globals/colors.js";
import Variables from "../globals/tracked_variables.js";
import IconButton from "../components/IconButton.js";
import ActivityTopBar from "../components/ActivityTopBar.js";

class Activity extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...this.getInitialState() };

    // For every tracked domain, initialize the current value to 0

    this.startActivity = this.startActivity.bind(this);
    this.stopActivity = this.stopActivity.bind(this);
    this.getElapsedTime = this.getElapsedTime.bind(this);
    this.rescaleXAxis = this.rescaleXAxis.bind(this);
    this.logEvent = this.logEvent.bind(this);
    this.handleActivityButton = this.handleActivityButton.bind(this);
    this.onSlideComplete = this.onSlideComplete.bind(this);
    this.onSlideStart = this.onSlideStart.bind(this);
    this.onSlideDrag = this.onSlideDrag.bind(this);
    this.saveActivity = this.saveActivity.bind(this);
    this.activityIsActive = this.activityIsActive.bind(this);
    this.activityIsNotStarted = this.activityIsNotStarted.bind(this);
    this.activityIsCompleted = this.activityIsCompleted.bind(this);
    this.clearActiveSlider = this.clearActiveSlider.bind(this);
  }

  getInitialState() {
    const timestamp = this.getTime();
    const initialState = {
      inEditMode: false,
      activityStatus: ACTIVITY_NOT_STARTED,
      startTimestamp: null,
      endTimestamp: null,
      elapsedTime: 0,
      activeSliderDomain: null,
      activeSliderValue: null,
      activeSliderStart: null,
      currentActivity: {
        activityTitle: null,
        startTimestamp: null,
        stopTimestamp: null
      }
    };

    return initialState;
  }

  getTime() {
    return Date.now(); // time in ms since epoch
  }

  activityIsNotStarted() {
    return this.state.activityStatus === ACTIVITY_NOT_STARTED;
  }

  activityIsActive() {
    return this.state.activityStatus === ACTIVITY_ONGOING;
  }

  activityIsCompleted() {
    return this.state.activityState === ACTIVITY_COMPLETED;
  }

  handleActivityButton() {
    if (!this.activityIsActive()) {
      this.startActivity();
    } else {
      this.stopActivity();
    }
  }

  startActivity() {
    // Modal to choose activity

    // Initialize all variables to zero
    const startTimestamp = this.getTime();

    // If this is the first activity
    if (this.props.session.activities.length == 0) {
      this.props.startSession();
      this.timer = setInterval(() => this.rescaleXAxis(), 1000);
    }

    this.setState({
      activityStatus: ACTIVITY_ONGOING,
      currentActivity: {
        startTimestamp
      }
    });
  }

  rescaleXAxis() {
    const elapsedTime = this.getElapsedTime();
    this.setState({ elapsedTime: elapsedTime });
  }

  getElapsedTimeOf(timestamp) {
    if (!this.props.session.sessionStart) {
      return 0;
    }

    return (timestamp - this.props.session.sessionStart) / 1000; // in s
  }

  getElapsedTime() {
    if (!this.props.session.sessionStart) {
      return 0;
    }

    return (this.getTime() - this.props.session.sessionStart) / 1000; // in s
  }

  stopActivity() {
    // Ensure this is really what the user wants
    let confirmed = false;

    const stop = () => {
      this.setState({
        activityStatus: ACTIVITY_COMPLETED,
        currentActivity: {
          ...this.state.currentActivity,
          endTimestamp: this.getTime()
        }
      });
      this.props.logActivity(this.state.currentActivity);
    };

    Alert.alert(
      "End activity",
      "Are you sure that you are done with this activity? You will not be able to resume the activity.",
      [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => stop()
        }
      ],
      { cancelable: true, onDismiss: () => {} }
    );
  }

  saveActivity() {
    this.props.logActivity(this.state);
    this.props.navigation.navigate("SSQ");
    clearInterval(this.timer);
    this.props.hideModal();
  }

  logEvent(event) {
    this.props.logEvent(
      event,
      this.state.activityStatus === ACTIVITY_NOT_STARTED
    );
    this.clearActiveSlider();
  }

  clearActiveSlider() {
    this.setState({
      activeSliderDomain: null,
      activeSliderValue: null,
      activeSliderStart: null
    });
  }

  onSlideComplete(domain, value) {
    const previousValue = this.props.session.sliderValues[domain];

    // Only log the event if a change is made... but since slider
    // is done "sliding", the slider is no longer active.
    if (value === previousValue) {
      return this.clearActiveSlider();
    }

    const event = {
      eventId: generateRandomNum(),
      type: "domain_variable",
      timestamp: Date.now(),
      elapsedTime: this.getElapsedTimeOf(this.state.activeSliderStart),
      domain: domain,
      value: value,
      editRequired: false
    };

    this.logEvent(event);
  }

  onSlideStart(domain, value) {
    this.setState({
      activeSliderDomain: domain,
      activeSliderValue: value,
      activeSliderStart: this.getElapsedTime()
    });
  }

  onSlideDrag(domain, value) {
    this.setState({
      activeSliderValue: value
    });
  }

  render() {
    return (
      <PageTemplate>
        {this.props.ui.modal.modalName === "ActivityModal" && (
          <ActivityModal
            patientId={this.props.session.patientId}
            activityStatus={this.state.activityStatus}
            onNextActivity={() => this.saveActivity(true)}
            onSSQ={() => this.saveActivity(false)}
            onClose={() => this.props.hideModal()}
          />
        )}
        {this.props.ui.modal.modalName === "CommentModal" && (
          <CommentModal
            getElapsedTime={this.getElapsedTime}
            logEvent={this.logEvent}
            onClose={() => this.props.hideModal()}
          />
        )}
        <ActivityTopBar
          activityStatus={this.state.activityStatus}
          patientId={this.props.session.patientId}
          onPressStart={this.handleActivityButton}
          activityNumber={Object.keys(this.props.session.activities).length + 1}
          elapsedTime={this.state.elapsedTime}
          onSave={() => this.props.showModal("ActivityModal")}
        />
        <ActivityPlot
          height={300}
          width={700}
          padding={50}
          refreshRate={10}
          events={this.props.session.events}
          activityStatus={this.state.activityStatus}
          toggleEditRequired={this.props.toggleEditRequired}
          editRequired={this.state.editRequired}
          elapsedTime={this.state.elapsedTime}
          data={this.state.data}
          comments={this.state.comments}
        />
        <View style={styles.slidersContainer}>
          {Object.entries(Variables).map((variable, i) => {
            const domain = variable[0];
            const domainObj = variable[1];
            const levels = domainObj.levels;
            const levelsList = Object.values(levels);

            return (
              <AnnotationSlider
                key={i}
                sliderColor={Variables[domain].color}
                domain={domain}
                label={domainObj.label}
                value={this.props.session.sliderValues[domain]}
                minIndex={0}
                maxIndex={levelsList.length - 1}
                valueLabel={levels[this.props.session.sliderValues[domain]]}
                onSlideComplete={this.onSlideComplete}
                onSlideStart={this.onSlideStart}
                onSlideDrag={this.onSlideDrag}
                width="40%"
              />
            );
          })}
          <Button
            onPress={() => this.props.showModal("CommentModal")}
            containerViewStyle={{ width: "40%" }}
            icon={{ name: "edit" }}
            title="Comment"
          />
        </View>
        {this.state.activeSliderDomain && (
          <View style={styles.levelsIndicator}>
            {this.state.activeSliderDomain &&
              Object.values(
                Variables[this.state.activeSliderDomain].levels
              ).map((level, i) => (
                <Text
                  key={i}
                  style={{
                    fontWeight: `${
                      i === this.state.activeSliderValue ? "bold" : "normal"
                    }`,
                    fontSize: 20
                  }}
                >
                  {level}
                </Text>
              ))}
          </View>
        )}
      </PageTemplate>
    );
  }
}

const styles = StyleSheet.create({
  appTitle: {
    fontSize: 30,
    fontWeight: "bold"
  },
  container: {
    flex: 1,
    padding: 30,
    flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center"
  },
  slidersContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center"
  },
  levelsIndicator: {
    position: "absolute",
    top: 120,
    zIndex: 10,
    padding: 30,
    marginLeft: Math.floor(0.1 * Dimensions.get("window").width),
    width: Math.floor(0.8 * Dimensions.get("window").width),
    backgroundColor: "rgba(169,169,169, 0.8)"
  }
});

function mapStateToProps(state) {
  return {
    session: state.session,
    ui: state.ui
  };
}

function mapDispatchToProps(dispatch) {
  return {
    logActivity: activity => dispatch(logActivity(activity)),
    logEvent: (event, baseline) => dispatch(logEvent(event, baseline)),
    startSession: timestamp => dispatch(startSession(startSession)),
    toggleEditRequired: eventId => dispatch(toggleEditRequired(eventId)),
    showModal: modalName => dispatch(showModal(modalName)),
    hideModal: () => dispatch(hideModal())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Activity);
