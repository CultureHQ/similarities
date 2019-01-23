import React, { useState, useCallback, useEffect, useRef, useReducer } from "react";
import ReactDOM from "react-dom";
import Chance from "chance";

const chance = new Chance();

const makeInitialState = () => {
  const locations = Array(5).fill(0).map((_, index) => ({
    key: index,
    name: chance.state({ full: true })
  }));

  const users = Array(30).fill(0).map((_, index) => ({
    key: index,
    locationKey: locations[Math.floor(Math.random() * locations.length)].key,
    name: chance.name(),
    checked: false
  }));

  return {
    locations,
    nextLocationKey: locations.length,
    nextUserKey: users.length,
    users
  };
};

const createUser = user => ({ type: "CREATE_USER", user });

const deleteUser = user => ({ type: "DELETE_USER", user });

const deleteUsers = () => ({ type: "DELETE_USERS" });

const toggleAll = checked => ({ type: "TOGGLE_ALL", checked });

const updateUser = user => ({ type: "UPDATE_USER", user });

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_USER":
      return {
        ...state,
        nextUserKey: state.nextUserKey + 1,
        users: [{ key: state.nextUserKey, checked: false, ...action.user }, ...state.users]
      };
    case "DELETE_USER":
      return { ...state, users: state.users.filter(user => user.key !== action.user.key) };
    case "DELETE_USERS":
      return { ...state, users: state.users.filter(user => !user.checked) };
    case "TOGGLE_ALL":
      return { ...state, users: state.users.map(user => ({ ...user, checked: action.checked })) };
    case "UPDATE_USER":
      return { ...state, users: state.users.map(user => user.key === action.user.key ? action.user : user) };
    default:
      return state;
  }
};

const UserNameInput = ({ cellRef, dispatch, onBlur, user }) => {
  const inputRef = useRef();

  useEffect(() => inputRef.current.focus(), []);

  const onChange = useCallback(
    event => dispatch(updateUser({ ...user, name: event.target.value })), [user]
  );

  useEffect(() => {
    const onClick = event => !cellRef.current.contains(event.target) && onBlur();

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  });

  return <input ref={inputRef} type="text" value={user.name} onChange={onChange} />;
};

const UserNameCell = ({ dispatch, user }) => {
  const cellRef = useRef();
  const [editing, setEditing] = useState(false);

  const onFocus = useCallback(() => setEditing(true), []);
  const onBlur = useCallback(() => setEditing(false), []);

  return (
    <td ref={cellRef} onClick={onFocus}>
      {editing
        ? <UserNameInput cellRef={cellRef} dispatch={dispatch} onBlur={onBlur} user={user} />
        : user.name
      }
    </td>
  );
};

const Row = ({ dispatch, locations, user }) => {
  const onUserCheck = useCallback(
    event => dispatch(updateUser({ ...user, checked: event.target.checked })),
    [dispatch, user]
  );

  const onDelete = useCallback(() => dispatch(deleteUser(user)), [dispatch, user]);

  const onLocationCheck = useCallback(
    event => dispatch(updateUser({ ...user, locationKey: parseInt(event.target.dataset.value) })),
    [dispatch, user]
  );

  return (
    <tr className={user.checked ? "checked" : ""}>
      <td><input type="checkbox" checked={user.checked} onChange={onUserCheck} /></td>
      <UserNameCell dispatch={dispatch} user={user} />
      {locations.map(location => (
        <td key={location.key}>
          <input
            type="checkbox"
            checked={user.locationKey === location.key}
            data-value={location.key}
            onChange={onLocationCheck}
          />
        </td>
      ))}
      <td><button type="button" onClick={onDelete}>x</button></td>
    </tr>
  );
};

const AddRow = ({ dispatch, locations }) => {
  const [name, setName] = useState("");

  const onNameChange = useCallback(event => setName(event.target.value), []);

  const [locationKey, setLocationKey] = useState(locations[0].key);
  const onLocationCheck = useCallback(
    event => setLocationKey(parseInt(event.target.dataset.value)), []
  );

  const onAddClick = useCallback(() => {
    dispatch(createUser({ locationKey, name }));
    setName("");
  }, [locationKey, name]);

  const onNameKeyDown = useCallback(
    event => event.key === "Enter" && onAddClick(), [onAddClick]
  );

  return (
    <tr>
      <td>
        <button type="button" onClick={onAddClick}>+</button>
      </td>
      <td>
        <input type="text" value={name} onChange={onNameChange} onKeyDown={onNameKeyDown} />
      </td>
      {locations.map(location => (
        <td key={location.key}>
          <input
            type="checkbox"
            checked={locationKey === location.key}
            data-value={location.key}
            onChange={onLocationCheck}
          />
        </td>
      ))}
      <td />
    </tr>
  );
};

const Table = ({ dispatch, locations, users }) => {
  const [allChecked, setAllChecked] = useState(false);

  const onAllCheck = useCallback(event => {
    setAllChecked(event.target.checked);
    dispatch(toggleAll(event.target.checked));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>
            <input type="checkbox" checked={allChecked} onChange={onAllCheck} />
          </th>
          <th>Name</th>
          {locations.map(location => (
            <th key={location.key}>
              {location.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <AddRow dispatch={dispatch} locations={locations} />
        {users.map(user => (
          <Row key={user.key} dispatch={dispatch} locations={locations} user={user} />
        ))}
      </tbody>
    </table>
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
  const [{ locations, users }, dispatch] = useReducer(reducer, makeInitialState());

  const onUsersDelete = useCallback(() => dispatch(deleteUsers()), []);

  return (
    <>
      <nav>CultureHQ similarity engine</nav>
      <main>
        {users.some(user => user.checked) && (
          <button type="button" onClick={onUsersDelete}>Delete</button>
        )}
        <Table dispatch={dispatch} locations={locations} users={users} />
      </main>
      <AppFooter />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("main"));
