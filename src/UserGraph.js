import React from "react";
import { InteractiveForceGraph, ForceGraphNode, ForceGraphLink } from "react-vis-force";

const UserGraph = ({ users }) => {
  const links = users.flatMap(user => (
    user.connectionKeys.map(connectionKey => ({
      key: `${user.key}-${connectionKey}`,
      source: user.key,
      target: connectionKey,
      value: 0.1
    }))
  ));

  return (
    <InteractiveForceGraph simulationOptions={{ height: 400, width: 400 }} highlightDependencies>
      {users.map(user => <ForceGraphNode key={user.key} node={{ id: user.key }} />)}
      {links.map(link => <ForceGraphLink key={link.key} link={link} />)}
    </InteractiveForceGraph>
  );
};

export default UserGraph;
