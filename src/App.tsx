import React from "react";
import ReactDOM from "react-dom";

import useSimilaritiesReducer, { Dispatch, clearUser, updateWeight } from "./useSimilaritiesReducer";
import UserGraph from "./UserGraph";
import UserSearch from "./UserSearch";
import UserTable from "./UserTable";

import { User, Weights } from "./typings";

type UserClearProps = {
  dispatch: Dispatch;
};

const UserClear: React.FC<UserClearProps> = ({ dispatch }) => (
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

type WeightProps = {
  dispatch: Dispatch;
  weightKey: keyof Weights;
  weights: Weights;
};

const Weight: React.FC<WeightProps> = ({ dispatch, weightKey, weights }) => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateWeight({ key: weightKey, value: parseFloat(event.target.value) }));
  };

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

const AppFooter: React.FC = () => ReactDOM.createPortal(
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

type AppHeadingProps = {
  currentUser: null | User;
  dispatch: Dispatch;
};

const AppHeading: React.FC<AppHeadingProps> = ({ currentUser, dispatch }) => {
  if (!currentUser) {
    return <h1>Similarities</h1>;
  }

  return (
    <h1>
      <UserClear dispatch={dispatch} /> {currentUser.name}
    </h1>
  );
};

const App: React.FC = () => {
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
          {Object.keys(weights).map(weightKey => {
            const key = weightKey as keyof typeof weights;

            return <Weight key={key} dispatch={dispatch} weightKey={key} weights={weights} />;
          })}
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
          />
        </section>
      </main>
      <AppFooter />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("main"));
