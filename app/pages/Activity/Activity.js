import React from "react";
/*
 * Activity.js
 * Author: Francois Charih <francoischarih@sce.carleton.ca>
 *
 * Description: Page displayed while the patient is performing an activity.
 */
import { StyleSheet, Text, View, Button, Image, TextInput } from "react-native";

import EventsGanttChart from "../../components/EventsGanttChart/EventsGanttChart.js";
import { AreaChart, Grid } from "react-native-svg-charts";
import * as shape from "d3-shape";

export default class Activity extends React.Component {
  render() {
    const data = [
      50,
      10,
      40,
      95,
      -4,
      -24,
      85,
      91,
      35,
      53,
      -53,
      24,
      50,
      -20,
      -80
    ];
    return (
      <View style={styles.container}>
        <View style={{ height: 200, width: 600 }}>
          <EventsGanttChart data={data} />
        </View>
      </View>
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
  }
});
