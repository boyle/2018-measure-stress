import React, { Component } from "react";
import { View } from "react-native";
import { Constants, Svg } from "expo";
import { LineChart, YAxis, Grid } from "react-native-svg-charts";
import { scaleLinear } from "d3-scale";

const yScaleLabels = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

export default class ActivityPlot extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { width, height, padding } = this.props;

    const INTERVAL = 10; // in s

    // Set the maximum x value to the nearest 30s multiple above current time
    const xMax =
      INTERVAL * Math.floor((this.props.elapsedTime + INTERVAL) / INTERVAL) ||
      INTERVAL;

    const xTicks = xMax / INTERVAL;
    let xScaleLabels = [];
    for (let i = 0; i <= xTicks; i++) {
      xScaleLabels.push(i * INTERVAL);
    }

    const xScale = scaleLinear()
      .domain([0, xMax])
      .range([padding, width - padding]);

    const yScale = scaleLinear()
      .domain([0, 100])
      .range([height - padding, padding]);

    return (
      <Svg height={this.props.height} width={this.props.width}>
        {/* X-axis*/}
        <Svg.Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="black"
        />
        {xScaleLabels.map((label, i) => {
          const xPos = xScale(label);
          return (
            <Svg.G>
              <Svg.Line
                x1={xPos}
                y1={height - padding}
                x2={xPos}
                y2={height - padding + 20}
                stroke="black"
              />
              <Svg.Text
                textAnchor="middle"
                alignmentBaseline="hanging"
                x={xPos}
                y={height - padding + 25}
              >
                {label}
              </Svg.Text>
            </Svg.G>
          );
        })}

        {/*Y-axis*/}
        <Svg.Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="black"
        />
        {yScaleLabels.map((label, i) => {
          const yPos = yScale(label);
          return (
            <Svg.G>
              <Svg.Line
                x1={padding - 10}
                y1={yPos}
                x2={padding}
                y2={yPos}
                stroke="black"
              />
              <Svg.Text
                textAnchor="end"
                alignmentBaseline="middle"
                x={padding - 20}
                y={yPos}
              >
                {label}
              </Svg.Text>
            </Svg.G>
          );
        })}
      </Svg>
    );
  }
}
