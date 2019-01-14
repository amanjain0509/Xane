as = require('app/services/auths');

as.logout({
  sessionToken: '331ef237302b43b4bb85ccdde25e1a7b'
}, (e, r) => {
  console.log(e, r);
});