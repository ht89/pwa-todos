import { User } from '../models/user';
import { LocalStorageEnum } from '../enums/storage';

export const getUser = (): User => {
  return JSON.parse(localStorage.getItem(LocalStorageEnum.User));
};
