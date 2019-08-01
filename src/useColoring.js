import { useState } from "react";

const staticColors = ["#8cb4d6", "#79b17d", "#ffd24b"];

const getColorList = size => {
  const colors = [...staticColors];

  for (let idx = 3; idx < size; idx += 1) {
    colors.push(`hsl(${Math.round(Math.random() * 360)}, 33%, 66%)`);
  }

  return colors.slice(0, size);
};

const makeGetColor = (coloring, users) => {
  if (!coloring) {
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

const useColoring = users => {
  const [state, setState] = useState({
    coloring: "location",
    getColor: makeGetColor("location", users)
  });

  const onChangeColoring = coloring => setState({
    coloring, getColor: makeGetColor(coloring, users)
  });

  return { ...state, onChangeColoring };
};

export default useColoring;
