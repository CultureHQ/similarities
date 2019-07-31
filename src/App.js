import React from "react";
import ReactDOM from "react-dom";

import useSimilaritiesReducer, { clearUser, updateWeight } from "./useSimilaritiesReducer";
import UserGraph from "./UserGraph";
import UserSearch from "./UserSearch";
import UserTable from "./UserTable";

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

const AppHeading = ({ currentUser, dispatch }) => {
  if (!currentUser) {
    return <h1>Similarities</h1>;
  }

  return (
    <h1>
      <UserClear dispatch={dispatch} /> {currentUser.name}
    </h1>
  );
};

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
          <AppHeading currentUser={currentUser} dispatch={dispatch} />
          <UserGraph compare={compare} currentUser={currentUser} users={users} />
        </header>
        <section className="weights">
          {Object.keys(weights).map(weightKey => (
            <Weight key={weightKey} dispatch={dispatch} weightKey={weightKey} weights={weights} />
          ))}
        </section>
        <section>
          <UserTable
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
