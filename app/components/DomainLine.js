import React, { Component } from "react";
import { Svg } from "expo";
import { line } from "d3-shape";
import Variables from "../globals/tracked_variables.js";

export default class DomainLine extends Component {
  constructor(props) {
    super(props);
    this.lastTap = null;

    this.doubleTap = this.doubleTap.bind(this);
  }

  doubleTap(event) {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300; // ms

    if (this.lastTap && now - this.lastTap < DOUBLE_PRESS_DELAY) {
      //this.props.toggleEditRequired(eventId);
      this.props.editEvent(event);
    } else {
      this.lastTap = now;
    }
  }

  render() {
    if (Object.keys(this.props.events).length === 0) return null;
    const divisor = Object.keys(Variables[this.props.domain].levels).length;
    let data = Object.values(this.props.events).filter(
      event => event && event.domain === this.props.domain
    );
    data.sort((a, b) => a.timestamp > b.timestamp);
    data.push({
      timestamp: Date.now(),
      value: data.length > 0 ? data[data.length - 1].value : 0
    });
    const path = line()
      .x(d => this.props.xScale(this.props.inSecondsElapsed(d.timestamp)))
      .y(d => this.props.yScale((100 * d.value) / (divisor - 1)));

    return (
      <Svg.G>
        <Svg.Path
          d={path(data)}
          strokeWidth={4}
          stroke={this.props.color}
          fill="none"
          clipPath={this.props.clipPath}
        />
        {Object.values(this.props.events)
          .filter(event => event && event.domain === this.props.domain)
          .map(event => (
            <Svg.Circle
              clipPath={this.props.clipPath}
              onPress={() => {
                this.doubleTap(event);
              }}
              r={10}
              cx={this.props.xScale(
                this.props.inSecondsElapsed(event.timestamp)
              )}
              cy={this.props.yScale((100 * event.value) / (divisor - 1))}
              stroke={`${Variables[event.domain].color}`}
              fill={`${Variables[event.domain].color}`}
              strokeWidth={2}
            />
          ))}
      </Svg.G>
    );
  }
}
