import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { seedDepartments, seedLocations, seedUsers } from "./seeds";

const makeInitialState = () => {
  const departments = seedDepartments.map((name, key) => ({ key, name }));
  const departmentKeys = departments.map(({ key }) => key);

  const locations = seedLocations.map((name, key) => ({ key, name }));

  const users = seedUsers.map((name, key) => ({
    key,
    departmentKeys: departmentKeys.filter(() => Math.random() < 0.2),
    locationKey: locations[Math.floor(Math.random() * locations.length)].key,
    name,
    checked: false
  }));

  return {
    currentUser: null,
    departments,
    locations,
    users
  };
};

const deleteUser = user => ({ type: "DELETE_USER", user });

const selectUser = user => ({ type: "SELECT_USER", user });

const toggleAll = checked => ({ type: "TOGGLE_ALL", checked });

const updateUser = user => ({ type: "UPDATE_USER", user });

const reducer = (state, action) => {
  switch (action.type) {
    case "DELETE_USER":
      return { ...state, users: state.users.filter(user => user.key !== action.user.key) };
    case "SELECT_USER":
      return { ...state, currentUser: action.user };
    case "TOGGLE_ALL":
      return { ...state, users: state.users.map(user => ({ ...user, checked: action.checked })) };
    case "UPDATE_USER":
      return { ...state, users: state.users.map(user => user.key === action.user.key ? action.user : user) };
    default:
      return state;
  }
};

const EditUserLocation = ({ dispatch, location, user }) => {
  const name = `ul-${user.key}-${location.key}`;

  const onLocationCheck = useCallback(
    event => dispatch(updateUser({ ...user, locationKey: parseInt(event.target.dataset.key) })),
    [dispatch, user]
  );

  return (
    <label htmlFor={name}>
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={location.key === user.locationKey}
        onChange={onLocationCheck}
        data-key={location.key}
      />
      {" "}
      {location.name}
    </label>
  );
};

const EditUserDepartment = ({ department, dispatch, user }) => {
  const name = `ud-${user.key}-${department.key}`;

  const onDepartmentCheck = useCallback(
    event => dispatch(updateUser({
      ...user,
      departmentKeys: (
        event.target.checked
        ? [...user.departmentKeys, department.key]
        : user.departmentKeys.filter(departmentKey => departmentKey !== department.key)
      )
    })),
    [department, dispatch, user]
  );

  return (
    <label htmlFor={name}>
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={user.departmentKeys.includes(department.key)}
        onChange={onDepartmentCheck}
      />
      {" "}
      {department.name}
    </label>
  );
};

const EditRow = ({ departments, dispatch, locations, user }) => {
  const onNameChange = useCallback(
    event => dispatch(updateUser({ ...user, name: event.target.value })),
    [dispatch, user]
  );

  const onUserUncheck = useCallback(
    () => dispatch(updateUser({ ...user, checked: false })),
    [dispatch, user]
  );

  const onUserDelete = useCallback(
    () => dispatch(deleteUser(user)),
    [dispatch, user]
  );

  return (
    <tr className="checked">
      <td>
        <input type="checkbox" checked onChange={onUserUncheck} />
      </td>
      <td>
        <input type="text" value={user.name} onChange={onNameChange} />
      </td>
      <td>
        <ul>
          {locations.map(location => (
            <li key={location.key}>
              <EditUserLocation dispatch={dispatch} location={location} user={user} />
            </li>
          ))}
        </ul>
      </td>
      <td>
        <ul>
          {departments.map(department => (
            <li key={department.key}>
              <EditUserDepartment department={department} dispatch={dispatch} user={user} />
            </li>
          ))}
        </ul>
      </td>
      <td>
        <button type="button" onClick={onUserDelete}>x</button>
      </td>
    </tr>
  );
};

const SummaryRow = ({ departments, dispatch, locations, user }) => {
  const onUserCheck = useCallback(
    () => dispatch(updateUser({ ...user, checked: true })), [dispatch, user]
  );

  return (
    <tr>
      <td>
        <input type="checkbox" checked={false} onChange={onUserCheck} />
      </td>
      <td>
        {user.name}
      </td>
      <td>
        {locations.find(location => location.key === user.locationKey).name}
      </td>
      <td>
        {user.departmentKeys.map(departmentKey => (
          departments.find(department => department.key === departmentKey).name
        )).join(", ")}
      </td>
      <td />
    </tr>
  );
};

const Row = ({ departments, dispatch, locations, user }) => {
  const Component = user.checked ? EditRow : SummaryRow;

  return (
    <Component
      departments={departments}
      dispatch={dispatch}
      locations={locations}
      user={user}
    />
  );
};

const Table = ({ departments, dispatch, locations, users }) => {
  const [allChecked, setAllChecked] = useState(false);

  const onAllCheck = useCallback(event => {
    setAllChecked(event.target.checked);
    dispatch(toggleAll(event.target.checked));
  }, [dispatch]);

  return (
    <table>
      <thead>
        <tr>
          <th>
            <input type="checkbox" checked={allChecked} onChange={onAllCheck} />
          </th>
          <th>
            Name
          </th>
          <th>
            Location
          </th>
          <th>
            Departments
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <Row
            key={user.key}
            departments={departments}
            dispatch={dispatch}
            locations={locations}
            user={user}
          />
        ))}
      </tbody>
    </table>
  );
};

const UserSearch = ({ dispatch, user, users }) => {
  const [search, setSearch] = useState("");
  const onSearchChange = useCallback(event => setSearch(event.target.value), []);

  const onUserClick = useCallback(clicked => {
    setSearch("");
    dispatch(selectUser(clicked));
  }, [dispatch]);

  const results = useMemo(() => {
    if (!search) {
      return [];
    }

    const term = search.toLowerCase();
    return users.filter(({ name }) => name.toLowerCase().startsWith(term));
  }, [search, users]);

  return (
    <div>
      <input type="text" value={search} onChange={onSearchChange} />
      {results.length > 0 && (
        <div>
          {results.map(result => (
            <button key={result.key} onClick={() => onUserClick(result)}>
              {result.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const makeCompare = (departments, locations, users) => (left, right) => {
  const locationScore = (left.locationKey === right.locationKey ? 1 : 0) * locations.length;
  const departmentScore = left.departmentKeys.filter(departmentKey => right.departmentKeys.includes(departmentKey)).length * departments.length;

  return 0.5 / (locationScore + departmentScore + 1) + 0.5;
};

const getCoords = percent => [
  Math.cos(2 * Math.PI * percent),
  Math.sin(2 * Math.PI * percent)
];

const UserChart = ({ departments, locations, user, users }) => {
  const compare = useMemo(() => makeCompare(departments, locations, users), [locations, users]);

  const interval = 1 / (users.length - 1);
  let cursor = -0.25;

  const slices = users.filter(({ key }) => key !== user.key).map(other => {
    const scale = compare(user, other);
    const [x, y] = getCoords(cursor + (interval / 2));
    cursor += interval;

    return {
      key: other.key,
      initials: other.name.replace(/[^A-Z]/g, ""),
      line: { x1: 0, y1: 0, x2: x * (0.9 - 0.075) * scale, y2: y * (0.9 - 0.075) * scale, stroke: "#666", strokeWidth: 0.01 },
      circle: { cx: x * 0.9 * scale, cy: y * 0.9 * scale, r: 0.075, fill: "transparent", stroke: "#666", strokeWidth: 0.01 },
      text: { x: x * 0.9 * scale, y: y * 0.9 * scale, fontSize: "0.075px", textAnchor: "middle", dy: 0.03 }
    };
  });

  return (
    <svg viewBox="-1 -1 2 2">
      {slices.map(slice => (
        <g key={slice.key}>
          <line {...slice.line} />
          <circle {...slice.circle} />
          <text {...slice.text}>
            {slice.initials}
          </text>
        </g>
      ))}
    </svg>
  );
};

const AppFooter = () => ReactDOM.createPortal(
  <footer>
    <p>
      Copyright (c) 2019 CultureHQ
      <br />
      <a href="https://culturehq.com">
        culturehq.com
      </a>
    </p>
  </footer>,
  document.body
);

const App = () => {
  const [state, dispatch] = useReducer(reducer, makeInitialState());
  const { currentUser, departments, locations, users } = state;

  return (
    <>
      <nav>CultureHQ similarity engine</nav>
      <main>
        <section style={{ textAlign: "center" }}>
          <UserSearch dispatch={dispatch} user={currentUser} users={users} />
          {currentUser && users.length > 1 && (
            <>
              <h1>{currentUser.name}</h1>
              <UserChart
                departments={departments}
                locations={locations}
                user={currentUser}
                users={users}
              />
            </>
          )}
        </section>
        <section>
          <Table
            departments={departments}
            dispatch={dispatch}
            locations={locations}
            users={users}
          />
        </section>
      </main>
      <AppFooter />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("main"));
