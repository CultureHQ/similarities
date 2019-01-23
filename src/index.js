import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { seedLocations, seedUsers } from "./seeds";

const makeInitialState = () => {
  const locations = seedLocations.map((name, key) => ({ key, name }));

  const users = seedUsers.map((name, key) => ({
    key,
    locationKey: locations[Math.floor(Math.random() * locations.length)].key,
    name,
    checked: false
  }));

  return {
    currentUser: null,
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

const EditRowCheckbox = ({ dispatch, location, user }) => {
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

const EditRow = ({ dispatch, locations, user }) => {
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

  const onLocationCheck = useCallback(
    event => dispatch(updateUser({ ...user, locationKey: parseInt(event.target.dataset.key) })),
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
              <EditRowCheckbox dispatch={dispatch} location={location} user={user} />
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
      <td />
    </tr>
  );
};

const Row = ({ dispatch, locations, user }) => {
  const Component = user.checked ? EditRow : SummaryRow;

  return <Component dispatch={dispatch} locations={locations} user={user} />;
};

const Table = ({ dispatch, locations, users }) => {
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
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <Row key={user.key} dispatch={dispatch} locations={locations} user={user} />
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

const UserChart = ({ locations, user, users }) => {
  return <div />;
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
  const { currentUser, locations, users } = state;

  return (
    <>
      <nav>CultureHQ similarity engine</nav>
      <main>
        <section>
          <UserSearch dispatch={dispatch} user={currentUser} users={users} />
          <UserChart locations={locations} user={currentUser} users={users} />
        </section>
        <section>
          <Table dispatch={dispatch} locations={locations} users={users} />
        </section>
      </main>
      <AppFooter />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("main"));
