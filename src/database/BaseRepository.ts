import { Model, type FilterQuery } from 'mongoose';
import { ObjectId } from 'mongodb';
export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const result = await this.model.create(data);
    return result;
  }

  async find(query?: Partial<T>): Promise<T[]> {
    const result = await this.model.find(this._serializeQuery(query));

    return result;
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    const result = await this.model.findOne(this._serializeQuery(query));

    return result ?? null;
  }

  async update(query: Partial<T>, data: Partial<T>): Promise<T | null> {
    const result = await this.model.findOneAndUpdate(
      this._serializeQuery(query),
      data,
      {
        new: true,
      },
    );

    return result ?? null;
  }

  async delete(query: Partial<T>): Promise<T | null> {
    return this.model.findOneAndDelete(this._serializeQuery(query));
  }

  abstract serialize(data: T): Partial<T>;

  private _serializeQuery(query: FilterQuery<T>) {
    const payload = { ...query };

    if (query.id) {
      const _id = new ObjectId(query.id);
      payload._id = _id;
      delete payload.id;
    }

    return payload;
  }
}
