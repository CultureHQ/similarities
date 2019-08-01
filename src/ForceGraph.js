import React, { useEffect, useRef } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from "d3-force";

const radius = 5;
const labelOffset = { x: radius / 2, y: -radius / 4 };

const createSimulation = ({ height, links, nodes, width }) => {
  return forceSimulation(nodes)
    .force("charge", forceManyBody())
    .force("collide", forceCollide(3))
    .force("link", forceLink().distance(150).links(links));
};

const useSimulationPositions = (canvasRef, { height, links, nodes, width }) => useEffect(
  () => {
    const context = canvasRef.current.getContext("2d");
    const simulation = createSimulation({ height, links, nodes, width });

    simulation.on("tick", () => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);

      context.beginPath();
      links.forEach(link => {
        context.moveTo(link.source.x, link.source.y);
        context.lineTo(link.target.x, link.target.y);
      });
      context.strokeStyle = "#ccc";
      context.stroke();

      nodes.forEach(node => {
        context.beginPath();
        context.moveTo(node.x + 5, node.y);
        context.arc(node.x, node.y, 5, 0, 2 * Math.PI);
        context.fillStyle = node.fill;
        context.fill();
        context.strokeStyle = "#fff";
        context.stroke();
      });

      context.restore();
    });

    return () => simulation.on("tick", null);
  },
  [canvasRef, height, links, nodes, width]
);

const ForceGraph = ({ height = 400, links, nodes, width = 400 }) => {
  const canvasRef = useRef();
  useSimulationPositions(canvasRef, { height, links, nodes, width });

  return <canvas ref={canvasRef} height={height} width={width} />;
};

export default ForceGraph;
