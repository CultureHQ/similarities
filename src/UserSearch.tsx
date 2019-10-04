import React, { useMemo, useState } from "react";

import { Dispatch, selectUser } from "./useSimilaritiesReducer";

import { User } from "./typings";

type UserSearchProps = {
  dispatch: Dispatch;
  users: User[];
};

const UserSearch: React.FC<UserSearchProps> = ({ dispatch, users }) => {
  const [search, setSearch] = useState("");

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const onUserClick = (clicked: User) => {
    setSearch("");
    dispatch(selectUser(clicked));
  };

  const results = useMemo(
    () => {
      if (!search) {
        return [];
      }

      const term = search.toLowerCase();
      return users.filter(({ name }) => name.toLowerCase().startsWith(term));
    },
    [search, users]
  );

  return (
    <div className="search">
      <input
        type="search"
        value={search}
        onChange={onSearchChange}
        placeholder="Search for a user"
        aria-label="User search"
      />
      {results.length > 0 && (
        <div className="search--results">
          {results.map(result => (
            <button key={result.key} type="button" onClick={() => onUserClick(result)}>
              {result.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
