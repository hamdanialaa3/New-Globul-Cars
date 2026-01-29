// __mocks__/services/car.js
// Manual Jest mock for unifiedCarService

module.exports = {
  unifiedCarService: {
    getUserCars: jest.fn(() => Promise.resolve([])),
    // Add other methods as needed for tests
  }
};
