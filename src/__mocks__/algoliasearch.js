// Jest mock for algoliasearch
const mockIndex = {
  search: jest.fn(),
  saveObject: jest.fn(),
  saveObjects: jest.fn(),
  deleteObject: jest.fn(),
  setSettings: jest.fn(),
  clearObjects: jest.fn(),
  getObject: jest.fn(),
  searchForFacetValues: jest.fn(),
};

const mockClient = {
  initIndex: jest.fn(() => mockIndex),
};

const algoliasearch = jest.fn(() => mockClient);
algoliasearch.default = algoliasearch;
module.exports = algoliasearch;
