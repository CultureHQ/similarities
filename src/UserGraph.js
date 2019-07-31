import React from "react";
import { InteractiveForceGraph, ForceGraphNode, ForceGraphLink } from "react-vis-force";

const makeUserLinks = (compare, user, users) => user.connectionKeys.map(connectionKey => ({
  key: `${user.key}-${connectionKey}`,
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
  const links = makeGraphLinks(compare, currentUser, users);

  return (
    <InteractiveForceGraph simulationOptions={{ height: 400, width: 400 }} highlightDependencies>
      {users.map(user => <ForceGraphNode key={user.key} node={{ id: user.key }} />)}
      {links.map(link => <ForceGraphLink key={link.key} link={link} />)}
    </InteractiveForceGraph>
  );
};

export default UserGraph;
