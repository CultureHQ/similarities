import React, { useState } from "react";

import ForceGraph from "./ForceGraph";

const staticColors = ["#8cb4d6", "#79b17d", "#ffd24b"];

const getColorList = size => {
  const colors = [...staticColors];

  for (let idx = 3; idx < size; idx += 1) {
    colors.push(`hsl(${Math.round(Math.random() * 360)}, 33%, 66%)`);
  }

  return colors.slice(0, size);
};

const makeGetFill = (coloring, users) => {
  if (coloring === null) {
    return () => "#333";
  }

  let getKey;
  if (coloring === "location") {
    getKey = user => user.locationKey;
  } else if (coloring === "department") {
    getKey = user => user.departmentKeys[0];
  }

  const keyColors = {};
  users.forEach(user => {
    if (!Object.prototype.hasOwnProperty.call(keyColors, getKey(user))) {
      keyColors[user.locationKey] = null;
    }
  });

  const colorList = getColorList(Object.keys(keyColors).length);
  Object.keys(keyColors).forEach((key, index) => {
    keyColors[key] = colorList[index];
  });

  return user => keyColors[getKey(user)] || "#333";
};

const makeUserLinks = (compare, user, users) => user.connectionKeys.map(connectionKey => ({
  id: `${user.key}-${connectionKey}`,
  source: user.key,
  target: connectionKey,
  value: compare(user, users.find(otherUser => otherUser.key === connectionKey))
}));

const makeGraphLinks = (compare, currentUser, users) => {
  if (currentUser) {
    return makeUserLinks(compare, currentUser, users);
  }
  return users.flatMap(user => makeUserLinks(compare, user, users));
};

const UserGraph = ({ compare, currentUser, users }) => {
  const [coloring, setColoring] = useState(null);
  const getFill = makeGetFill(coloring, users);

  const nodes = users.map(user => ({ id: user.key, label: user.initials, fill: getFill(user) }));
  const links = makeGraphLinks(compare, currentUser, users);

  return (
    <>
      <div style={{ position: "absolute", left: "2em" }}>
        <ul>
          <li>
            <button type="button" onClick={() => setColoring(null)}>
              None
            </button>
          </li>
          <li>
            <button type="button" onClick={() => setColoring("location")}>
              Location
            </button>
          </li>
          <li>
            <button type="button" onClick={() => setColoring("department")}>
              Department
            </button>
          </li>
        </ul>
      </div>
      <ForceGraph height={400} links={links} nodes={nodes} width={400} />
    </>
  );
};

export default UserGraph;
