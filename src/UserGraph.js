import React, { useEffect, useRef, useState } from "react";
import { forceSimulation, forceCenter, forceCollide, forceLink } from "d3-force";

import UserGraphColoring from "./UserGraphColoring";
import useColoring from "./useColoring";

const useSimulationPositions = (canvasRef, { height, links, nodes, width }) => useEffect(
  () => {
    const context = canvasRef.current.getContext("2d");
    const simulation = forceSimulation(nodes)
      .force("center", forceCenter())
      .force("collide", forceCollide(5))
      .force("link", forceLink().distance(150).links(links).strength(link => link.strength));

    simulation.on("tick", () => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);

      context.beginPath();
      links.forEach(link => {
        if (link.draw) {
          context.moveTo(link.source.x, link.source.y);
          context.lineTo(link.target.x, link.target.y);
        }
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

const makeSourceLinks = (compare, source, users) => {
  const links = [];

  users.forEach(target => {
    if (source.key === target.key) {
      return;
    }

    links.push({
      source: source.key,
      target: target.key,
      strength: compare(source, target) ** 32,
      draw: source.connectionKeys.includes(target.key)
    });
  });

  return links;
};

const makeLinks = (compare, currentUser, users) => {
  if (currentUser) {
    return makeSourceLinks(compare, currentUser, users);
  }
  return users.flatMap(source => makeSourceLinks(compare, source, users));
};

const makeNodes = (currentUser, users, getColor) => users.map(user => {
  const node = {
    index: user.key,
    label: user.initials,
    color: getColor(user)
  };

  if (currentUser && user.key === currentUser.key) {
    return { ...node, fx: 0, fy: 0 };
  }

  return node;
});

const UserGraphCanvas = ({ height, links, nodes, width }) => {
  const canvasRef = useRef();
  useSimulationPositions(canvasRef, { height, links, nodes, width });

  return <canvas ref={canvasRef} height={height} width={width} />;
};

const UserGraph = ({ compare, currentUser, users }) => {
  const [getColor, onChangeColoring] = useColoring(users);

  const nodes = makeNodes(currentUser, users, getColor);
  const links = makeLinks(compare, currentUser, users);

  return (
    <>
      <UserGraphColoring onChangeColoring={onChangeColoring} />
      <UserGraphCanvas height={400} links={links} nodes={nodes} width={400} />
    </>
  );
};

export default UserGraph;
