import {StorageFacade} from '@icure/medical-device-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageImpl implements StorageFacade<string> {
  async getItem(key: string): Promise<string | undefined> {
    return (await AsyncStorage.getItem(key)) ?? undefined;
  }

  async setItem(key: string, value: string): Promise<void> {
    return await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    return await AsyncStorage.removeItem(key);
  }
}

export default new AsyncStorageImpl();
