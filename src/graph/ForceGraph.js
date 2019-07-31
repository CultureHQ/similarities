import React, { PureComponent, Children, cloneElement } from "react";

import * as forceUtils from "./d3-force";

const DEFAULT_SIMULATION_PROPS = {
  animate: false,
  width: 400,
  height: 400,
  strength: {},
};

const getNodePositions = simulation => simulation.nodes().reduce(
  (obj, node) => Object.assign(obj, {
    [forceUtils.nodeId(node)]: {
      cx: node.fx || node.x,
      cy: node.fy || node.y,
    },
  }),
  {}
);

const getLinkPositions = simulation => simulation.force('link').links().reduce(
  (obj, link) => Object.assign(obj, {
    [forceUtils.linkId(link)]: {
      x1: link.source.x,
      y1: link.source.y,
      x2: link.target.x,
      y2: link.target.y,
    },
  }),
  {}
);

export const ForceGraphLink = ({ className = "", link, opacity = 0.6, stroke = "#999", strokeWidth, ...props }) => (
  <line
    className={`rv-force__link ${className}`}
    opacity={opacity}
    stroke={stroke}
    strokeWidth={strokeWidth || Math.sqrt(link.value)}
    {...props}
  />
);

export const ForceGraphNode = ({ className = "", fill = "#333", labelClass, labelStyle, node, opacity = 1, r, showLabel, stroke = "#fff", strokeWidth = 1.5, ...props }) => (
  <circle
    className={`rv-force__node ${className}`}
    fill={fill}
    opacity={opacity}
    r={r || node.radius || 5}
    stroke={stroke}
    strokeWidth={strokeWidth}
    {...props}
  />
);

export class ForceGraph extends PureComponent {
  static get defaultProps() {
    return {
      labelAttr: "label",
      simulationOptions: DEFAULT_SIMULATION_PROPS,
      labelOffset: {
        x: ({ radius = 5 }) => radius / 2,
        y: ({ radius = 5 }) => -radius / 4,
      }
    };
  }

  static getDataFromChildren(children) {
    const data = { nodes: [], links: [] };

    Children.forEach(children, child => {
      if (child.type === ForceGraphNode) {
        data.nodes.push(child.props.node);
      } else if (child.type === ForceGraphLink) {
        data.links.push(child.props.link);
      }
    });

    return data;
  }

  constructor(props) {
    super(props);

    const { simulationOptions } = props;
    const data = this.getDataFromChildren();

    this.state = { linkPositions: {}, nodePositions: {} };
    this.simulation = forceUtils.createSimulation({
      ...DEFAULT_SIMULATION_PROPS,
      ...simulationOptions,
      data
    });

    this.simulation.on("tick", this.updateSimulation.bind(this));
  }

  componentDidMount() {
    this.updateSimulation();
  }

  componentDidUpdate(prevProps) {
    const { children } = this.props;

    if (children !== prevProps.children) {
      this.lastUpdated = new Date();
      this.updateSimulation();
    }
  }

  componentWillUnmount() {
    this.simulation.on("tick", null);
    this.frame = this.frame && window.cancelAnimationFrame(this.frame);
  }

  getDataFromChildren(props = this.props, force = false) {
    if (!force && (this.cachedData && new Date() > this.lastUpdated)) {
      return this.cachedData;
    }

    const data = ForceGraph.getDataFromChildren(props.children);

    Object.assign(this, { cachedData: data, lastUpdated: new Date() });

    return data;
  }

  updateSimulation() {
    const { simulation } = this;
    const { simulationOptions } = this.props;

    this.simulation = forceUtils.updateSimulation(simulation, {
      ...DEFAULT_SIMULATION_PROPS,
      ...simulationOptions,
      data: this.getDataFromChildren(this.props, true),
    });

    this.frame = window.requestAnimationFrame(() => {
      this.setState({
        linkPositions: getLinkPositions(this.simulation),
        nodePositions: getNodePositions(this.simulation),
      });
    });
  }

  render() {
    const { children, className, labelAttr, labelOffset, simulationOptions } = this.props;
    const { linkPositions, nodePositions } = this.state;

    const { height = DEFAULT_SIMULATION_PROPS.height, width = DEFAULT_SIMULATION_PROPS.width } = simulationOptions;

    const nodeElements = [];
    const labelElements = [];
    const linkElements = [];
    const staticChildren = [];

    Children.forEach(children, (child, idx) => {
      if (child.type === ForceGraphNode) {
        const { node, showLabel, labelClass, labelStyle = {}, strokeWidth } = child.props;
        const nodePosition = nodePositions[forceUtils.nodeId(node)];

        nodeElements.push(cloneElement(child, { ...nodePosition, strokeWidth }));

        if (nodePosition) {
          const { fontSize, ...spreadableLabelStyle } = labelStyle;

          labelElements.push(
            <text
              className={`rv-force__label ${labelClass}`}
              key={`${forceUtils.nodeId(node)}-label`}
              x={nodePosition.cx + labelOffset.x(node)}
              y={nodePosition.cy + labelOffset.y(node)}
              fontSize={fontSize}
              style={spreadableLabelStyle}
            >
              {node[labelAttr]}
            </text>
          );
        }
      } else if (child.type === ForceGraphLink) {
        const { link } = child.props;
        const { strokeWidth } = link;
        const linkPosition = linkPositions[forceUtils.linkId(link)];

        linkElements.push(cloneElement(child, { ...linkPosition, strokeWidth }));
      } else {
        staticChildren.push(cloneElement(child, { key: child.key || `static-${idx}` }));
      }
    });

    return (
      <svg className={className} width={width} height={height}>
        <g>{staticChildren}</g>
        <g>
          <g>{linkElements}</g>
          <g>{nodeElements}</g>
          <g>{labelElements}</g>
        </g>
      </svg>
    );
  }
}
