import React, { useState, useCallback } from "react";
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

const UserRow = ({ user, onUserChange }) => {
  const onChange = useCallback(
    event => onUserChange(user.mutate({ checked: event.target.checked })),
    [user, onUserChange]
  );

  return (
    <tr className={user.checked ? "checked" : ""}>
      <td><input type="checkbox" checked={user.checked} onChange={onChange} /></td>
      <td>{user.name}</td>
    </tr>
  );
};

const Users = ({ users, onUserChange }) => (
  <table>
    <thead>
      <tr>
        <th />
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <UserRow key={user.uuid} user={user} onUserChange={onUserChange} />
      ))}
    </tbody>
  </table>
);

const App = () => {
  const [users, setUsers] = useState(makeUsers());

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
        <Users users={users} onUserChange={onUserChange} />
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
