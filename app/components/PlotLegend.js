import React, { Component } from "react";
import { Constants, Svg } from "expo";

import Variables from "../globals/tracked_variables.js";

export default class PlotLegend extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    // LOTS of hardcoding, but oh well...
    return (
      <Svg width={1000} height={50}>
        {Object.values(Variables).map((variable, i) => (
          <Svg.G transform="translate(100,0)">
            <Svg.Line
              x1={i * 90}
              x2={i * 90 + 60}
              y1={10}
              y2={10}
              stroke={variable.color}
              strokeWidth={4}
            />
            <Svg.Text x={i * 90} y={25} fill={variable.color}>
              {variable.label.split(" ")[0]}
            </Svg.Text>
          </Svg.G>
        ))}
      </Svg>
    );
  }
}
