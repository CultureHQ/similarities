import React from "react";
import ReactDOM from "react-dom";

import useSimilaritiesReducer, { clearUser, updateWeight } from "./useSimilaritiesReducer";
import UserGraph from "./UserGraph";
import UserRow from "./UserRow";
import UserSearch from "./UserSearch";

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

const Table = ({ compare, currentUser, departments, dispatch, interests, locations, users }) => {
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

const getCoords = percent => [
  Math.cos(2 * Math.PI * percent),
  Math.sin(2 * Math.PI * percent)
];

const UserChart = ({ compare, user, users }) => {
  const interval = 1 / (users.length - 1);
  let cursor = -0.25;

  const slices = users.filter(({ key }) => key !== user.key).map(other => {
    const scale = compare(user, other);
    const stroke = `hsl(${120 * (1 - scale)}, 100%, 45%)`;

    const [x, y] = getCoords(cursor + (interval / 2));
    cursor += interval;

    return {
      key: other.key,
      initials: other.name.replace(/[^A-Z]/g, ""),
      line: {
        x1: 0,
        y1: 0,
        x2: x * (0.9 - 0.075) * scale,
        y2: y * (0.9 - 0.075) * scale,
        stroke,
        strokeWidth: 0.01
      },
      circle: { cx: x * 0.9 * scale, cy: y * 0.9 * scale, r: 0.075, fill: "transparent", stroke, strokeWidth: 0.01 },
      text: { x: x * 0.9 * scale, y: y * 0.9 * scale, fontSize: "0.075px", textAnchor: "middle", dy: 0.03 }
    };
  });

  return (
    <svg className="user-chart" viewBox="-1 -1 2 2">
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

const UserClear = ({ dispatch }) => (
  <button className="inline-btn" type="button" onClick={() => dispatch(clearUser())}>
    <svg viewBox="0 0 16 16">
      <g>
        <circle cx="8" cy="8" r="6" />
        <path d="M 5 5 l 6 6 z" />
        <path d="M 11 5 l -6 6 z" />
      </g>
    </svg>
  </button>
);

const Weight = ({ dispatch, weightKey, weights }) => {
  const onChange = event => dispatch(updateWeight({ key: weightKey, value: event.target.value }));

  return (
    <label htmlFor={weightKey}>
      {`${weightKey[0].toUpperCase()}${weightKey.slice(1)} `}
      <input
        aria-label={weightKey}
        name={weightKey}
        id={weightKey}
        type="number"
        min={0}
        step={0.1}
        max={3}
        value={weights[weightKey]}
        onChange={onChange}
      />
    </label>
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
  const [state, dispatch] = useSimilaritiesReducer();
  const { compare, currentUser, departments, interests, locations, users, weights } = state;

  return (
    <>
      <nav>
        CultureHQ similarity engine
      </nav>
      <main>
        <header>
          <UserSearch dispatch={dispatch} users={users} />
          {currentUser && users.length > 1
            ? (
              <>
                <h1>
                  <UserClear dispatch={dispatch} /> {currentUser.name}
                </h1>
                <UserChart compare={compare} user={currentUser} users={users} />
              </>
            )
            : (
              <>
                <h1>Similarities</h1>
                <UserGraph users={users} />
              </>
            )
          }
        </header>
        <section className="weights">
          {Object.keys(weights).map(weightKey => (
            <Weight key={weightKey} dispatch={dispatch} weightKey={weightKey} weights={weights} />
          ))}
        </section>
        <section>
          <Table
            compare={compare}
            currentUser={currentUser}
            departments={departments}
            dispatch={dispatch}
            interests={interests}
            locations={locations}
            users={users}
            weights={weights}
          />
        </section>
      </main>
      <AppFooter />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("main"));
