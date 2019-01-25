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

import { logActivity } from "../ducks/session.js";
import { showModal, hideModal } from "../ducks/ui.js";

import ActivityModal from "../components/ActivityModal.js";
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
      data: {}
    };

    Object.keys(Variables).forEach(
      variable =>
        (initialState.data[variable] = {
          currentValue: 0,
          events: {
            0: {
              eventId: 0,
              domain: variable,
              timestamp: timestamp,
              elapsedTime: 0,
              value: 0
            }
          }
        })
    );
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
    // Initialize all variables to zero
    const startTimestamp = this.getTime();

    // Show a Toast, just 'coz you can
    ToastAndroid.showWithGravity(
      "Activity started at " + startTimestamp,
      ToastAndroid.LONG,
      ToastAndroid.CENTER
    );

    // Set interval
    this.timer = setInterval(() => this.rescaleXAxis(), 1000);

    this.setState({
      activityStatus: ACTIVITY_ONGOING,
      startTimestamp: startTimestamp
    });
  }

  rescaleXAxis() {
    const elapsedTime = this.getElapsedTime();
    this.setState({ elapsedTime: elapsedTime });
  }

  getElapsedTime() {
    if (!this.state.startTimestamp) {
      return 0;
    }

    return (this.getTime() - this.state.startTimestamp) / 1000; // in s
  }

  stopActivity() {
    // Ensure this is really what the user wants
    let confirmed = false;

    const stop = () => {
      this.setState({
        activityStatus: ACTIVITY_COMPLETED,
        endTimestamp: this.getTime()
      });
      clearInterval(this.timer);
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

  saveActivity(createNextActivity) {
    this.props.logActivity(this.state);
    if (createNextActivity) {
      this.setState({ ...this.getInitialState() });
    } else {
      this.props.navigation.navigate("SSQ");
    }
    this.props.hideModal();
  }

  logEvent(domain, event) {
    this.setState({
      data: {
        ...this.state.data,

        [domain]: {
          currentValue: event.value,
          events: this.activityIsActive()
            ? { ...this.state.data[domain].events, [event.id]: event }
            : { ...this.state.data[domain].events, 0: event } //log this as the initial event with id 0
        }
      },
      activeSliderDomain: null,
      activeSliderValue: null,
      activeSliderStart: null
    });
  }

  onSlideComplete(domain, value) {
    const previousValue = this.state.data[domain].currentValue;

    // Only log the event if a change is made... but since slider
    // is done "sliding", the slider is no longer active.
    if (value === previousValue) {
      return this.setState({
        activeSliderDomain: null,
        activeSliderValue: null,
        activeSliderStart: null
      });
    }

    const event = {
      eventId: generateRandomNum(),
      timestamp: Date.now(),
      elapsedTime: this.getElapsedTime(),
      domain: domain,
      value: value
    };

    this.logEvent(domain, event);
  }

  onSlideStart(domain, value) {
    this.setState({
      activeSliderDomain: domain,
      activeSliderValue: value,
      activeSliderStart: this.getTime()
    });
  }

  onSlideDrag(value) {
    this.setState({ activeSliderValue: value });
  }

  render() {
    return (
      <PageTemplate>
        {this.props.ui.modal.modalName === "ActivityModal" && (
          <ActivityModal
            onNextActivity={() => this.saveActivity(true)}
            onSSQ={() => this.saveActivity(false)}
          />
        )}
        <ActivityTopBar
          activityStatus={this.state.activityStatus}
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
          elapsedTime={this.state.elapsedTime}
          data={this.state.data}
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
                value={this.state.data[domain].currentValue}
                minIndex={0}
                maxIndex={levelsList.length - 1}
                valueLabel={levels[this.state.data[domain].currentValue]}
                onSlideComplete={this.onSlideComplete}
                onSlideStart={this.onSlideStart}
                onSlideDrag={this.onSlideDrag}
                width="40%"
              />
            );
          })}
          {/*<Button raised icon={{ name: "edit" }} title="Comment" />*/}

          {/*
          <IconButton
            iconName={`${
              !this.activityIsActive()
                ? "play-circle-filled"
                : "pause-circle-filled"
            }`}
            iconColor={"blue"}
            title={`${!this.activityIsActive() ? "Start" : "Stop"}`}
            buttonStyle={styles.button}
            iconHeight={"100%"}
            iconWidth={"100%"}
            textStyle={styles.buttonTitle}
            action={!this.activityIsCompleted() && this.handleActivityButton}
          />*/}
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
    flexWrap: "wrap"
  },
  levelsIndicator: {
    position: "absolute",
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
    showModal: modalName => dispatch(showModal(modalName)),
    hideModal: () => dispatch(hideModal())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Activity);
