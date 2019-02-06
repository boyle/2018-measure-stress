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
  ACTIVITY_COMPLETED,
  SESSION_NOT_STARTED,
  RESTING
} from "../globals/constants.js";

import {
  startSession,
  stopSession,
  startActivity,
  stopActivity,
  endActivity,
  logActivity,
  logEvent,
  toggleEditRequired,
  tick,
  updateSessionStatus
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

    this.state = {
      inEditMode: false,
      activeSliderDomain: null,
      activeSliderValue: null,
      activeSliderStart: null
    };

    // For every tracked domain, initialize the current value to 0
    this.startSession = this.startSession.bind(this);
    this.startActivity = this.startActivity.bind(this);
    this.getElapsedTime = this.getElapsedTime.bind(this);
    this.logEvent = this.logEvent.bind(this);
    this.handleActivityButton = this.handleActivityButton.bind(this);
    this.onSlideComplete = this.onSlideComplete.bind(this);
    this.onSlideStart = this.onSlideStart.bind(this);
    this.onSlideDrag = this.onSlideDrag.bind(this);
    this.activityIsOngoing = this.activityIsOngoing.bind(this);
    this.isResting = this.isResting.bind(this);
    this.clearActiveSlider = this.clearActiveSlider.bind(this);
    this.startTicking = this.startTicking.bind(this);
    this.stopTicking = this.stopTicking.bind(this);
    this.sessionIsStarted = this.sessionIsStarted.bind(this);
    this.endSession = this.endSession.bind(this);
    this.getCurrentActivityNumber = this.getCurrentActivityNumber.bind(this);

    this.startSession();
  }

  getTime() {
    return Date.now(); // time in ms since epoch
  }

  sessionIsStarted() {
    return this.props.session.startTimestamp != null;
  }

  activityIsOngoing() {
    return this.props.session.sessionStatus === ACTIVITY_ONGOING;
  }

  isResting() {
    return this.props.session.sessionStatus === RESTING;
  }

  handleActivityButton() {
    if (this.activityIsOngoing()) {
      this.promptForActivityEnd();
    } else {
      this.startActivity();
    }
  }

  startTicking() {
    this.timer = setInterval(() => this.props.tick(), 1000);
  }

  stopTicking() {
    clearInterval(this.timer);
  }

  startSession() {
    this.props.startSession();
    this.startTicking();
  }

  startActivity() {
    // Modal to choose activity
    const activityId = 20; // TODO use a modal

    if (this.isResting()) {
      this.props.updateSessionStatus(ACTIVITY_ONGOING);
      this.props.startActivity(activityId);
    } else {
      this.props.updateSessionStatus(RESTING);
      this.props.startActivity(0); // activity with ID 0 is the "rest" activity
    }
  }

  promptForActivityEnd() {
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
          onPress: () => this.props.stopActivity()
        }
      ],
      { cancelable: true, onDismiss: () => {} }
    );
  }

  getCurrentActivityNumber() {
    return (
      Object.values(this.props.session.activities).filter(x => !x.resting)
        .length + 1
    );
  }

  getElapsedTimeOf(timestamp) {
    if (!this.props.session.sessionStart) {
      return 0;
    }

    return (timestamp - this.props.session.startTimestamp) / 1000; // in s
  }

  getElapsedTime() {
    if (!this.props.session.startTimestamp) {
      return 0;
    }

    return this.getTime() - this.props.session.startTimestamp;
  }

  endSession() {
    this.props.stopSession();
    this.stopTicking();
    this.props.hideModal();
    this.props.navigation.navigate("SSQ");
  }

  logEvent(event) {
    this.props.logEvent(
      event,
      !this.sessionIsStarted() // TODO: fix this, this is a hacky parameter that is required so that only one circle is plotted at baseline.
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
      elapsedTime: this.getElapsedTime(),
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
            onEndSession={() => this.endSession()}
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
          canStart={this.isResting()}
          activityStatus={this.state.activityStatus}
          patientId={this.props.session.patientId}
          onPressStart={this.handleActivityButton}
          activityNumber={this.getCurrentActivityNumber()}
          elapsedTime={this.props.session.elapsedTime}
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
          elapsedTime={this.props.session.elapsedTime}
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
    startActivity: activityId => dispatch(startActivity(activityId)),
    stopActivity: () => dispatch(stopActivity()),
    tick: () => dispatch(tick()),
    updateSessionStatus: status => dispatch(updateSessionStatus(status)),
    logActivity: activity => dispatch(logActivity(activity)),
    logEvent: (event, baseline) => dispatch(logEvent(event, baseline)),
    startSession: timestamp => dispatch(startSession(startSession)),
    stopSession: () => dispatch(stopSession()),
    toggleEditRequired: eventId => dispatch(toggleEditRequired(eventId)),
    showModal: modalName => dispatch(showModal(modalName)),
    hideModal: () => dispatch(hideModal())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Activity);
