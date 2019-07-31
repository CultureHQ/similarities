import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from "d3-force";

const ALPHA_FACTORS = ["alpha", "alphaDecay", "alphaMin", "alphaTarget", "velocityDecay"];

function setsEqual(setA, setB) {
  if (setA.size !== setB.size) {
    return false;
  }

  let acc = true;
  setA.forEach((a) => {
    acc = acc && setB.has(a);
  });

  return acc;
}

function pick(list, ...attrNames) {
  return list.map(item => attrNames.reduce(
    (obj, attrName) => Object.assign(obj, {
      [attrName]: item[attrName],
    }),
    {}
  ));
}

export function asStrengthFn(target) {
  switch (typeof target) {
    case "function":
      return target;
    default:
      return () => target;
  }
}

function applyAlphaFactors(simulation, options) {
  ALPHA_FACTORS.forEach((alphaFactorName) => {
    if ({}.hasOwnProperty.call(options, alphaFactorName)) {
      simulation[alphaFactorName](options[alphaFactorName]);
    }
  });

  return simulation;
}

function applyCenterForce(simulation, { height, width }) {
  // setup a new center force if it doesn"t exist.
  if (!simulation.force("center")) {
    simulation.force("center", forceCenter());
  }

  // set the center force to the center of the graph. only update
  // the value if it is not the same as the previous value.
  const centerX = width ? width / 2 : 0;
  if (width > 0 && simulation.force("center").x() !== centerX) {
    simulation.shouldRun = true;
    simulation.force("center").x(centerX);
  }

  const centerY = height ? height / 2 : 0;
  if (height > 0 && simulation.force("center").y() !== centerY) {
    simulation.shouldRun = true;
    simulation.force("center").y(centerY);
  }

  return simulation;
}

function applyManyBodyChargeForce(simulation, { strength = {} }) {
  if (!simulation.force("charge")) {
    simulation.force("charge", forceManyBody());
  }

  if (strength.charge !== simulation.strength.charge) {
    simulation.strength.charge = strength.charge;
    simulation.shouldRun = true;
    simulation.force("charge").strength(asStrengthFn(strength.charge));
  }
}

function applyCollisionForce(simulation, { radiusMargin = 3, strength = {} }) {
  if (!simulation.force("collide")) {
    simulation.force("collide", forceCollide());
  }

  if (simulation.radiusMargin !== radiusMargin) {
    simulation.radiusMargin = radiusMargin;
    simulation.shouldRun = true;
    simulation.force("collide").radius(({ radius }) => radius + radiusMargin);
  }

  if (strength.collide !== simulation.strength.collide) {
    simulation.strength.collide = strength.collide;
    simulation.shouldRun = true;
    simulation.force("collide").strength(asStrengthFn(strength.collide)());
  }
}

function applyLinkForce(simulation, {
  data: { nodes, links },
  linkAttrs = [],
  nodeAttrs = [],
}) {
  // setup the link force if it isn"t already set up
  if (!simulation.force("link")) {
    simulation.force("link", forceLink().id(nodeId));
  }

  // set the nodes and links for this simulation. provide
  // new instances to avoid mutating the underlying values.
  // only update if there are changes.
  const prevNodesSet = new Set(simulation.nodes().map(nodeId));
  const newNodesSet = new Set(nodes.map(nodeId));
  if (!setsEqual(prevNodesSet, newNodesSet)) {
    simulation.shouldRun = true;
    simulation.nodes(
      pick(nodes, "id", "radius", "fx", "fy", ...nodeAttrs)
    );
  }

  const prevLinksSet = new Set(simulation.force("link").links().map(linkId));
  const newLinksSet = new Set(links.map(linkId));
  if (!setsEqual(prevLinksSet, newLinksSet)) {
    simulation.shouldRun = true;
    simulation.force("link").links(
      pick(links, "source", "target", "value", ...linkAttrs)
    );
  }
}

function applyAxisForce(simulation, { strength = {} }) {
  if (!simulation.force("x")) {
    simulation.force("x", forceX());
  }

  if (!simulation.force("y")) {
    simulation.force("y", forceY());
  }

  if (strength.x !== simulation.strength.x) {
    simulation.strength.x = strength.x;
    simulation.shouldRun = true;
    simulation.force("x").strength(asStrengthFn(strength.x));
  }

  if (strength.y !== simulation.strength.y) {
    simulation.strength.y = strength.y;
    simulation.shouldRun = true;
    simulation.force("y").strength(asStrengthFn(strength.y));
  }
}

export function nodeId(node) {
  return node.id;
}

export function linkId(link) {
  return `${link.source.id || link.source}=>${link.target.id || link.target}`;
}

export function runSimulation(simulation) {
  simulation.restart();

  // run the simulation to fruition and stop it.
  while (simulation.alpha() > simulation.alphaMin()) {
    simulation.tick();
  }

  simulation.stop();

  return simulation;
}

export function createSimulation(options) {
  // update center force
  const simulation = forceSimulation();
  simulation.strength = {};
  return updateSimulation(simulation, options);
}

export function updateSimulation(simulation, options) {
  applyAlphaFactors(simulation, options);
  applyCenterForce(simulation, options);
  applyManyBodyChargeForce(simulation, options);
  applyCollisionForce(simulation, options);
  applyLinkForce(simulation, options);
  applyAxisForce(simulation, options);

  if (!options.animate && simulation.shouldRun) {
    runSimulation(simulation);
  }

  simulation.shouldRun = null;

  return simulation;
}
