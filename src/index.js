import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { seedDepartments, seedLocations, seedUsers } from "./seeds";
import seedInterests from "./interests.json";

const makeInitialState = () => {
  const departments = seedDepartments.map((name, key) => ({ key, name }));
  const departmentKeys = departments.map(({ key }) => key);

  const interests = {};
  const interestKeys = [];

  Object.keys(seedInterests).forEach(key => {
    interests[key] = seedInterests[key].map(interest => {
      const key = interestKeys.length;
      interestKeys.push(key);

      return { key, name: interest };
    });
  });

  const locations = seedLocations.map((name, key) => ({ key, name }));

  const users = seedUsers.map((name, key) => ({
    key,
    departmentKeys: departmentKeys.filter(() => Math.random() < 0.3),
    interestKeys: interestKeys.filter(() => Math.random() < 0.1),
    locationKey: locations[Math.floor(Math.random() * locations.length)].key,
    name,
    checked: false
  }));

  return {
    currentUser: null,
    departments,
    interests,
    locations,
    users
  };
};

const deleteUser = user => ({ type: "DELETE_USER", user });

const selectUser = user => ({ type: "SELECT_USER", user });

const updateUser = user => ({ type: "UPDATE_USER", user });

const reducer = (state, action) => {
  switch (action.type) {
    case "DELETE_USER":
      return { ...state, users: state.users.filter(user => user.key !== action.user.key) };
    case "SELECT_USER":
      return { ...state, currentUser: action.user };
    case "UPDATE_USER":
      return {
        ...state,
        currentUser: state.currentUser && state.currentUser.key === action.user.key ? action.user : state.currentUser,
        users: state.users.map(user => user.key === action.user.key ? action.user : user)
      };
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

const EditUserInterest = ({ dispatch, interest, user }) => {
  const name = `ui-${user.key}-${interest.key}`;

  const onInterestCheck = useCallback(
    event => dispatch(updateUser({
      ...user,
      interestKeys: (
        event.target.checked
        ? [...user.interestKeys, interest.key]
        : user.interestKeys.filter(interestKey => interestKey !== interest.key)
      )
    })),
    [dispatch, interest, user]
  );

  return (
    <label htmlFor={name}>
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={user.interestKeys.includes(interest.key)}
        onChange={onInterestCheck}
      />
      {" "}
      {interest.name}
    </label>
  );
};

const EditUserInterestCategory = ({ currentInterestKey, dispatch, interestKey, interests, setCurrentInterestKey, user }) => {
  const name = `uic-${user.key}-${interestKey}`;
  const checked = currentInterestKey === interestKey;

  return (
    <li>
      <label htmlFor={name}>
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={event => setCurrentInterestKey(event.target.checked ? interestKey : null)}
        />
        {" "}
        {interestKey}
      </label>
      {checked && (
        <ul>
          {interests[interestKey].map(interest => (
            <li key={interest.key}>
              <EditUserInterest dispatch={dispatch} interest={interest} user={user} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const EditRow = ({ departments, dispatch, interests, locations, user }) => {
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

  const [currentInterestKey, setCurrentInterestKey] = useState(null);

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
        <ul>
          {Object.keys(interests).map(key => (
            <EditUserInterestCategory
              key={key}
              currentInterestKey={currentInterestKey}
              dispatch={dispatch}
              interestKey={key}
              interests={interests}
              setCurrentInterestKey={setCurrentInterestKey}
              user={user}
            />
          ))}
        </ul>
      </td>
      <td>
        <button type="button" onClick={onUserDelete}>x</button>
      </td>
    </tr>
  );
};

const SummaryRow = ({ dispatch, locations, user }) => {
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
        {user.departmentKeys.length} departments
      </td>
      <td>
        {user.interestKeys.length} interests
      </td>
      <td />
    </tr>
  );
};

const Row = props => {
  const Component = props.user.checked ? EditRow : SummaryRow;

  return <Component {...props} />;
};

const I = 0.2;

const makeCompare = (departments, interests, locations, user, users) => {
  const interestsLength = Object.keys(interests).reduce((accum, key) => accum + interests[key].length, 0);
  const maximum = Math.pow(departments.length, 2) + I * interestsLength + locations.length;

  return other => {
    const departmentScore = user.departmentKeys.filter(departmentKey => other.departmentKeys.includes(departmentKey)).length * departments.length;
    const interestScore = user.interestKeys.filter(interestKey => other.interestKeys.includes(interestKey)).length;
    const locationScore = (user.locationKey === other.locationKey ? 1 : 0) * locations.length;

    return (maximum - departmentScore - I * interestScore - locationScore) / maximum;
  };
};

const makeSort = (departments, interests, locations, user, users) => {
  if (user) {
    const compare = makeCompare(departments, interests, locations, user, users);
    const scores = users.reduce((accum, other) => ({ ...accum, [other.key]: compare(other) }), {});

    return (left, right) => scores[left.key] - scores[right.key];
  }

  return (left, right) => left.name.localeCompare(right.name);
};

const Table = ({ currentUser, departments, dispatch, interests, locations, users }) => {
  const sorted = [...users].sort(makeSort(departments, interests, locations, currentUser, users));

  return (
    <table>
      <thead>
        <tr>
          <th />
          <th>
            Name
          </th>
          <th>
            Location
          </th>
          <th>
            Departments
          </th>
          <th>
            Interests
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        {sorted.map(user => (
          <Row
            key={user.key}
            departments={departments}
            dispatch={dispatch}
            interests={interests}
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

const getCoords = percent => [
  Math.cos(2 * Math.PI * percent),
  Math.sin(2 * Math.PI * percent)
];

const UserChart = ({ departments, interests, locations, user, users }) => {
  const interval = 1 / (users.length - 1);
  let cursor = -0.25;

  const compare = makeCompare(departments, interests, locations, user, users);
  const slices = users.filter(({ key }) => key !== user.key).map(other => {
    const scale = compare(other);
    const stroke = `hsl(${120 * (1 - scale) * 3}, 100%, 45%)`;

    const [x, y] = getCoords(cursor + (interval / 2));
    cursor += interval;

    return {
      key: other.key,
      initials: other.name.replace(/[^A-Z]/g, ""),
      line: { x1: 0, y1: 0, x2: x * (0.9 - 0.075) * scale, y2: y * (0.9 - 0.075) * scale, stroke, strokeWidth: 0.01 },
      circle: { cx: x * 0.9 * scale, cy: y * 0.9 * scale, r: 0.075, fill: "transparent", stroke, strokeWidth: 0.01 },
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
  const { currentUser, departments, interests, locations, users } = state;

  return (
    <>
      <nav>CultureHQ similarity engine</nav>
      <main>
        <header>
          <UserSearch dispatch={dispatch} user={currentUser} users={users} />
          {currentUser && users.length > 1 && (
            <>
              <h1>{currentUser.name}</h1>
              <UserChart
                departments={departments}
                interests={interests}
                locations={locations}
                user={currentUser}
                users={users}
              />
            </>
          )}
        </header>
        <section>
          <Table
            currentUser={currentUser}
            departments={departments}
            dispatch={dispatch}
            interests={interests}
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
