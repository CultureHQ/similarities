import React from "react";

import UserRow from "./UserRow";
import { Dispatch } from "./useSimilaritiesReducer";

import { Compare, Department, Interests, Location, User } from "./typings";

const makeSort = (compare: Compare, user: null | User, users: User[]) => {
  if (user) {
    const scores = users.reduce(
      (accum, other) => ({ ...accum, [other.key]: compare(user, other) }),
      {} as { [key: number]: number }
    );

    return (left: User, right: User) => scores[left.key] - scores[right.key];
  }

  return (left: User, right: User) => left.name.localeCompare(right.name);
};

type UserTableProps = {
  compare: Compare;
  currentUser: null | User;
  departments: Department[];
  dispatch: Dispatch;
  interests: Interests;
  locations: Location[];
  users: User[];
};

const UserTable: React.FC<UserTableProps> = ({
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
