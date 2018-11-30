/*
 * EventsGanttChart.js
 * Author: Francois Charih <francoischarih@sce.carleton.ca>
 *
 * Description: Dynamic chart showing active events as time passes.
 */

import React from 'react';
import { StyleSheet, Text, View, Button, Image, TextInput } from 'react-native';
import { AreaChart, Grid } from 'react-native-svg-charts'
import * as shape from 'd3-shape'


export default class EventsGanttChart extends React.Component {
  render() {
    return (
        <AreaChart
          style={{ height: 200 }}
          data={ this.props.data }
          contentInset={{ top: 30, bottom: 30 }}
          curve={ shape.curveNatural }
          svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
        >
          <Grid/>
        </AreaChart>
    );
  }
}

const styles = StyleSheet.create({
});
