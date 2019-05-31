import React, { useCallback, useState } from "react";

import { updateUser } from "./useSimilaritiesReducer";

const EditUserLocation = ({ dispatch, location, user }) => {
  const name = `ul-${user.key}-${location.key}`;

  const onLocationCheck = useCallback(
    event => dispatch(updateUser({ ...user, locationKey: parseInt(event.target.dataset.key, 10) })),
    [dispatch, user]
  );

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

const EditUserDepartment = ({ department, dispatch, user }) => {
  const name = `ud-${user.key}-${department.key}`;

  const onDepartmentCheck = useCallback(
    event => dispatch(updateUser({
      ...user,
      departmentKeys: (
        event.target.checked
          ? [...user.departmentKeys, department.key]
          : user.departmentKeys.filter(departmentKey => departmentKey !== department.key)
      )
    })),
    [department, dispatch, user]
  );

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

const EditUserInterest = ({ dispatch, interest, user }) => {
  const name = `ui-${user.key}-${interest.key}`;

  const onInterestCheck = useCallback(
    event => dispatch(updateUser({
      ...user,
      interestKeys: (
        event.target.checked
          ? [...user.interestKeys, interest.key]
          : user.interestKeys.filter(interestKey => interestKey !== interest.key)
      )
    })),
    [dispatch, interest, user]
  );

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

const EditUserInterestCategory = ({
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

const EditUserConnection = ({ dispatch, other, user }) => {
  const name = `uc-${user.key}-${other.key}`;

  const onConnectionCheck = useCallback(
    event => {
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
    },
    [dispatch, other, user]
  );

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

const EditRow = ({ departments, dispatch, interests, locations, user, users }) => {
  const onNameChange = useCallback(
    event => dispatch(updateUser({ ...user, name: event.target.value })),
    [dispatch, user]
  );

  const onUserUncheck = useCallback(
    () => dispatch(updateUser({ ...user, checked: false })),
    [dispatch, user]
  );

  const [currentInterestKey, setCurrentInterestKey] = useState(null);

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
            {Object.keys(interests).map(key => (
              <EditUserInterestCategory
                key={key}
                currentInterestKey={currentInterestKey}
                dispatch={dispatch}
                interestKey={key}
                interests={interests}
                setCurrentInterestKey={setCurrentInterestKey}
                user={user}
              />
            ))}
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

const SummaryRow = ({ dispatch, locations, user }) => {
  const onUserCheck = useCallback(
    () => dispatch(updateUser({ ...user, checked: true })), [dispatch, user]
  );

  return (
    <tr>
      <td>
        <input type="checkbox" aria-label="Edit" checked={false} onChange={onUserCheck} />
      </td>
      <td>
        {user.name}
      </td>
      <td>
        {locations.find(location => location.key === user.locationKey).name}
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

const UserRow = props => {
  const { user } = props;
  const Component = user.checked ? EditRow : SummaryRow;

  return <Component {...props} />;
};

export default UserRow;
