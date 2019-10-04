import React from "react";

import { Coloring, ColoringChange } from "./useColoring";

type UserGraphColoringButtonProps = {
  children: React.ReactNode;
  coloring: Coloring;
  onChangeColoring: ColoringChange;
  value: Coloring;
};

const UserGraphColoringButton: React.FC<UserGraphColoringButtonProps> = ({
  children, coloring, onChangeColoring, value
}) => (
  <button type="button" aria-current={coloring === value} onClick={() => onChangeColoring(value)}>
    {children}
  </button>
);

type UserGraphColoringProps = {
  coloring: Coloring;
  onChangeColoring: ColoringChange;
};

const UserGraphColoring: React.FC<UserGraphColoringProps> = ({ coloring, onChangeColoring }) => (
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
