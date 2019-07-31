import React from "react";

import UserRow from "./UserRow";

const makeSort = (compare, user, users) => {
  if (user) {
    const scores = users.reduce(
      (accum, other) => ({ ...accum, [other.key]: compare(user, other) }),
      {}
    );

    return (left, right) => scores[left.key] - scores[right.key];
  }

  return (left, right) => left.name.localeCompare(right.name);
};

const UserTable = ({
  compare, currentUser, departments, dispatch, interests, locations, users
}) => {
  const sorted = [...users].sort(makeSort(compare, currentUser, users));

  return (
    <table>
      <thead>
        <tr>
          <th aria-label="Active" />
          <th>Name</th>
          <th>Location</th>
          <th>Departments</th>
          <th>Interests</th>
          <th>Connections</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(user => (
          <UserRow
            key={user.key}
            departments={departments}
            dispatch={dispatch}
            interests={interests}
            locations={locations}
            user={user}
            users={users}
          />
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
