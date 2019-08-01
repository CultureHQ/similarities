import React, { useState } from "react";

import ForceGraph from "./ForceGraph";
import UserGraphColoring from "./UserGraphColoring";
import useColoring from "./useColoring";

const makeUserLinks = (compare, user, users) => user.connectionKeys.map(
  connectionKey => ({ source: user.key, target: connectionKey })
);

const makeGraphLinks = (compare, currentUser, users) => {
  if (currentUser) {
    return makeUserLinks(compare, currentUser, users);
  }
  return users.flatMap(user => makeUserLinks(compare, user, users));
};

const UserGraph = ({ compare, currentUser, users }) => {
  const [getColor, onChangeColoring] = useColoring(users);

  const nodes = users.map(user => ({ index: user.key, label: user.initials, color: getColor(user) }));
  const links = makeGraphLinks(compare, currentUser, users);

  return (
    <>
      <UserGraphColoring onChangeColoring={onChangeColoring} />
      <ForceGraph height={400} links={links} nodes={nodes} width={400} />
    </>
  );
};

export default UserGraph;
