const makeCompare = (departments, interests, locations, users, weights) => {
  const interestsLength = (
    Object.keys(interests).reduce((accum, key) => accum + interests[key].length, 0)
  );

  const maximum = (
    weights.connected * users.length
    + weights.connections * users.length * users.length
    + weights.departments * departments.length * departments.length
    + weights.interests * interestsLength
    + weights.locations * locations.length
  );

  return (left, right) => {
    const scores = {
      connected: (
        weights.connected
        * (left.connectionKeys.includes(right.key) ? 1 : 0)
        * users.length
      ),
      connection: (
        weights.connections
        * left.connectionKeys.filter(key => right.connectionKeys.includes(key)).length
        * users.length
      ),
      department: (
        weights.departments
        * left.departmentKeys.filter(key => right.departmentKeys.includes(key)).length
        * departments.length
      ),
      interest: (
        weights.interests
        * left.interestKeys.filter(key => right.interestKeys.includes(key)).length
      ),
      location: (
        weights.locations
        * (left.locationKey === right.locationKey ? 1 : 0)
        * locations.length
      )
    };

    return Object.keys(scores).reduce((accum, key) => accum - scores[key], maximum) / maximum;
  };
};

export default makeCompare;
