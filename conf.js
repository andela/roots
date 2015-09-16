exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['spec/e2e/**/*.spec.js'],
  capabilities: {
    browserName: 'chrome'
  },
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 5000
  },
  baseUrl: 'http://localhost:2015'
};
