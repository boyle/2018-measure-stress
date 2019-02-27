import React, { Component } from "react";
import { Svg } from "expo";
import { line } from "d3-shape";
import Variables from "../globals/tracked_variables.js";

export default class DomainLine extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (Object.keys(this.props.events).length === 0) return null;
    const divisor = Object.keys(Variables[this.props.domain].levels).length;
    let data = Object.values(this.props.events).filter(
      event => event.domain === this.props.domain
    );
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
        />
      </Svg.G>
    );
  }
}
