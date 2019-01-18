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

import ActivityPlot from "../components/ActivityPlot.js";
import AnnotationSlider from "../components/AnnotationSlider.js";
import PageTemplate from "../components/PageTemplate.js";
import Colors from "../globals/colors.js";
import Variables from "../globals/tracked_variables.js";
import IconButton from "../components/IconButton.js";

export default class Activity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startTimestamp: null,
      endTimestamp: null,
      elapsedTime: 0,
      activeSliderDomain: null,
      activeSliderValue: null,
      activeSliderStart: null,
      data: {}
    };

    const timestamp = new Date().getTime() / 1000;
    Object.keys(Variables).forEach(
      variable =>
        (this.state.data[variable] = {
          value: 0,
          log: [
            {
              domain: variable,
              timestamp: 0,
              value: 0
            }
          ]
        })
    );

    this.startActivity = this.startActivity.bind(this);
    this.stopActivity = this.stopActivity.bind(this);
    this.getElapsedTime = this.getElapsedTime.bind(this);
    this.rescaleXAxis = this.rescaleXAxis.bind(this);
    this.handleActivityButton = this.handleActivityButton.bind(this);
    this.onSlideComplete = this.onSlideComplete.bind(this);
    this.onSlideStart = this.onSlideStart.bind(this);
    this.onSlideDrag = this.onSlideDrag.bind(this);
  }

  getTime() {
    return Math.floor(new Date().getTime() / 1000);
  }

  activityIsActive() {
    return this.state.startTimestamp && !this.state.endTimestamp;
  }

  activityIsCompleted() {
    return this.state.startTimestamp && this.state.endTimestamp;
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
    this.timer = setInterval(() => this.rescaleXAxis(), 5000);

    this.setState({ startTimestamp: startTimestamp });
  }

  rescaleXAxis() {
    const elapsedTime = this.getElapsedTime();
    this.setState({ elapsedTime: elapsedTime });
  }

  getElapsedTime() {
    if (!this.state.startTimestamp) {
      return 0;
    }

    return this.getTime() - this.state.startTimestamp; // in ms
  }

  stopActivity() {
    // Ensure this is really what the user wants
    let confirmed = false;

    const stop = () => {
      this.setState({ endTimestamp: this.getTime() });
      clearInterval(this.timer);
    };

    Alert.alert(
      "End activity",
      "Are you sure that you are done with this activity? You will not be able to continue the activity.",
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

  onSlideComplete(domain, value) {
    const previousValue = this.state.data[domain].value;

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
      timestamp: this.getElapsedTime(),
      domain: domain,
      value: value
    };

    this.setState({
      [domain]: value,
      data: {
        ...this.state.data,

        [domain]: {
          value: value,
          log: this.activityIsActive()
            ? [...this.state.data[domain].log, event]
            : [...this.state.data[domain].log]
        }
      },
      activeSliderDomain: null,
      activeSliderValue: null,
      activeSliderStart: null
    });
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
        <ActivityPlot
          height={400}
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
                value={this.state.data[domain].value}
                minIndex={0}
                maxIndex={levelsList.length - 1}
                valueLabel={levels[this.state.data[domain].value]}
                onSlideComplete={this.onSlideComplete}
                onSlideStart={this.onSlideStart}
                onSlideDrag={this.onSlideDrag}
                width="40%"
              />
            );
          })}
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
                      i === this.state.activeSliderValue ? "bold" : "regular"
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
    padding: 30,
    marginLeft: Math.floor(0.1 * Dimensions.get("window").width),
    width: Math.floor(0.8 * Dimensions.get("window").width),
    backgroundColor: "rgba(169,169,169, 0.3)"
  }
});
