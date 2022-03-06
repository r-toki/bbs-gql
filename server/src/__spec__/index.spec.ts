import * as admin from "firebase-admin";

import { getDb } from "../firebase-app";
import { FirestoreDataSource } from "../lib/datasource/index";
import { IUser, User } from "../lib/entity/user";
import { Converter } from "./../lib/datasource/helper";
import { clearFirestore } from "./test-util/clear";
import { ReadCounter, WriteCounter } from "./test-util/counter";
import { wait } from "./test-util/wait";

const db = getDb();

describe("datasource", () => {
  let users: FirestoreDataSource<IUser>;
  let usersReadCounter: ReadCounter;
  let usersWriteCounter: WriteCounter;

  beforeEach(async () => {
    await Promise.all([clearFirestore()]);
  });
  beforeEach(async () => {
    usersReadCounter = new ReadCounter("users");
    usersWriteCounter = new WriteCounter("users");
    const usersRef = db.collection("users").withConverter(
      Converter<IUser>({
        logger: {
          onRead: () => usersReadCounter.inc(),
          onWrite: () => usersWriteCounter.inc(),
        },
      })
    );
    users = new FirestoreDataSource<IUser>(usersRef);
    users.initialize();
  });

  afterAll(async () => {
    await Promise.all([clearFirestore()]);
  });

  it("findMany from cache within ttl", async () => {
    const createdAt = new Date("2000-01-01");

    const newDocs = Array.from({ length: 25 }).map((_, idx) =>
      User.of({
        id: idx.toString(),
        createdAt: admin.firestore.Timestamp.fromDate(createdAt),
        updatedAt: admin.firestore.Timestamp.fromDate(createdAt),
      })
    );

    await Promise.all(newDocs.map((user) => users.collection.doc(user.id).set(user)));

    const readDocs = await users.findMany(
      newDocs.map((user) => user.id),
      { ttl: 60 }
    );

    const updatedAt = new Date("2020-01-01");

    const editedDocs = newDocs.map((user) =>
      User.of({ ...user, updatedAt: admin.firestore.Timestamp.fromDate(updatedAt) })
    );

    await Promise.all(editedDocs.map((user) => users.collection.doc(user.id).set(user)));

    const readDocsAgain = await users.findMany(
      newDocs.map((user) => user.id),
      { ttl: 60 }
    );

    expect(newDocs).toStrictEqual(readDocs);
    expect(newDocs).toStrictEqual(readDocsAgain);
    expect(usersReadCounter.count).toBe(25);
  });

  it("findMany from firestore after ttl", async () => {
    const createdAt = new Date("2000-01-01");

    const newDocs = Array.from({ length: 25 }).map((_, idx) =>
      User.of({
        id: idx.toString(),
        createdAt: admin.firestore.Timestamp.fromDate(createdAt),
        updatedAt: admin.firestore.Timestamp.fromDate(createdAt),
      })
    );

    await Promise.all(newDocs.map((user) => users.collection.doc(user.id).set(user)));

    const readDocs = await users.findMany(
      newDocs.map((user) => user.id),
      { ttl: 1 }
    );

    await wait(1_000);

    const updatedAt = new Date("2020-01-01");

    const editedDocs = newDocs.map((user) =>
      User.of({ ...user, updatedAt: admin.firestore.Timestamp.fromDate(updatedAt) })
    );

    await Promise.all(editedDocs.map((user) => users.collection.doc(user.id).set(user)));

    const readDocsAgain = await users.findMany(
      newDocs.map((user) => user.id),
      { ttl: 1 }
    );

    expect(newDocs).toStrictEqual(readDocs);
    expect(editedDocs).toStrictEqual(readDocsAgain);
    expect(usersReadCounter.count).toBe(50);
  });
});