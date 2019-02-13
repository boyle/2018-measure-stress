import React, { Component } from "react";
import { PanResponder, Animated } from "react-native";
import { Constants, Svg } from "expo";
import { scaleLinear } from "d3-scale";

class PlotNavigator extends Component {
  constructor(props) {
    super(props);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onResponderTerminate: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {},
      onPanResponderMove: e => {
        this.props.goTo(this.xScale.invert(e.nativeEvent.locationX));
      },
      onPanResponderRelease: (e, g) => {}
    });
  }

  // TODO TAP FOR SELECTION
  // Put center of focus as close
  // to the place corresponding to the finger tap

  render() {
    const { x, width, leftBound, rightBound } = this.props;

    // Axis
    this.xScale = scaleLinear()
      .domain([0, rightBound])
      .range([x, x + width]);

    // Width of focused region (in px)
    this.focusWidth =
      this.xScale(this.props.rightBound) - this.xScale(this.props.leftBound);

    return (
      <Svg.G {...this.panResponder.panHandlers} onPress={event => null}>
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
          x={this.xScale(this.props.markerLeft)}
          y={this.props.y}
          height={this.props.height}
          width={this.focusWidth}
          fill="grey"
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
