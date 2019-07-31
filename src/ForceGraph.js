import React, { useEffect, useReducer, useState } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from "d3-force";

const radius = 5;
const labelOffset = { x: radius / 2, y: -radius / 4 };

const nodeId = node => node.id;
const linkId = link => `${link.source.id || link.source}=>${link.target.id || link.target}`;

const createSimulation = ({ height, links, nodes, width }) => {
  const centerX = width / 2;
  const centerY = height / 2;

  return forceSimulation()
    .nodes(nodes.map(({ id, radius, fx, fy, ...rest }) => ({
      id, radius, fx, fy
    })))
    .force("center", forceCenter(centerX, centerY))
    .force("charge", forceManyBody())
    .force("collide", forceCollide(3))
    .force("link", forceLink().id(nodeId).links(links.map(({ source, target, value, ...rest }) => ({
      source, target, value
    }))))
    .force("x", forceX(centerX))
    .force("y", forceY(centerY));
};

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

const useSimulationPositions = ({ height, links, nodes, width }) => {
  const [positions, setPositions] = useState({ links: {}, nodes: {} });

  useEffect(
    () => {
      let simulation = createSimulation({ height, links, nodes, width });
      let frame;

      simulation.on("tick", () => {
        frame = window.requestAnimationFrame(() => {
          setPositions({
            links: makeLinkPositions(simulation),
            nodes: makeNodePositions(simulation)
          });
        });
      });

      return () => {
        simulation.on("tick", null);

        if (frame) {
          window.cancelAnimationFrame(frame);
        }
      };
    },
    [height, links, nodes, width]
  );

  return positions;
};

const ForceGraph = ({ height = 400, links, nodes, width = 400 }) => {
  const positions = useSimulationPositions({ height, links, nodes, width });

  if (Object.keys(positions.nodes).length === 0) {
    return <svg height={height} width={width} />;
  }

  return (
    <svg height={height} width={width}>
      <g>
        {links.map(link => (
          <ForceGraphLink key={linkId(link)} link={link} position={positions.links[linkId(link)]} />
        ))}
      </g>
      <g>
        {nodes.map(node => (
          <ForceGraphNode key={nodeId(node)} node={node} position={positions.nodes[nodeId(node)]} />
        ))}
      </g>
      <g>
        {nodes.map(node => (
          <ForceGraphLabel key={nodeId(node)} node={node} position={positions.nodes[nodeId(node)]} />
        ))}
      </g>
    </svg>
  );
};

export default ForceGraph;
