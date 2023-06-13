const config = {
  JWT_KEY: process.env.JWT_KEY as string,
  CLOUD_STORAGE_BUCKET_NAME: 'recyclo-387407-bucket',
  CLOUD_FIRESTORE_RECYCLED_ITEMS_COLLECTION: 'recycledItems',
  CLOUD_FIRESTORE_TRANSACTIONS_COLLECTION: 'transactions',
};

export default config;
