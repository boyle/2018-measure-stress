import React, { Component } from "react";
import { View } from "react-native";
import { PanResponder, Animated } from "react-native";
import { Constants, Svg } from "expo";
import { scaleLinear } from "d3-scale";
import Variables from "../globals/tracked_variables.js";

import PlotNavigator from "../components/PlotNavigator.js";

const yScaleLabels = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

export default class ActivityPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navigating: false,
      navigationFocus: {
        windowWidth: 5 * this.props.resolution,
        leftBound: 0,
        rightBound: 5 * this.props.resolution
      },
      focus: {
        windowWidth: 5 * this.props.resolution,
        leftBound: 0,
        rightBound: 5 * this.props.resolution
      }
    };

    const { width, height, padding } = this.props;

    this.yScale = scaleLinear()
      .domain([0, 100])
      .range([height - padding, padding]);

    this.inSecondsElapsed = this.inSecondsElapsed.bind(this);
    this.move = this.move.bind(this);
    this.resetNavigation = this.resetNavigation.bind(this);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onResponderTerminate: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        this.initial = this.state.focus.rightBound;
      },
      onPanResponderMove: this.move,
      onPanResponderRelease: (e, g) => {}
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.elapsedTime > this.state.focus.rightBound) {
      const rightBound =
        Math.ceil(nextProps.elapsedTime / this.props.resolution) *
        this.props.resolution;
      this.updateFocus({ rightBound });
    }
  }

  resetNavigation() {
    this.setState({ navigating: false });
  }

  move(event, gesture) {
    const xScale = scaleLinear()
      .domain([this.state.focus.leftBound, this.state.focus.rightBound])
      .range([this.props.padding, this.props.width - this.props.padding]);
    const { dx } = gesture;
    let rightBound = xScale.invert(xScale(this.initial) - dx);
    let leftBound = rightBound - this.state.focus.windowWidth;

    const upperBound =
      Math.ceil(this.props.elapsedTime / this.props.resolution) *
      this.props.resolution;

    if (leftBound < 0) {
      leftBound = 0;
      rightBound = leftBound + this.state.focus.windowWidth;
    }
    if (rightBound > upperBound) {
      rightBound = upperBound;
      leftBound = upperBound - this.state.focus.windowWidth;
    }
    this.setState({
      navigating: true,
      focus: { ...this.state.focus, leftBound, rightBound }
    });
    //this.updateFocus({ rightBound });
  }

  updateFocus({ rightBound }) {
    const leftBound = rightBound - this.state.focus.windowWidth;
    if (this.state.navigating) {
      // TODO is not in editmode mode
      this.setState({
        navigationFocus: {
          ...this.state.navigationFocus,
          rightBound,
          leftBound
        }
      });
    } else {
      this.setState({
        focus: { ...this.state.focus, rightBound, leftBound },
        navigationFocus: {
          ...this.state.navigationFocus,
          rightBound,
          leftBound
        }
      });
    }
  }

  convertEventToSVG(event, x, y) {
    return (
      <Svg.G>
        {y != this.yScale(0) && (
          <Svg.Line
            x1={x}
            y1={this.yScale(0)}
            x2={x}
            y2={y + 10}
            stroke={`${Variables[event.domain].color}`}
            strokeWidth={2}
          />
        )}

        <Svg.Circle
          onPress={() => this.props.toggleEditRequired(event.eventId)}
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

  computeXTicks() {
    const numTicks = this.state.focus.windowWidth / this.props.resolution + 1;
    let ticks = [];
    for (let i = 0; i <= numTicks; i++) {
      ticks.push(this.state.focus.leftBound + i * this.props.resolution);
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

  inSecondsElapsed(timestamp) {
    return (timestamp - this.props.sessionStart) / 1000;
  }

  formatSeconds(seconds) {
    return new Date(1000 * seconds).toISOString().substr(11, 8);
  }

  render() {
    const { width, height, padding, refreshRate, elapsedTime } = this.props;

    const xTicks = this.computeXTicks(this.state.focus.leftBound, 60, 10);

    this.xScale = scaleLinear()
      .domain([this.state.focus.leftBound, this.state.focus.rightBound])
      .range([padding, width - padding]);

    const navigationScale = scaleLinear()
      .domain([
        this.state.navigationFocus.leftBound,
        this.state.navigationFocus.rightBound
      ])
      .range([padding, width - padding]);

    return (
      <Svg
        style={{ marginLeft: 90 }}
        height={this.props.height}
        width={this.props.width}
      >
        <Svg.Rect
          {...this.panResponder.panHandlers}
          x={this.props.padding}
          y={this.props.padding}
          height={this.props.height - 2 * this.props.padding}
          width={this.props.width - 2 * this.props.padding}
          fill="white"
        />

        {this.props.activities
          .filter(activity => !activity.resting)
          .map(activity => {
            const crossesYAxis =
              this.inSecondsElapsed(activity.startTimestamp) <=
              this.state.focus.leftBound;
            const isCompleted = activity.endTimestamp;

            let leftBound = Math.max(
              this.inSecondsElapsed(activity.startTimestamp),
              this.state.focus.leftBound
            );

            let rightBound = !isCompleted
              ? Math.min(this.props.elapsedTime, this.state.focus.rightBound)
              : Math.min(
                  this.inSecondsElapsed(activity.endTimestamp),
                  this.state.focus.rightBound
                );

            const diff = this.xScale(rightBound) - this.xScale(leftBound);
            const width = diff >= 0 ? diff : 0;

            return (
              <Svg.Rect
                x={this.xScale(leftBound)}
                y={this.yScale(100)}
                height={this.yScale(0) - this.yScale(100)}
                width={width}
                fill="blue"
                opacity={0.1}
                {...this.panResponder.panHandlers}
              />
            );
          })}
        {/* X-axis*/}
        <Svg.Text
          x={this.props.width / 2}
          y={this.yScale(-20)}
          textAnchor="middle"
        >
          Time elapsed
        </Svg.Text>
        <Svg.Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="black"
        />
        {xTicks.map((label, i) => {
          const xPos = this.xScale(label);
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
                {this.formatSeconds(label)}
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

              {Object.values(this.props.events)
                .filter(event => event.type === "comment")
                .map((event, i) => (
                  <Svg.G>
                    <Svg.Path
                      transform={`translate(${this.xScale(event.elapsedTime) -
                        5},${this.yScale(100) - 10})scale(0.05)`}
                      d="M352,0H32v512h448V128L352,0z M352,45.25L434.75,128H352V45.25z M448,480H64V32h256v128h128V480z M288,128H96V96h192V128z    M96,192h320v32H96V192z M96,288h320v32H96V288z M96,384h320v32H96V384z"
                    />
                  </Svg.G>
                ))}

              {Object.values(this.props.events) // TODO: refactor
                .filter(event => event.type === "domain_variable")
                .map((event, i) => {
                  const x = this.xScale(this.inSecondsElapsed(event.timestamp));
                  const y = this.yScale(
                    (event.value * 100) /
                      (Object.keys(Variables[event.domain].levels).length - 1)
                  );

                  return (
                    this.inSecondsElapsed(event.timestamp) >=
                      this.state.focus.leftBound &&
                    this.inSecondsElapsed(event.timestamp) <=
                      this.state.focus.rightBound &&
                    this.convertEventToSVG(event, x, y)
                  );
                })}
            </Svg.G>
          );
        })}
        {this.props.elapsedTime <= this.state.focus.rightBound && (
          <Svg.Line
            x1={this.xScale(this.props.elapsedTime)}
            x2={this.xScale(this.props.elapsedTime)}
            y1={this.yScale(0)}
            y2={this.yScale(100)}
            stroke="red"
            strokeWidth={3}
          />
        )}
        <PlotNavigator
          inEditMode={true}
          elapsedTime={this.props.elapsedTime}
          markerLeft={this.state.focus.leftBound}
          leftBound={this.state.navigationFocus.leftBound}
          rightBound={this.state.navigationFocus.rightBound}
          x={navigationScale(this.state.navigationFocus.leftBound)}
          y={this.yScale(100) - 40}
          height={20}
          width={
            navigationScale(this.state.navigationFocus.rightBound) -
            navigationScale(this.state.navigationFocus.leftBound)
          }
        />
        {this.state.navigating && (
          <Svg.G>
            <Svg.Text
              x={this.props.width - this.props.padding - 50}
              y={this.yScale(90)}
              fill="black"
            >
              Reset
            </Svg.Text>
            <Svg.Rect
              onPress={this.resetNavigation}
              x={this.props.width - this.props.padding - 54}
              y={this.yScale(97)}
              height={20}
              width={40}
              stroke="black"
              fill="transparent"
              rx={8}
              ry={8}
            />
          </Svg.G>
        )}
      </Svg>
    );
  }
}
