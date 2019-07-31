import React, { PureComponent, Children, cloneElement, useEffect, useReducer } from "react";

import { createSimulation, updateSimulation, nodeId, linkId } from "./d3-force";

const radius = 5;
const labelOffset = { x: radius / 2, y: -radius / 4 };
const defaultSimulationProps = { animate: false, strength: {} };

const ForceGraphLink = ({ link, position }) => (
  <line opacity={0.6} stroke="#999" strokeWidth={Math.sqrt(link.value)} {...position} />
);

const ForceGraphNode = ({ node, position }) => (
  <circle fill="#333" r={5} stroke="#fff" strokeWidth={1.5} {...position} />
);

const ForceGraphLabel = ({ node, position }) => (
  <text
    className="rv-force__label"
    key={`${nodeId(node)}-label`}
    x={position.cx + labelOffset.x}
    y={position.cy + labelOffset.y}
  >
    {node.label}
  </text>
);

const makeInitialState = ({ height, links, nodes, width }) => ({
  frame: null,
  linkPositions: {},
  nodePositions: {},
  simulation: createSimulation({ ...defaultSimulationProps, data: { links, nodes }, height, width })
});

const makeLinkPosition = link => ({
  x1: link.source.x,
  y1: link.source.y,
  x2: link.target.x,
  y2: link.target.y
});

const makeLinkPositions = simulation => simulation.force("link").links().reduce(
  (accum, link) => ({ ...accum, [linkId(link)]: makeLinkPosition(link) }), {}
);

const makeNodePosition = node => ({
  cx: node.fx || node.x,
  cy: node.fy || node.y
});

const makeNodePositions = simulation => simulation.nodes().reduce(
  (accum, node) => ({ ...accum, [nodeId(node)]: makeNodePosition(node) }), {}
);

const reducer = (state, action) => {
  switch (action.type) {
    case "frame":
      return {
        ...state,
        linkPositions: makeLinkPositions(state.simulation),
        nodePositions: makeNodePositions(state.simulation)
      };
    case "tick": {
      const { height, links, nodes, width } = action;
      const simulation = updateSimulation(state.simulation, {
        ...defaultSimulationProps, data: { links, nodes }, height, width
      });

      return { ...state, simulation };
    }
    default:
      throw new Error();
  }
};

const ForceGraph = ({ height = 400, links, nodes, width = 400 }) => {
  const [state, dispatch] = useReducer(reducer, { height, links, nodes, width }, makeInitialState);

  useEffect(
    () => {
      state.simulation.on("tick", () => dispatch({ type: "tick", height, links, nodes, width }));
      return () => state.simulation.on("tick", null);
    },
    [dispatch, height, links, nodes, width]
  );

  useEffect(
    () => {
      const frame = window.requestAnimationFrame(() => dispatch({ type: "frame" }));
      return () => window.cancelAnimationFrame(frame);
    },
    [dispatch, state.simulation]
  );

  if (Object.keys(state.nodePositions).length === 0) {
    return <svg height={height} width={width} />;
  }

  return (
    <svg height={height} width={width}>
      <g>
        {links.map(link => (
          <ForceGraphLink key={link.id} link={link} position={state.linkPositions[linkId(link)]} />
        ))}
      </g>
      <g>
        {nodes.map(node => (
          <ForceGraphNode key={node.id} node={node} position={state.nodePositions[nodeId(node)]} />
        ))}
      </g>
      <g>
        {nodes.map(node => (
          <ForceGraphLabel key={node.id} node={node} position={state.nodePositions[nodeId(node)]} />
        ))}
      </g>
    </svg>
  );
};

export default ForceGraph;
