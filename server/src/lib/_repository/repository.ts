import DataLoader from "dataloader";
import * as admin from "firebase-admin";

import { createRootCollectionLoader } from "./createLoader";

export class RootCollectionRepository<TRawData> {
  ref: admin.firestore.CollectionReference<TRawData>;
  loader: DataLoader<string, TRawData>;

  constructor(ref: admin.firestore.CollectionReference<TRawData>) {
    this.ref = ref;
    this.loader = createRootCollectionLoader(this.ref);
  }

  async findById(id: string) {
    try {
      const res = await this.loader.load(id);
      return res;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  async create(value: TRawData) {
    const { id } = await this.ref.add(value);
    return { id };
  }

  async update(id: string, value: TRawData) {
    await this.ref.doc(id).set(value);
    this.deleteCache(id);
    return value;
  }

  async deleteById(id: string) {
    await this.ref.doc(id).delete();
    this.deleteCache(id);
  }

  deleteCache(id: string) {
    this.loader.clear(id);
  }
}
