import { useState } from "react";

import { User } from "./typings";

type Coloring = null | "location" | "department";

const staticColors = ["#8cb4d6", "#79b17d", "#ffd24b"];

const getColorList = (size: number) => {
  const colors = [...staticColors];

  for (let idx = 3; idx < size; idx += 1) {
    colors.push(`hsl(${Math.round(Math.random() * 360)}, 33%, 66%)`);
  }

  return colors.slice(0, size);
};

const makeGetColor = (coloring: Coloring, users: User[]) => {
  if (!coloring) {
    return () => "#333";
  }

  let getKey: (user: User) => number;
  if (coloring === "location") {
    getKey = user => user.locationKey;
  } else if (coloring === "department") {
    getKey = user => user.departmentKeys[0];
  }

  const keyColors: { [key: number]: string } = {};
  users.forEach(user => {
    const keyColor = getKey(user);

    if (keyColor && !Object.prototype.hasOwnProperty.call(keyColors, keyColor)) {
      keyColors[keyColor] = "#333";
    }
  });

  const colorList = getColorList(Object.keys(keyColors).length);
  Object.keys(keyColors).forEach((key, index) => {
    // Ugh Object.keys typing. I know this is going to be a number. Trust me.
    keyColors[key as unknown as number] = colorList[index];
  });

  return (user: User) => keyColors[getKey(user)] || "#333";
};

type ColoringState = {
  coloring: Coloring;
  getColor: (user: User) => string;
};

const useColoring = (users: User[]) => {
  const [state, setState] = useState<ColoringState>({
    coloring: "location",
    getColor: makeGetColor("location", users)
  });

  const onChangeColoring = (coloring: Coloring) => setState({
    coloring, getColor: makeGetColor(coloring, users)
  });

  return { ...state, onChangeColoring };
};

export default useColoring;
