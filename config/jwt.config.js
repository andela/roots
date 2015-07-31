module.exports= {
  test: 'jwtsecretcode',
  development: 'jwtsecretcode',
  production: process.env.JWT_SECRET
};