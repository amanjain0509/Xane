as = require('app/services/auths');

as.login({
  email: 'sahil.narain@baxi.taxi',
  password: 'password',
  originId: 1,
  version: 1
}, (e, r) => {
  console.log(e, r, JSON.stringify(r));
})