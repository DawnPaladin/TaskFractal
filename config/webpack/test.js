process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const environment = require('./environment')

module.exports = environment.toWebpackConfig()

test('1 + 1 equals 2', () => {
	expect(1 + 1).toBe(2);
});
