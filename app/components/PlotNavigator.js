import React, { Component } from "react";
import { PanResponder, Animated } from "react-native";
import { Constants, Svg } from "expo";
import { scaleLinear } from "d3-scale";

class PlotNavigator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leftBound: 0 // in s
    };

    this.move = this.move.bind(this);
  }

  // TAP FOR SELECTION
  // Put center of focus as close
  // to the place corresponding to the finger tap

  move(event, gesture) {
    const { dx } = gesture;
    const left = this.initialX + this.xScale.invert(dx);

    // If bar is dragged beyond left edge
    if (left < 0) {
      console.log("cant move left");
      return;
    }

    // If bar is dragged beyond right edge
    if (
      left +
        this.xScale.invert(this.focusWidth) -
        this.xScale.invert(this.props.x) >
      this.props.rightBound
    ) {
      console.log("cant move right");
      return;
    }

    this.setState({ leftBound: this.initialX + this.xScale.invert(dx) });
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        this.initialX = this.state.leftBound;
      },
      onPanResponderMove: this.move,
      onPanResponderRelease: null
    });
  }

  render() {
    this.xScale = scaleLinear()
      .domain([0, this.props.rightBound])
      .range([this.props.x, this.props.x + this.props.width]);

    this.focusWidth =
      this.xScale(this.props.rightBound) - this.xScale(this.props.leftBound);

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
        {/*...this.panResponder.panHandlers*/}
        <Svg.Rect
          x={this.xScale(this.props.markerLeft)}
          y={this.props.y}
          height={this.props.height}
          width={this.focusWidth}
          fill="none"
          stroke="grey"
        />
        {/*Current position*/}
        <Svg.Line
          x1={this.xScale(this.props.elapsedTime)}
          x2={this.xScale(this.props.elapsedTime)}
          y1={this.props.y}
          y2={this.props.y + this.props.height}
          stroke="red"
        />
      </Svg.G>
    );
  }
}

export default PlotNavigator;
