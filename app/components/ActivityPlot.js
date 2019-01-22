import React, { Component } from "react";
import { View } from "react-native";
import { Constants, Svg } from "expo";
import { scaleLinear } from "d3-scale";
import Variables from "../globals/tracked_variables.js";

const yScaleLabels = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

export default class ActivityPlot extends Component {
  constructor(props) {
    super(props);

    this.getEvents = this.getEvents.bind(this);
  }

  getEvents() {
    const mergedLog = [];
    Object.entries(this.props.data).map(domain => {
      Object.values(domain[1].events).forEach(event => {
        mergedLog.push(event);
      });
    });
    return mergedLog;
  }

  render() {
    const { width, height, padding, refreshRate, elapsedTime } = this.props;

    const xMax =
      refreshRate * Math.floor((elapsedTime + refreshRate) / refreshRate) ||
      refreshRate;

    const xTicks = xMax / refreshRate;
    let xScaleLabels = [];
    for (let i = 0; i <= xTicks; i++) {
      xScaleLabels.push(i * refreshRate);
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
        <Svg.Text x={this.props.width / 2} y={yScale(-15)} textAnchor="middle">
          Time (s)
        </Svg.Text>
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
            <Svg.G key={i}>
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
        <Svg.Text
          x={padding - 40}
          y={yScale(50)}
          textAnchor="middle"
          transform={`rotate(-90 ${padding - 40} ${yScale(50)})`}
        >
          Severity (% of max)
        </Svg.Text>
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
            <Svg.G key={i}>
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

              {this.getEvents().map((event, i) => (
                <Svg.G key={i}>
                  <Svg.Line
                    x1={xScale(event.elapsedTime)}
                    y1={yScale(0)}
                    x2={xScale(event.elapsedTime)}
                    y2={
                      yScale(
                        (event.value * 100) /
                          Object.keys(Variables[event.domain].levels).length
                      ) + 10
                    }
                    stroke={`${Variables[event.domain].color}`}
                    strokeWidth={2}
                  />

                  <Svg.Circle
                    r={10}
                    cx={xScale(event.elapsedTime)}
                    cy={yScale(
                      (event.value * 100) /
                        Object.keys(Variables[event.domain].levels).length
                    )}
                    stroke={`${Variables[event.domain].color}`}
                    fill="transparent"
                    strokeWidth={2}
                  />
                </Svg.G>
              ))}
            </Svg.G>
          );
        })}
      </Svg>
    );
  }
}
