import React, { useEffect, useRef } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from "d3-force";

const radius = 5;
const labelOffset = { x: radius / 2, y: -radius / 4 };

const nodeId = node => node.id;
const linkId = link => `${link.source.id || link.source}=>${link.target.id || link.target}`;

const createSimulation = ({ height, links, nodes, width }) => {
  const centerX = width / 2;
  const centerY = height / 2;

  return forceSimulation()
    .nodes(nodes.map(({ id }) => ({ id })))
    .force("center", forceCenter(centerX, centerY))
    .force("charge", forceManyBody())
    .force("collide", forceCollide(3))
    .force("link", forceLink().distance(200).id(nodeId).links(links.map(
      ({ source, target, value }) => ({ source, target, value })
    )))
    .force("x", forceX(centerX))
    .force("y", forceY(centerY));
};

const ForceGraphLink = ({ link }) => (
  <line opacity={0.3} stroke="#999" strokeWidth={Math.sqrt(link.value)} />
);

const ForceGraphNode = () => (
  <circle fill="#333" r={radius} stroke="#fff" strokeWidth={1} />
);

const ForceGraphLabel = ({ node }) => (
  <text key={`${nodeId(node)}-label`} className="force-label">
    {node.label}
  </text>
);

const setAttributes = (element, attributes) => element && Object.keys(attributes).forEach(key => {
  element.setAttribute(key, attributes[key]);
});

const useSimulationPositions = (graphRef, { height, links, nodes, width }) => useEffect(
  () => {
    const simulation = createSimulation({ height, links, nodes, width });
    let frame;

    simulation.on("tick", () => {
      frame = window.requestAnimationFrame(() => {
        const nodesNode = graphRef.current.querySelector(".nodes");
        const labelsNode = graphRef.current.querySelector(".labels");

        simulation.nodes().forEach((node, index) => {
          setAttributes(nodesNode.childNodes[index], {
            cx: node.x,
            cy: node.y
          });

          setAttributes(labelsNode.childNodes[index], {
            x: node.x + labelOffset.x,
            y: node.y + labelOffset.y
          });
        });

        const linksNode = graphRef.current.querySelector(".links");

        simulation.force("link").links().forEach((link, index) => {
          setAttributes(linksNode.childNodes[index], {
            x1: link.source.x,
            y1: link.source.y,
            x2: link.target.x,
            y2: link.target.y
          });
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
  [graphRef, height, links, nodes, width]
);

const ForceGraph = ({ height = 400, links, nodes, width = 400 }) => {
  const graphRef = useRef();
  useSimulationPositions(graphRef, { height, links, nodes, width });

  return (
    <svg ref={graphRef} height={height} width={width}>
      <g className="links">
        {links.map(link => <ForceGraphLink key={linkId(link)} link={link} />)}
      </g>
      <g className="nodes">
        {nodes.map(node => <ForceGraphNode key={nodeId(node)} />)}
      </g>
      <g className="labels">
        {nodes.map(node => <ForceGraphLabel key={nodeId(node)} node={node} />)}
      </g>
    </svg>
  );
};

export default ForceGraph;
