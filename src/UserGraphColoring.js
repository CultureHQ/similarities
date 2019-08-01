import React from "react";

const UserGraphColoring = ({ onChangeColoring }) => (
  <div style={{ position: "absolute", left: "2em" }}>
    <ul>
      <li>
        <button type="button" onClick={() => onChangeColoring(null)}>
          None
        </button>
      </li>
      <li>
        <button type="button" onClick={() => onChangeColoring("location")}>
          Location
        </button>
      </li>
      <li>
        <button type="button" onClick={() => onChangeColoring("department")}>
          Department
        </button>
      </li>
    </ul>
  </div>
);

export default UserGraphColoring;
