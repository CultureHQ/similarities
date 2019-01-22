import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Chance from "chance";
import uuid from "uuid/v4";

const INITIAL_USER_COUNT = 30;

const chance = new Chance();

class User {
  constructor(opts = {}) {
    this.uuid = opts.uuid || uuid();
    this.name = opts.name || chance.name();
    this.checked = opts.checked || false;
  }

  mutate(change) {
    return new User({
      uuid: this.uuid,
      name: this.name,
      checked: this.checked,
      ...change
    });
  }
}

const makeUsers = () => (
  Array(INITIAL_USER_COUNT).fill(0).map(() => new User())
);

const UserNameInput = ({ cellRef, user, onUserChange, onBlur }) => {
  const inputRef = useRef();

  useEffect(() => inputRef.current.focus(), []);

  const onChange = useCallback(
    event => onUserChange(user.mutate({ name: event.target.value })), [user]
  );

  useEffect(() => {
    const onClick = event => !cellRef.current.contains(event.target) && onBlur();

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  });

  return <input ref={inputRef} type="text" value={user.name} onChange={onChange} />;
};

const UserNameCell = ({ user, onUserChange }) => {
  const cellRef = useRef();
  const [editing, setEditing] = useState(false);

  const onFocus = useCallback(() => setEditing(true), []);
  const onBlur = useCallback(() => setEditing(false), []);

  return (
    <td ref={cellRef} onClick={onFocus}>
      {editing
        ? <UserNameInput cellRef={cellRef} user={user} onUserChange={onUserChange} onBlur={onBlur} />
        : user.name
      }
    </td>
  );
};

const UserRow = ({ user, onUserChange }) => {
  const onCheck = useCallback(
    event => onUserChange(user.mutate({ checked: event.target.checked })),
    [user, onUserChange]
  );

  return (
    <tr className={user.checked ? "checked" : ""}>
      <td><input type="checkbox" checked={user.checked} onChange={onCheck} /></td>
      <UserNameCell user={user} onUserChange={onUserChange} />
    </tr>
  );
};

const UserAddRow = ({ onUserAdd }) => {
  const [name, setName] = useState("");

  const onChange = useCallback(event => setName(event.target.value), []);

  const onAddClick = useCallback(() => {
    onUserAdd(new User({ name }));
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

const Users = ({ users, onUserAdd, onUserChange }) => (
  <table>
    <thead>
      <tr>
        <th />
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      <UserAddRow onUserAdd={onUserAdd} />
      {users.map(user => (
        <UserRow key={user.uuid} user={user} onUserChange={onUserChange} />
      ))}
    </tbody>
  </table>
);

const App = () => {
  const [users, setUsers] = useState(makeUsers());

  const onUserAdd = useCallback(user => setUsers(value => [user, ...value]), []);

  const onUserChange = useCallback(
    user => setUsers(value => value.map(prev => prev.uuid === user.uuid ? user : prev)), []
  );

  const onUsersRemove = useCallback(
    () => setUsers(value => value.filter(prev => !prev.checked)), []
  );

  return (
    <>
      <nav>CultureHQ similarity engine</nav>
      <main>
        {users.some(user => user.checked) && (
          <button type="button" onClick={onUsersRemove}>Remove</button>
        )}
        <Users users={users} onUserAdd={onUserAdd} onUserChange={onUserChange} />
      </main>
      {ReactDOM.createPortal(
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
      )}
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("main"));
