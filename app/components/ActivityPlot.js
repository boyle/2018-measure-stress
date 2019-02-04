import React, { Component } from "react";
import { View } from "react-native";
import { Constants, Svg } from "expo";
import { scaleLinear } from "d3-scale";
import Variables from "../globals/tracked_variables.js";

const yScaleLabels = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

export default class ActivityPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMax: 10
    };

    const { width, height, padding } = this.props;

    this.yScale = scaleLinear()
      .domain([0, 100])
      .range([height - padding, padding]);

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

  convertEventToSVG(event, x, y) {
    return (
      <Svg.G>
        <Svg.Line
          x1={x}
          y1={this.yScale(0)}
          x2={x}
          y2={y}
          stroke={`${Variables[event.domain].color}`}
          strokeWidth={2}
        />

        <Svg.Circle
          onPress={() =>
            this.props.toggleEditRequired(event.domain, event.eventId)
          }
          r={10}
          cx={x}
          cy={y}
          stroke={`${Variables[event.domain].color}`}
          fill="transparent"
          strokeWidth={2}
        />
        {event.editRequired && (
          <Svg.Text x={x} y={y - 15} fontSize={32} textAnchor="middle">
            ?
          </Svg.Text>
        )}
      </Svg.G>
    );
  }

  getFlaggedEvents() {
    return Object.values(this.props.flaggedEvents);
  }

  computeXTicks(lowerBound, windowWidth, resolution) {
    const numTicks = windowWidth / resolution + 1;
    let ticks = [];
    for (let i = 0; i <= numTicks; i++) {
      ticks.push(lowerBound + i * resolution);
    }
    return ticks;
  }

  computeXDomain(elapsedTime, windowWidth, resolution) {
    if (elapsedTime <= windowWidth) {
      return [0, windowWidth];
    }

    const upperBound = Math.ceil(elapsedTime / resolution) * resolution;
    const lowerBound = upperBound - windowWidth;

    return [lowerBound, upperBound];
  }

  render() {
    const { width, height, padding, refreshRate, elapsedTime } = this.props;

    const bounds = this.computeXDomain(elapsedTime, 60, 10);
    const xTicks = this.computeXTicks(bounds[0], 60, 10);

    const xScale = scaleLinear()
      .domain(bounds)
      .range([padding, width - padding]);

    return (
      <Svg
        style={{ marginLeft: 90 }}
        height={this.props.height}
        width={this.props.width}
      >
        {/* X-axis*/}
        <Svg.Text
          x={this.props.width / 2}
          y={this.yScale(-20)}
          textAnchor="middle"
        >
          Time (s)
        </Svg.Text>
        <Svg.Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="black"
        />
        {xTicks.map((label, i) => {
          const xPos = xScale(label);
          return (
            <Svg.G key={i}>
              <Svg.Line
                x1={xPos}
                y1={height - padding}
                x2={xPos}
                y2={height - padding + 10}
                stroke="black"
              />
              <Svg.Text
                textAnchor="middle"
                alignmentBaseline="hanging"
                x={xPos}
                y={height - padding + 15}
              >
                {label}
              </Svg.Text>
            </Svg.G>
          );
        })}

        {/*Y-axis*/}
        <Svg.Text
          x={padding - 40}
          y={this.yScale(50)}
          textAnchor="middle"
          transform={`rotate(-90 ${padding - 40} ${this.yScale(50)})`}
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
          const yPos = this.yScale(label);
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

              {Object.values(this.props.comments).map((event, i) => (
                <Svg.G key={i}>
                  <Svg.Rect
                    width={20}
                    height={20}
                    x={xScale(event.elapsedTime) - 10}
                    y={this.yScale(110) - 10}
                    stroke={`black`}
                    fill="transparent"
                    strokeWidth={2}
                  />
                </Svg.G>
              ))}

              {this.getEvents().map((event, i) => {
                const x = xScale(event.elapsedTime);
                const y = this.yScale(
                  (event.value * 100) /
                    Object.keys(Variables[event.domain].levels).length
                );

                return (
                  event.elapsedTime >= bounds[0] &&
                  this.convertEventToSVG(event, x, y)
                );
              })}
            </Svg.G>
          );
        })}
      </Svg>
    );
  }
}
