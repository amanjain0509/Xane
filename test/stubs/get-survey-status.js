ss = require('app/services/surveys');

ss.getActiveSurveysByUserId(3, (e, r) => {
  console.log(e, JSON.stringify(r));
});