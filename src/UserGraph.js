import React, { useEffect, useRef, useState } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCollide } from "d3-force";

import UserGraphColoring from "./UserGraphColoring";
import useColoring from "./useColoring";

const useSimulationPositions = (canvasRef, { height, links, nodes, width }) => useEffect(
  () => {
    const context = canvasRef.current.getContext("2d");
    const simulation = forceSimulation(nodes)
      .force("charge", forceManyBody())
      .force("collide", forceCollide(3))
      .force("link", forceLink().distance(150).links(links));

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
        context.fillStyle = node.color;
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

const makeUserLinks = (compare, user, users) => user.connectionKeys.map(
  connectionKey => ({ source: user.key, target: connectionKey })
);

const makeGraphLinks = (compare, currentUser, users) => {
  if (currentUser) {
    return makeUserLinks(compare, currentUser, users);
  }
  return users.flatMap(user => makeUserLinks(compare, user, users));
};

const UserGraphCanvas = ({ height, links, nodes, width }) => {
  const canvasRef = useRef();
  useSimulationPositions(canvasRef, { height, links, nodes, width });

  return <canvas ref={canvasRef} height={height} width={width} />;
};

const UserGraph = ({ compare, currentUser, users }) => {
  const [getColor, onChangeColoring] = useColoring(users);

  const nodes = users.map(user => ({ index: user.key, label: user.initials, color: getColor(user) }));
  const links = makeGraphLinks(compare, currentUser, users);

  return (
    <>
      <UserGraphColoring onChangeColoring={onChangeColoring} />
      <UserGraphCanvas height={400} links={links} nodes={nodes} width={400} />
    </>
  );
};

export default UserGraph;
