am = require('app/models/auths');

am.createSession({
  userId: 1,
  token: 'test',
  originId: 1,
  version: 1,
  expiry: '2099-12-31'
}, (e, r) => {
  console.log(e, r);
});