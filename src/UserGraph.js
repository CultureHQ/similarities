import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { forceSimulation, forceCenter, forceCollide, forceLink } from "d3-force";

import UserGraphColoring from "./UserGraphColoring";
import useColoring from "./useColoring";

const radius = 10;
const labels = { left: -40, top: 20 };

const makeGetCoords = boundingRect => {
  const marginX = boundingRect.left + boundingRect.width / 2;
  const marginY = boundingRect.top + boundingRect.height / 2;

  return event => [event.clientX - marginX, event.clientY - marginY];
};

const makeGetCenter = boundingRect => {
  const marginX = boundingRect.left + boundingRect.width / 2;
  const marginY = boundingRect.top + boundingRect.height / 2;

  return node => [(node.fx || node.x) + marginX, (node.fy || node.y) + marginY];
};

const enableDrag = (canvas, simulation, setPopover) => {
  const boundingRect = canvas.getBoundingClientRect();

  const getCoords = makeGetCoords(boundingRect);
  const getCenter = makeGetCenter(boundingRect);

  let dragNode;
  let hoverNode;

  const onHoverNode = node => {
    if (hoverNode !== node) {
      hoverNode = node;

      setPopover(current => {
        if (hoverNode) {
          const [centerX, centerY] = getCenter(node);

          return {
            node: hoverNode,
            left: centerX + labels.left,
            top: centerY + labels.top,
            show: true
          };
        }
        return { ...current, show: false };
      });
    }
  };

  const onMouseDown = event => {
    const [eventX, eventY] = getCoords(event);
    dragNode = simulation.find(eventX, eventY, radius);

    if (dragNode) {
      simulation.alphaTarget(0.3).restart();
      dragNode.fx = eventX;
      dragNode.fy = eventY;
      onHoverNode(undefined);
    }
  };

  const onMouseMove = event => {
    const [eventX, eventY] = getCoords(event);

    if (dragNode) {
      dragNode.fx = eventX;
      dragNode.fy = eventY;
    } else {
      onHoverNode(simulation.find(eventX, eventY, radius));
    }
  };

  const onMouseUp = event => {
    if (dragNode) {
      dragNode.fx = null;
      dragNode.fy = null;
      dragNode = null;
    } else {
      simulation.alphaTarget(0);
    }
  };

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup", onMouseUp);

  return () => {
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mouseup", onMouseUp);
  };
};

const useSimulationPositions = (canvasRef, links, nodes, setPopover) => useEffect(
  () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const simulation = forceSimulation(nodes)
      .force("center", forceCenter())
      .force("collide", forceCollide(radius))
      .force("link", forceLink().distance(150).links(links).strength(link => link.strength));

    const width = parseInt(canvas.style.width, 10);
    const height = parseInt(canvas.style.height, 10);

    simulation.on("tick", () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
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
        context.moveTo(node.x + radius, node.y);
        context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        context.fillStyle = node.color;
        context.fill();
        context.strokeStyle = "#fff";
        context.stroke();
      });

      context.restore();
    });

    const disableDrag = enableDrag(canvas, simulation, setPopover);

    return () => {
      simulation.on("tick", null);
      disableDrag();
    }
  },
  [canvasRef, links, nodes, setPopover]
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
    label: user.name,
    color: getColor(user)
  };

  if (currentUser && user.key === currentUser.key) {
    return { ...node, fx: 0, fy: 0 };
  }

  return node;
});

const UserGraphPopover = ({ node, left, top, show }) => {
  const classList = ["popover"];
  if (show) {
    classList.push("show");
  }

  return ReactDOM.createPortal(
    <div className={classList.join(" ")} style={{ left, top }}>
      <div className="popover--caret" />
      {node && <div className="popover--content">{node.label}</div>}
    </div>,
    document.body
  );
};

const useCanvasPixelRatio = (canvasRef, height, width, ratio) => useEffect(
  () => {
    const canvas = canvasRef.current;

    canvas.height = height * ratio;
    canvas.width = width * ratio;
    canvas.style.height = `${height}px`;
    canvas.style.width = `${width}px`;

    canvas.getContext("2d").scale(ratio, ratio);
  },
  [canvasRef, height, width, ratio]
);

const UserGraphCanvas = ({ height, links, nodes, width }) => {
  const canvasRef = useRef();
  const [popover, setPopover] = useState({ node: null, left: 0, top: 0 });

  useCanvasPixelRatio(canvasRef, height, width, 2);
  useSimulationPositions(canvasRef, links, nodes, setPopover);

  return (
    <>
      <canvas ref={canvasRef} height={height} width={width} />
      <UserGraphPopover {...popover} />
    </>
  );
};

const UserGraph = ({ compare, currentUser, users }) => {
  const { coloring, getColor, onChangeColoring } = useColoring(users);

  const nodes = makeNodes(currentUser, users, getColor);
  const links = makeLinks(compare, currentUser, users);

  return (
    <>
      <UserGraphColoring coloring={coloring} onChangeColoring={onChangeColoring} />
      <UserGraphCanvas height={400} links={links} nodes={nodes} width={400} />
    </>
  );
};

export default UserGraph;
