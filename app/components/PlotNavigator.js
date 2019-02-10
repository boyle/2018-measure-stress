import React, { Component } from "react";
import { Constants, Svg } from "expo";
import { scaleLinear } from "d3-scale";

class PlotNavigator extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const xScale = scaleLinear()
      .domain([0, this.props.rightBound])
      .range([this.props.x, this.props.x + this.props.width]);

    return (
      <Svg.G>
        {/*Entire session*/}
        <Svg.Rect
          x={this.props.x}
          y={this.props.y}
          height={this.props.height}
          width={this.props.width}
          stroke="black"
          fill="transparent"
        />
        {/*Focused region*/}
        <Svg.Rect
          x={xScale(this.props.leftBound)}
          y={this.props.y}
          height={this.props.height}
          width={xScale(this.props.rightBound) - xScale(this.props.leftBound)}
          fill="grey"
          stroke="grey"
        />
        {/*Current position*/}
        <Svg.Line
          x1={xScale(this.props.elapsedTime)}
          x2={xScale(this.props.elapsedTime)}
          y1={this.props.y}
          y2={this.props.y + this.props.height}
          stroke="red"
        />
      </Svg.G>
    );
  }
}

export default PlotNavigator;
