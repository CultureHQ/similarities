import React, { useState, useCallback, useEffect, useRef, useReducer } from "react";
import ReactDOM from "react-dom";
import Chance from "chance";

const chance = new Chance();

const makeInitialState = () => ({
  nextKey: 30,
  users: Array(30).fill(0).map((_, index) => ({
    key: index,
    name: chance.name(),
    checked: false
  }))
});

const createUser = user => ({ type: "CREATE_USER", user });

const deleteUsers = () => ({ type: "DELETE_USERS" });

const updateUser = user => ({ type: "UPDATE_USER", user });

const reducer = (state, action) => {
  const { users } = state;

  switch (action.type) {
    case "CREATE_USER":
      return { ...state, nextKey: state.nextKey + 1, users: [{ key: state.nextKey, checked: false, ...action.user }, ...users] };
    case "DELETE_USERS":
      return { ...state, users: users.filter(user => !user.checked) };
    case "UPDATE_USER":
      return { ...state, users: users.map(user => user.key === action.user.key ? action.user : user) };
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

const UserRow = ({ dispatch, user }) => {
  const onCheck = useCallback(
    event => dispatch(updateUser({ ...user, checked: event.target.checked })),
    [dispatch, user]
  );

  return (
    <tr className={user.checked ? "checked" : ""}>
      <td><input type="checkbox" checked={user.checked} onChange={onCheck} /></td>
      <UserNameCell dispatch={dispatch} user={user} />
    </tr>
  );
};

const UserAddRow = ({ dispatch }) => {
  const [name, setName] = useState("");
  const onChange = useCallback(event => setName(event.target.value), []);

  const onAddClick = useCallback(() => {
    dispatch(createUser({ name }));
    setName("");
  }, [name]);

  const onKeyDown = useCallback(
    event => event.key === "Enter" && onAddClick(), [onAddClick]
  );

  return (
    <tr>
      <td>
        <button type="button" onClick={onAddClick}>+</button>
      </td>
      <td>
        <input type="text" value={name} onChange={onChange} onKeyDown={onKeyDown} />
      </td>
    </tr>
  );
};

const Users = ({ dispatch, users }) => (
  <table>
    <thead>
      <tr>
        <th />
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      <UserAddRow dispatch={dispatch} />
      {users.map(user => (
        <UserRow key={user.key} dispatch={dispatch} user={user} />
      ))}
    </tbody>
  </table>
);

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
  const [{ users }, dispatch] = useReducer(reducer, makeInitialState());

  const onUsersDelete = useCallback(() => dispatch(deleteUsers()), []);

  return (
    <>
      <nav>CultureHQ similarity engine</nav>
      <main>
        {users.some(user => user.checked) && (
          <button type="button" onClick={onUsersDelete}>Delete</button>
        )}
        <Users dispatch={dispatch} users={users} />
      </main>
      <AppFooter />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("main"));
