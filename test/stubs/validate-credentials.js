um = require('app/models/auths');

um.validateCredentials({
  email: 'admin@xane.ai',
  password: 'password'
}, (e, r) => {
  console.log(e, r);
});