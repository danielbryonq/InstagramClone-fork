// Mock for firebase module used in admin panel tests.
// The auth instance is a plain object (not returned from jest.fn())
// so clearAllMocks() cannot wipe out the return value.

export const mockAuthInstance = {
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn(),
  currentUser: undefined,
};

const auth = jest.fn(() => mockAuthInstance);

const firebase = {
  auth,
  initializeApp: jest.fn(),
};

export default firebase;
