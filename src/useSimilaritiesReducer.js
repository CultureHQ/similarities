import { useReducer } from "react";

import seedDepartments from "./seeds/departments.json";
import seedInterests from "./seeds/interests.json";
import seedLocations from "./seeds/locations.json";
import seedUsers from "./seeds/users.json";

import makeCompare from "./makeCompare";

const makeConnectionMaker = users => {
  const getKey = () => Math.floor(Math.random() * users.length);

  return () => {
    let left = getKey();
    let right = getKey();

    while (left === right || users[left].connectionKeys.includes(right)) {
      left = getKey();
      right = getKey();
    }

    users[left].connectionKeys.push(right);
    users[right].connectionKeys.push(left);
  };
};

const makeInitialState = () => {
  const departments = seedDepartments.map((name, key) => ({ key, name }));
  const departmentKeys = departments.map(({ key }) => key);

  const interests = {};
  const interestKeys = [];

  Object.keys(seedInterests).forEach(key => {
    interests[key] = seedInterests[key].map(interest => {
      interestKeys.push(interestKeys.length);

      return { key: interestKeys.length, name: interest };
    });
  });

  const locations = seedLocations.map((name, key) => ({ key, name }));

  const users = seedUsers.map((name, key) => ({
    key,
    connectionKeys: [],
    departmentKeys: departmentKeys.filter(() => Math.random() < 0.3),
    interestKeys: interestKeys.filter(() => Math.random() < 0.1),
    locationKey: locations[Math.floor(Math.random() * locations.length)].key,
    name,
    initials: name.split(" ").map(part => part[0]).join(""),
    checked: false
  }));

  const makeConnection = makeConnectionMaker(users);
  Array(users.length * 5).fill(0).forEach(() => {
    makeConnection();
  });

  const state = {
    currentUser: null,
    departments,
    interests,
    locations,
    weights: {
      connected: 1,
      connections: 0.8,
      interests: 0.6,
      departments: 0.4,
      locations: 0.2
    },
    users
  };

  return { ...state, compare: makeCompare(state) };
};

export const clearUser = () => ({ type: "CLEAR_USER" });

export const selectUser = user => ({ type: "SELECT_USER", user });

export const updateUser = user => ({ type: "UPDATE_USER", user });

export const updateWeight = ({ key, value }) => ({ type: "UPDATE_WEIGHT", key, value });

const reducer = (state, action) => {
  switch (action.type) {
    case "CLEAR_USER":
      return { ...state, currentUser: null };
    case "SELECT_USER":
      return { ...state, currentUser: action.user };
    case "UPDATE_USER": {
      const { currentUser } = state;
      const nextState = {
        ...state,
        currentUser: currentUser && currentUser.key === action.user.key ? action.user : currentUser,
        users: state.users.map(user => (user.key === action.user.key ? action.user : user))
      };

      return { ...nextState, compare: makeCompare(nextState) };
    }
    case "UPDATE_WEIGHT": {
      const nextState = { ...state, weights: { ...state.weights, [action.key]: action.value } };

      return { ...nextState, compare: makeCompare(nextState) };
    }
    default:
      return state;
  }
};

const useSimilaritiesReducer = () => useReducer(reducer, null, makeInitialState);

export default useSimilaritiesReducer;
