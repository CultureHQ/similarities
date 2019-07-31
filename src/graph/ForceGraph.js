import React, { PureComponent, Children, cloneElement } from "react";

import * as forceUtils from "./d3-force";

const radius = 5;
const labelOffset = { x: radius / 2, y: -radius / 4 };

const DEFAULT_SIMULATION_PROPS = {
  animate: false,
  width: 400,
  height: 400,
  strength: {},
};

const ForceGraphLink = ({ link, ...props }) => (
  <line opacity={0.6} stroke="#999" strokeWidth={Math.sqrt(link.value)} {...props} />
);

const ForceGraphNode = ({ node, ...props }) => (
  <circle fill="#333" r={5} stroke="#fff" strokeWidth={1.5} {...props} />
);

const ForceGraphLabel = ({ node, cx, cy, ...props }) => (
  <text
    className="rv-force__label"
    key={`${forceUtils.nodeId(node)}-label`}
    x={cx + labelOffset.x}
    y={cy + labelOffset.y}
  >
    {node.label}
  </text>
);

class ForceGraph extends PureComponent {
  constructor(props) {
    super(props);

    const { width, height } = props;
    const data = this.getData();

    this.state = { linkPositions: {}, nodePositions: {} };

    this.simulation = forceUtils.createSimulation({ ...DEFAULT_SIMULATION_PROPS, width, height, data });
    this.simulation.on("tick", this.updateSimulation.bind(this));
  }

  componentDidMount() {
    this.updateSimulation();
  }

  componentDidUpdate(prevProps) {
    const { links, nodes } = this.props;

    if (links !== prevProps.links || nodes !== prevProps.nodes) {
      this.lastUpdated = new Date();
      this.updateSimulation();
    }
  }

  componentWillUnmount() {
    this.simulation.on("tick", null);
    this.frame = this.frame && window.cancelAnimationFrame(this.frame);
  }

  getData(force = false) {
    if (!force && (this.cachedData && new Date() > this.lastUpdated)) {
      return this.cachedData;
    }

    const { nodes, links } = this.props;
    const data = { nodes, links };

    Object.assign(this, { cachedData: data, lastUpdated: new Date() });

    return data;
  }

  updateSimulation() {
    const { width, height } = this.props;

    this.simulation = forceUtils.updateSimulation(this.simulation, {
      ...DEFAULT_SIMULATION_PROPS, width, height, data: this.getData(true),
    });

    this.frame = window.requestAnimationFrame(() => {
      this.setState({
        linkPositions: this.simulation.force("link").links().reduce(
          (accum, link) => ({
            ...accum,
            [forceUtils.linkId(link)]: {
              x1: link.source.x,
              y1: link.source.y,
              x2: link.target.x,
              y2: link.target.y,
            },
          }),
          {}
        ),
        nodePositions: this.simulation.nodes().reduce(
          (accum, node) => ({
            ...accum,
            [forceUtils.nodeId(node)]: {
              cx: node.fx || node.x,
              cy: node.fy || node.y
            }
          }),
          {}
        )
      });
    });
  }

  render() {
    const { height, links, nodes, width } = this.props;
    const { linkPositions, nodePositions } = this.state;

    const labelElements = [];
    const linkElements = links.map(link => {
      const linkPosition = linkPositions[forceUtils.linkId(link)];

      return <ForceGraphLink key={link.id} link={link} {...linkPosition} />;
    });

    const nodeElements = nodes.map(node => {
      const nodePosition = nodePositions[forceUtils.nodeId(node)];

      if (nodePosition) {
        labelElements.push(<ForceGraphLabel key={node.id} node={node} {...nodePosition} />);
      }

      return <ForceGraphNode key={node.id} node={node} {...nodePosition} />;
    });

    return (
      <svg height={height} width={width}>
        <g>
          <g>{linkElements}</g>
          <g>{nodeElements}</g>
          <g>{labelElements}</g>
        </g>
      </svg>
    );
  }
}

export default ForceGraph;
