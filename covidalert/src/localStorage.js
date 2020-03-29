import EncryptedStorage from 'react-native-encrypted-storage';

export const storeItem = async (key, value) => {
  try {
    await EncryptedStorage.setItem(key, value);
    console.log('Item stored to local storage: ', key);
  } catch (error) {
    console.log('Error storing item to local storage: ', error);
  }
};

export const retrieveItem = async key => {
  try {
    const storedItem = await EncryptedStorage.getItem(key);
    console.log('Key of item retrieved from local storage: ', key);
    return storedItem;
  } catch (error) {
    console.log('Error retrieving item from local storage: ', error);
  }
};

export const removeItemFromLocalStorage = async key => {
  try {
    await EncryptedStorage.removeItem(key);
    console.log('Item removed from local storage: ', key);
  } catch (error) {
    console.log('Error removing item from local storage: ', error);
  }
};
