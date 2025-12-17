var should = require('should');
global.should = should;
require('should-sinon'); // Extend should with sinon assertions
// Expose should to global if needed by some tests, but usually requiring it once attaches to Object.prototype
