import React, { Fragment } from "react";
import { ForceGraph, ForceGraphNode, ForceGraphLink } from "react-vis-force";

const UserGraph = ({ users }) => {
  const links = users.flatMap(user => (
    user.connectionKeys.map(connectionKey => ({
      key: `${user.key}-${connectionKey}`,
      source: user.key,
      target: connectionKey,
      value: 1
    }))
  ));

  return (
    <ForceGraph simulationOptions={{ height: 400, width: 400 }}>
      {users.map(user => <ForceGraphNode key={user.key} node={{ id: user.key }} />)}
      {links.map(link => <ForceGraphLink key={link.key} link={link} />)}
    </ForceGraph>
  );
};

export default UserGraph;
