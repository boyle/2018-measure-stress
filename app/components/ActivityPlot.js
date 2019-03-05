import React, { Component } from "react";
import { View } from "react-native";
import { PanResponder, Animated } from "react-native";
import { Constants, Svg } from "expo";
import { scaleLinear } from "d3-scale";
import Variables from "../globals/tracked_variables.js";

import DomainLine from "./DomainLine.js";
import PlotNavigator from "../components/PlotNavigator.js";

const yScaleLabels = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

export default class ActivityPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detached: false, // is the focused region detached from time
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
    this.contains = this.contains.bind(this);
    this.getRoundedUpperBound = this.getRoundedUpperBound.bind(this);
    this.goTo = this.goTo.bind(this);
    this.move = this.move.bind(this);
    this.requiresScroll = this.requiresScroll.bind(this);
    this.attach = this.attach.bind(this);

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

  requiresScroll(time) {
    return time > this.state.focus.rightBound;
  }

  getRoundedUpperBound(time) {
    return Math.ceil(time / this.props.resolution) * this.props.resolution;
  }

  componentWillReceiveProps(nextProps) {
    // Update the focused region if the playhead reaches/passes
    // the right bound of the plot
    if (this.requiresScroll(nextProps.elapsedTime)) {
      const rightBound = this.getRoundedUpperBound(nextProps.elapsedTime);
      this.updateFocus({ rightBound });
    }
  }

  goTo(time) {
    let rightBound = time + this.state.focus.windowWidth / 2;
    let leftBound = time - this.state.focus.windowWidth / 2;
    let detached = true;

    if (leftBound < 0) {
      leftBound = 0;
      rightBound = this.state.focus.windowWidth;
    }

    if (rightBound > this.state.navigationFocus.rightBound) {
      rightBound = this.state.navigationFocus.rightBound;
      leftBound = rightBound - this.state.focus.windowWidth;
      detached = false;
    }

    this.setState({
      detached,
      focus: {
        ...this.state.focus,
        leftBound,
        rightBound
      }
    });
  }

  attach() {
    this.setState({ detached: false });
  }

  move(event, gesture) {
    const xScale = scaleLinear()
      .domain([this.state.focus.leftBound, this.state.focus.rightBound])
      .range([this.props.padding, this.props.width - this.props.padding]);
    const { dx } = gesture;
    let rightBound = xScale.invert(xScale(this.initial) - dx);
    let leftBound = rightBound - this.state.focus.windowWidth;
    let detached = true;

    const upperBound =
      Math.ceil(this.props.elapsedTime / this.props.resolution) *
      this.props.resolution;

    if (leftBound < 0) {
      leftBound = 0;
      rightBound = leftBound + this.state.focus.windowWidth;
    }
    if (rightBound > upperBound) {
      detached = false;
      rightBound = upperBound;
      leftBound = upperBound - this.state.focus.windowWidth;
    }
    this.setState({
      detached,
      focus: { ...this.state.focus, leftBound, rightBound }
    });
    //this.updateFocus({ rightBound });
  }

  updateFocus({ rightBound }) {
    const leftBound = rightBound - this.state.focus.windowWidth;

    // If in detached mode, only the PlotNavigation should update
    // the focused region on the plot is adjusted manually
    if (this.state.detached) {
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

  contains(timestamp) {
    const secondsElapsed = this.inSecondsElapsed(timestamp);
    return (
      secondsElapsed >= this.state.focus.leftBound &&
      secondsElapsed <= this.state.focus.rightBound
    );
  }

  convertEventToSVG(event, x, y) {
    return (
      <Svg.G>
        {event.editRequired && (
          <Svg.Text x={x} y={y - 15} fontSize={32} textAnchor="middle">
            ?
          </Svg.Text>
        )}
      </Svg.G>
    );
  }

  computeXTicks() {
    const numTicks = this.state.focus.windowWidth / this.props.resolution + 1;
    let ticks = [];
    for (let i = 0; i <= numTicks; i++) {
      ticks.push(this.state.focus.leftBound + i * this.props.resolution);
    }
    return ticks;
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
        style={{ marginLeft: 50 }}
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

        {Object.values(Variables).map(domain => (
          <Svg.G>
            <Svg.ClipPath id={`${domain.domain}-clip`}>
              <Svg.Rect
                fill={domain.color}
                x={this.props.padding}
                y="0"
                width={this.props.width - 2 * this.props.padding}
                height={this.props.height}
              />
            </Svg.ClipPath>
            <DomainLine
              inSecondsElapsed={this.inSecondsElapsed}
              toggleEditRequired={this.props.toggleEditRequired}
              domain={domain.domain}
              color={domain.color}
              xScale={this.xScale}
              yScale={this.yScale}
              events={this.props.events}
              elapsedTime={this.props.elapsedTime}
              clipPath={`url(#${domain.domain}-clip)`}
            />
          </Svg.G>
        ))}

        <PlotNavigator
          goTo={this.goTo}
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

        {this.state.detached && (
          <Svg.G>
            <Svg.Text
              x={this.props.width - this.props.padding - 50}
              y={this.yScale(90)}
              fill="black"
            >
              Reset
            </Svg.Text>
            <Svg.Rect
              onPress={this.attach}
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
