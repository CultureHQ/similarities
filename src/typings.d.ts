import seedInterests from "./seeds/interests.json";

export type Department = {
  key: number;
  name: string;
};

export type Interest = {
  key: number;
  name: string;
};

export type Interests = { [K in keyof typeof seedInterests]: Interest[] };

export type Location = {
  key: number;
  name: string;
};

export type User = {
  key: number;
  connectionKeys: number[];
  departmentKeys: number[];
  interestKeys: number[];
  locationKey: number;
  name: string;
  initials: string;
  checked: boolean;
};

export type Weights = {
  connected: number;
  connections: number;
  interests: number;
  departments: number;
  locations: number;
};
