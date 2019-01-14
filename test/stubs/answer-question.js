ss = require('app/services/surveys');

ss.createUserAnswer({
  userId: 3,
  questionId: 1,
  answerId: 2
}, (e, r) => {
  console.log(e, r);
});