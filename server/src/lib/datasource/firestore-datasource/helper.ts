import * as admin from "firebase-admin";

const symbolMatch = /^\$\$Timestamp\$\$:/;

export const reviver = (_key: string, value: string) => {
  if (symbolMatch.test(value)) {
    const split = value.split(":");
    return new admin.firestore.Timestamp(parseInt(split[1], 10), parseInt(split[2], 10));
  }
  return value;
};

export const replacer = (_key: string, value: unknown) => {
  if (value instanceof admin.firestore.Timestamp)
    return `$$Timestamp$$:${value.seconds}:${value.nanoseconds}`;
  return value;
};