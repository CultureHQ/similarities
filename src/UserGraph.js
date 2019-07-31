import React from "react";
import { ForceGraph, ForceGraphNode, ForceGraphLink } from "./graph/ForceGraph";

const makeUserLinks = (compare, user, users) => user.connectionKeys.map(connectionKey => ({
  id: `${user.key}-${connectionKey}`,
  source: user.key,
  target: connectionKey,
  value: compare(user, users.find(other => other.key === connectionKey))
}));

const makeGraphLinks = (compare, currentUser, users) => {
  if (currentUser) {
    return makeUserLinks(compare, currentUser, users);
  }
  return users.flatMap(user => makeUserLinks(compare, user, users));
};

const UserGraph = ({ compare, currentUser, users }) => {
  const nodes = users.map(user => ({ id: user.key, label: user.initials }));
  const links = makeGraphLinks(compare, currentUser, users);

  return (
    <ForceGraph nodes={nodes} links={links}>
      {nodes.map(node => <ForceGraphNode key={node.id} node={node} />)}
      {links.map(link => <ForceGraphLink key={link.id} link={link} />)}
    </ForceGraph>
  );
};

export default UserGraph;
