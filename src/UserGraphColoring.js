import React from "react";

const UserGraphColoringButton = ({ children, coloring, onChangeColoring, value }) => (
  <button type="button" aria-current={coloring === value} onClick={() => onChangeColoring(value)}>
    {children}
  </button>
);

const UserGraphColoring = ({ coloring, onChangeColoring }) => (
  <div className="coloring">
    <UserGraphColoringButton coloring={coloring} onChangeColoring={onChangeColoring} value={null}>
      No color
    </UserGraphColoringButton>
    <UserGraphColoringButton coloring={coloring} onChangeColoring={onChangeColoring} value="location">
      Location
    </UserGraphColoringButton>
    <UserGraphColoringButton coloring={coloring} onChangeColoring={onChangeColoring} value="department">
      Department
    </UserGraphColoringButton>
  </div>
);

export default UserGraphColoring;
