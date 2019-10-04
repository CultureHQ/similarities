import React, { useState } from "react";

import { Dispatch, selectUser, updateUser } from "./useSimilaritiesReducer";

import { Department, Interest, Interests, Location, User } from "./typings";

type EditUserLocationProps = {
  dispatch: Dispatch;
  location: Location;
  user: User;
};

const EditUserLocation: React.FC<EditUserLocationProps> = ({ dispatch, location, user }) => {
  const name = `ul-${user.key}-${location.key}`;

  const onLocationCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateUser({
      ...user,
      locationKey: parseInt(event.target.dataset.key || "", 10)
    }));
  };

  return (
    <label htmlFor={name}>
      <input
        type="checkbox"
        aria-label="Active"
        id={name}
        name={name}
        checked={location.key === user.locationKey}
        onChange={onLocationCheck}
        data-key={location.key}
      />
      {" "}
      {location.name}
    </label>
  );
};

type EditUserDepartmentProps = {
  department: Department;
  dispatch: Dispatch;
  user: User;
};

const EditUserDepartment: React.FC<EditUserDepartmentProps> = ({ department, dispatch, user }) => {
  const name = `ud-${user.key}-${department.key}`;

  const onDepartmentCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateUser({
      ...user,
      departmentKeys: (
        event.target.checked
          ? [...user.departmentKeys, department.key]
          : user.departmentKeys.filter(departmentKey => departmentKey !== department.key)
      )
    }));
  };

  return (
    <label htmlFor={name}>
      <input
        type="checkbox"
        aria-label="Active"
        id={name}
        name={name}
        checked={user.departmentKeys.includes(department.key)}
        onChange={onDepartmentCheck}
      />
      {" "}
      {department.name}
    </label>
  );
};

type EditUserInterestProps = {
  dispatch: Dispatch;
  interest: Interest;
  user: User;
};

const EditUserInterest: React.FC<EditUserInterestProps> = ({ dispatch, interest, user }) => {
  const name = `ui-${user.key}-${interest.key}`;

  const onInterestCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateUser({
      ...user,
      interestKeys: (
        event.target.checked
          ? [...user.interestKeys, interest.key]
          : user.interestKeys.filter(interestKey => interestKey !== interest.key)
      )
    }));
  };

  return (
    <label htmlFor={name}>
      <input
        type="checkbox"
        aria-label="Active"
        id={name}
        name={name}
        checked={user.interestKeys.includes(interest.key)}
        onChange={onInterestCheck}
      />
      {" "}
      {interest.name}
    </label>
  );
};

type InterestKey = keyof Interests;

type EditUserInterestCategoryProps = {
  currentInterestKey: null | InterestKey;
  dispatch: Dispatch;
  interestKey: InterestKey;
  interests: Interests;
  setCurrentInterestKey: (interestKey: null | InterestKey) => void;
  user: User;
};

const EditUserInterestCategory: React.FC<EditUserInterestCategoryProps> = ({
  currentInterestKey, dispatch, interestKey, interests, setCurrentInterestKey, user
}) => {
  const name = `uic-${user.key}-${interestKey}`;
  const checked = currentInterestKey === interestKey;

  return (
    <li>
      <label htmlFor={name}>
        <input
          type="checkbox"
          aria-label="Active"
          id={name}
          name={name}
          checked={checked}
          onChange={event => setCurrentInterestKey(event.target.checked ? interestKey : null)}
        />
        {" "}
        {interestKey}
      </label>
      {checked && (
        <ul>
          {interests[interestKey].map(interest => (
            <li key={interest.key}>
              <EditUserInterest dispatch={dispatch} interest={interest} user={user} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

type EditUserConnectionProps = {
  dispatch: Dispatch;
  other: User;
  user: User;
};

const EditUserConnection: React.FC<EditUserConnectionProps> = ({ dispatch, other, user }) => {
  const name = `uc-${user.key}-${other.key}`;

  const onConnectionCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateUser({
      ...user,
      connectionKeys: (
        event.target.checked
          ? [...user.connectionKeys, other.key]
          : user.connectionKeys.filter(connectionKeys => connectionKeys !== other.key)
      )
    }));

    dispatch(updateUser({
      ...other,
      connectionKeys: (
        event.target.checked
          ? [...other.connectionKeys, user.key]
          : other.connectionKeys.filter(connectionKey => connectionKey !== user.key)
      )
    }));
  };

  return (
    <label htmlFor={name}>
      <input
        type="checkbox"
        aria-label="Active"
        id={name}
        name={name}
        checked={user.connectionKeys.includes(other.key)}
        onChange={onConnectionCheck}
      />
      {" "}
      {other.name}
    </label>
  );
};

type EditRowProps = {
  departments: Department[];
  dispatch: Dispatch;
  interests: Interests;
  locations: Location[];
  user: User;
  users: User[];
};

const EditRow: React.FC<EditRowProps> = ({
  departments, dispatch, interests, locations, user, users
}) => {
  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateUser({ ...user, name: event.target.value }));
  };

  const onUserUncheck = () => dispatch(updateUser({ ...user, checked: false }));

  const [currentInterestKey, setCurrentInterestKey] = useState<null | InterestKey>(null);

  return (
    <tr className="checked">
      <td>
        <input type="checkbox" checked aria-label="Edit" onChange={onUserUncheck} />
      </td>
      <td>
        <input type="text" aria-label="Name" value={user.name} onChange={onNameChange} />
      </td>
      <td>
        <ul>
          {locations.map(location => (
            <li key={location.key}>
              <EditUserLocation dispatch={dispatch} location={location} user={user} />
            </li>
          ))}
        </ul>
      </td>
      <td>
        <ul>
          {departments.map(department => (
            <li key={department.key}>
              <EditUserDepartment department={department} dispatch={dispatch} user={user} />
            </li>
          ))}
        </ul>
      </td>
      <td>
        <div className="list">
          <ul>
            {Object.keys(interests).map(key => {
              const interestKey = key as keyof Interests;

              return (
                <EditUserInterestCategory
                  key={interestKey}
                  currentInterestKey={currentInterestKey}
                  dispatch={dispatch}
                  interestKey={interestKey}
                  interests={interests}
                  setCurrentInterestKey={setCurrentInterestKey}
                  user={user}
                />
              );
            })}
          </ul>
        </div>
      </td>
      <td>
        <div className="list">
          <ul>
            {users.map(other => (
              <li key={other.key}>
                <EditUserConnection dispatch={dispatch} other={other} user={user} />
              </li>
            ))}
          </ul>
        </div>
      </td>
    </tr>
  );
};

type SummaryRowProps = {
  dispatch: Dispatch;
  locations: Location[];
  user: User;
};

const SummaryRow: React.FC<SummaryRowProps> = ({ dispatch, locations, user }) => {
  const onUserCheck = () => dispatch(updateUser({ ...user, checked: true }));
  const matchedLocation = locations.find(location => location.key === user.locationKey);

  return (
    <tr>
      <td>
        <input type="checkbox" aria-label="Edit" checked={false} onChange={onUserCheck} />
      </td>
      <td>
        <button className="inline-btn" type="button" onClick={() => dispatch(selectUser(user))}>
          {user.name}
        </button>
      </td>
      <td>
        {matchedLocation && matchedLocation.name}
      </td>
      <td>
        {user.departmentKeys.length} departments
      </td>
      <td>
        {user.interestKeys.length} interests
      </td>
      <td>
        {user.connectionKeys.length} connections
      </td>
    </tr>
  );
};

type UserRowProps = EditRowProps & SummaryRowProps;

const UserRow = (props: UserRowProps) => {
  const { user } = props;
  const Component = user.checked ? EditRow : SummaryRow;

  return <Component {...props} />;
};

export default UserRow;
