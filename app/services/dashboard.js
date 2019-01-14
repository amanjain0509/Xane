'use strict';

var async = require('async');
var status = require('app/configs/status');
var dashboardModel = require('app/models/dashboard');
var usersModel = require('app/models/users');
var surveysModel = require('app/models/surveys');
var _ = require('lodash');

var utilsService = require('app/services/utils');

// check if string contains digit only
String.prototype.isNumber = function() {
  return /^\d+$/.test(this);
}


var getResponsiveUsers = function(companyId,callback){
  async.waterfall([
    function(donecallback) {
      dashboardModel.getUserDetailsByCompanyId(companyId, function(err, result) {
        if (err) {
          return callback(err);
        }

        return donecallback(null, result);
      });
    },
      function(users,donecallback) {
         var userIds =  users.map(value => value.userId);
          dashboardModel.getResponsiveUsers(userIds, function(err, result) {
            if (err) {
              return donecallback(err);
            }

            return donecallback(null, result);
          });


      },
      function(users,donecallback) {
      
        let negative = [];
        let neutral = [];
        let positive = [];
        let unfilled = [];


        for(var i =0 ; i<users.length;i++){
          if(users[i].sentiment>0 && users[i].sentiment<=2.5 ){

            let obj = {
            'sentiment' :users[i].sentiment,
            'user_name' : users[i].user_name,
            'employee_id' : users[i].employee_id,
          }
            negative.push(obj);
          }

          else if(users[i].sentiment>2.5 && users[i].sentiment<=3.5){

            let obj = {
            'sentiment' : users[i].sentiment,
            'user_name' : users[i].user_name,
            'employee_id' : users[i].employee_id,
          }
            neutral.push(obj);
          }
          else if(users[i].sentiment>3.5 && users[i].sentiment<= 5){

            let obj = {
            'sentiment' : users[i].sentiment,
            'user_name' : users[i].user_name,
            'employee_id' : users[i].employee_id,
          }
            positive.push(obj);
          }



        }




      var response = status.getStatus('success');
      response.modal = {};
      response.modal.negative = negative;
      response.modal.neutral = neutral;
      response.modal.positive = positive;
      response.modal.unfilled = unfilled;

      return callback(null, response);


      }
    ],
    function(err, result) {
      if (err) {
        return callback(err);
      }
      return callback(null, result);
    });
};



var getUserDetailsByCompanyId = function(companyId, callback) {
  async.parallel([
    function(doneCallback) {
      dashboardModel.getUserDetailsByCompanyId(companyId, function(err, result) {

        if (err) {
          return doneCallback(null, []);
        }

        if (!result) {
          return doneCallback(null, []);
        }

        return doneCallback(null, result);

      });
    }
  ], function(err, result) {
    if (err) {
      return callback(err);
    }

    var response = status.getStatus('success');
    response.data = {};
    response.data.users = result;

    return callback(null, response);
  });

};



var getSelectiveUserNotification = function(users, callback) {
  async.waterfall([
      function(donecallback) {
        dashboardModel.getRegisteredCloudToken(users, function(err, result) {
          if (err) {
            return callback(err);
          }

          return donecallback(null, result);
        });

      },

      function(registeredToken,donecallback) {

        var notification = {};
        notification.message = "hiii";

        for (var i = 0; i < registeredToken.length; i++){
            notification.registeredToken = registeredToken[i].registeredToken;
            notification.user_id  = registeredToken[i].user_id
              console.log(notification.user_id);
            sendPushNotification(notification, function(err, result) {
               if (err) {
                 return callback(err);
               }
               return donecallback(null, result);
             });

          }


      }
    ],
    function(err, result) {
      if (err) {
        return callback(err);
      }
      return callback(null, result);
    });
};



//////////////////////////////////////////////////////////////////


var getOrgchartByCompanyId = function(companyId, callback) {
  async.parallel([
    function(doneCallback) {
      dashboardModel.getUserSentimentByCompanyId(companyId, function(err, result) {
        if (err) {
          return doneCallback(null, []);
        }
        if (!result) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result);
      });
    },
    function(doneCallback) {
      dashboardModel.getCompanynameByCompanyId(companyId, function(err, result) {
        if (err) {
          return doneCallback(null, []);
        }
        if (!result) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result);
      });
    },
    function(doneCallback) {
      dashboardModel.getOrgchartByCompanyId(companyId, function(err, result) {
        if (err) {
          return doneCallback(null, []);
        }
        if (!result) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, collateOrgChartData(result[0], result[1], result[2]));
  });
};
var collateOrgChartData = function(peopleToMeetData, companyName, orgChartData) {
  var response = status.getStatus('success');
  response.data = {};
  response.data.people_to_meet = peopleToMeetData;
  response.data.company_name = companyName;
  response.data.org_chart_data = orgChartData;
  return response;
}

var getQuestionAndBucketSentimentByCompanyId = function(companyId, callback) {
  async.parallel([
    function(doneCallback) {
      dashboardModel.getAvgSentimentForEachSurveyByCompanyId(companyId, function(err, result) {
        if (err) {
          return doneCallback(null, []);
        }
        if (!result) {
          return doneCallback(null, []);
        }
        var b = JSON.parse(JSON.stringify(result));
        var sentiment = [];
        var count = 0;
        var avgSentiment = 0;
        for (var i = 0; i < b.length; i++) {
          var avg_s = {};
          var m = [];
          var s = {};
          if (b[i].end === null) {
            avg_s.bucket = b[i].start + '+';
          } else {
            avg_s.bucket = b[i].start + '-' + b[i].end;
          }
          avg_s.avg_sentiment = b[i].sentiment;
          s.date = b[i].date;
          s.sentiment = b[i].sentiment
          m.push(s);
          avg_s.months = m;
          avgSentiment = avgSentiment + b[i].sentiment;
          sentiment.push(avg_s);
          if (b[i].sentiment != null) count = count + 1;
        }
        var all = {};
        var m = {}
        all.bucket = 'All'
        all.avg_sentiment = (avgSentiment / count).toFixed(2)
        all.months = [];
        m.date = b[0].date;
        m.sentiment = all.avg_sentiment;
        all.months.push(m);
        sentiment.splice(0, 0, all)
        return doneCallback(null, sentiment);
      });
    },
    function(doneCallback) {
      dashboardModel.getQuestionSentimentIdBycompanyId(companyId, function(err, result) {
        if (err) {
          return doneCallback(null, []);
        }
        if (!result) {
          return doneCallback(null, []);
        }
        var b = JSON.parse(JSON.stringify(result));
        var question_sentiment = [];
        for (var i = 0; i < b.length; i++) {
          var avg_s = {};
          var m = [];
          var s = {};
          avg_s.question_id = b[i].question_id;
          avg_s.question = b[i].question;
          avg_s.avg_sentiment = b[i].avg_sentiment;
          avg_s.date = b[i].date;
          avg_s.positive = b[i].positive
          avg_s.negative = b[i].negative
          avg_s.neutral = b[i].neutral
          s.date = b[i].date;
          s.sentiment = b[i].avg_sentiment
          m.push(s);
          avg_s.months = m;
          question_sentiment.push(avg_s);
        }
        return doneCallback(null, question_sentiment);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, collateQuestionAndBucketSentimentData(result[0], result[1]));
  });
};
var collateQuestionAndBucketSentimentData = function(bucketSentiment, questionSentiment) {
  var response = status.getStatus('success');
  response.data = {}
  response.data.bucket_sentiment = bucketSentiment;
  response.data.question_sentiment = questionSentiment;
  return response;
}

var getQuestionResponseByUserId = function(userId, callback) {
  dashboardModel.getQuestionResponseByUserId(userId, function(err, result) {
    if (err) {
      return callback(err);
    }

    if (!result) {
      return callback(status.getStatus('input_missing'));
    }

    var response = status.getStatus('success');
    response.data = {};
    response.data = result;
    return callback(null, response);
  });
};

var getRecievedFeedbackForAllUsersByCompanyId = function(pagination, companyId, callback) {
  async.waterfall([
    function(doneCallback) {
      if (!companyId) {
        return callback(status.getStatus('input_missing'));
      }
      dashboardModel.getRecievedFeedbackForAllUsersByCompanyId(pagination, companyId, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result) {
          return callback(status.getStatus('input_missing'));
        }
        return doneCallback(null, result);
      });
    },

    function(feedbackdata, doneCallback) {
      dashboardModel.getCountRecievedFeedbackForAllUsersByCompanyId(companyId, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result) {
          return callback(status.getStatus('input_missing'));
        }
        return doneCallback(null, feedbackdata, result[0].count);
      });
    },
    function(feedbackdata, count, doneCallback) {
      var response = status.getStatus('success');
      response.data = {};
      response.data.feedback_data = feedbackdata;
      response.data.count = count;

      return doneCallback(null, response);
    }
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, result);
  });
};


var getUsersStage1 = function(companyId, callback) {
  if (!companyId) {
    return callback(status.getStatus('input_missing'));
  }
  dashboardModel.usersToFillSurveys(companyId, function(err, result) {

    if (err) {
      return callback(err);
    }
    if (!result) {
      return callback(null, []);
    }
    var resultData = [];
    async.each(Object.keys(result), function(item, cb) {
      if (companyId === 3) {
        if (result[item].email.split('@')[0].isNumber() || result[item].user_answer_id) {
          dashboardModel.getUserSurveyActivity(result[item].user_id, function(err, surveyBucket) {
            result[item].bucket = surveyBucket;
            resultData.push(result[item]);
            cb();
          });
        } else {
          cb();
        }
      } else {
        dashboardModel.getUserSurveyActivity(result[item].user_id, function(err, surveyBucket) {
          result[item].bucket = surveyBucket;
          resultData.push(result[item]);
          cb();
        });
      }
    }, function(err) {
      if (err) {
        return callback(err);
      }
      var response = status.getStatus('success');
      response.data = {};
      response.data.users = resultData;
      return callback(null, response);
    });
  });
};




var getUsersStage2 = function(companyId, callback) {
  if (!companyId) {
    return callback(status.getStatus('input_missing'));
  }
  dashboardModel.usersToDownloadApp(companyId, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (!result) {
      return callback(null, []);
    }
    var resultData = [];
    if (companyId === 3) {
      async.forEach(Object.keys(result), function(item, cb) {
        if (result[item].email.split('@')[0].isNumber()) {
          resultData.push(result[item]);
          cb();
        }
      });
    } else {
      resultData = result;
    }
    var response = status.getStatus('success');
    response.data = {};
    response.data.users = resultData;
    return callback(null, response);
  });
};


var categoryWiseQuestionSentiment = function(companyId, callback) { //Updated 3 functions
  async.parallel([
    function(doneCallback) {
      dashboardModel.getQuestionCategorySentiment(companyId, function(err, result) { //Updated
        if (err) {
          return doneCallback(null, []);
        }
        if (!result) {
          return doneCallback(null, status.getStatus('input_missing'));
        }
        var CategorySentiment = [];
        for (var i = 0; i < result.length; i++) {
          var flag = 0;
          for (var j = 0; j < CategorySentiment.length; j++) {
            if (CategorySentiment[j].category_id === result[i].category_id) {
              var month = {}
              month.date = result[i].date;
              month.sentiment = result[i].category_sentiment;
              month.survey_cycle = result[i].survey_cycle;
              month.sentiment_data = [];
              month.sentiment_data.push(result[i].sentiment_is_1);
              month.sentiment_data.push(result[i].sentiment_is_2);
              month.sentiment_data.push(result[i].sentiment_is_3);
              month.sentiment_data.push(result[i].sentiment_is_4);
              month.sentiment_data.push(result[i].sentiment_is_5);
              flag = 1;
              CategorySentiment[j].months.push(month);
            }
          }
          if (flag == 0) {
            var category_sentiment = {};
            var month = {}
            category_sentiment.category_id = result[i].category_id;
            category_sentiment.category_name = result[i].category_name;
            category_sentiment.category_sentiment = 0;
            category_sentiment.months = [];
            month.date = result[i].date;
            month.sentiment = result[i].category_sentiment;
            month.survey_cycle = result[i].survey_cycle;
            month.sentiment_data = [];
            month.sentiment_data.push(result[i].sentiment_is_1);
            month.sentiment_data.push(result[i].sentiment_is_2);
            month.sentiment_data.push(result[i].sentiment_is_3);
            month.sentiment_data.push(result[i].sentiment_is_4);
            month.sentiment_data.push(result[i].sentiment_is_5);
            category_sentiment.months.push(month);
            CategorySentiment.push(category_sentiment);
          }
        }
        for (var i = 0; i < CategorySentiment.length; i++) {
          var senti = 0;
          var weight = 0;
          for (var j = 0; j < CategorySentiment[i].months.length; j++) {

            /*senti = senti + CategorySentiment[i].months[j].survey_cycle * CategorySentiment[i].months[j].sentiment;
            weight = weight + CategorySentiment[i].months[j].survey_cycle;*/ //Weighted average method
            senti = senti + CategorySentiment[i].months[j].sentiment;
            weight++;

          }
          senti = senti / weight;
          senti = Math.round(100 * senti) / 100;
          CategorySentiment[i].category_sentiment = senti;
        }
        return doneCallback(null, CategorySentiment);
      });
    },
    function(doneCallback) {
      dashboardModel.getQuestionsByCategory(companyId, function(err, result) { //Updated
        if (err) {
          return doneCallback(null, []);
        }
        if (!result) {
          return doneCallback(status.getStatus('input_missing'));
        }
        var questionByCategory = [];
        for (var i = 0; i < result.length; i++) {
          var flag = 0;
          for (var j = 0; j < questionByCategory.length; j++) {
            if (questionByCategory[j].category_id === result[i].category_id) {
              var questions = {}
              questions.question_id = result[i].question_id;
              questions.question = result[i].question;
              questions.sentiment = result[i].sentiment;
              flag = 1;
              questionByCategory[j].questions.push(questions);
            }
          }
          if (flag == 0) {
            var question_category = {};
            var questions = {}
            question_category.category_id = result[i].category_id;
            question_category.questions = [];
            questions.question_id = result[i].question_id;
            questions.question = result[i].question;
            questions.sentiment = result[i].sentiment;
            question_category.questions.push(questions);
            questionByCategory.push(question_category);
          }
        }
        return doneCallback(null, questionByCategory);
      });
    },
    function(doneCallback) {
      dashboardModel.getQuestions(companyId, function(err, result) { //Updated
        if (err) {
          return doneCallback(null, []);
        }
        if (!result) {
          return doneCallback(status.getStatus('input_missing'));
        }
        var objectiveQuestions = [];
        for (var i = 0; i < result.length; i++) {
          var flag = 0;
          for (var j = 0; j < objectiveQuestions.length; j++) {
            if (objectiveQuestions[j].question_id === result[i].question_id) {
              flag = 1;
              objectiveQuestions[j].followups.push(result[i].next_question_id);
            }
          }
          if (flag == 0) {
            var objective_question = {};
            objective_question.question_id = result[i].question_id;
            objective_question.followups = [];
            objective_question.subjective_followups = [];
            objective_question.followups.push(result[i].next_question_id);
            objectiveQuestions.push(objective_question);
          }
        }
        dashboardModel.getUsersAnswersByQuestions(companyId, function(err, result2) {
          if (err) {
            return donecallback(null, []);
          }

          if (!result2) {
            return donecallback(status.getStatus('input_missing'));
          }
          var subjectiveQuestions = [];
          for (var i = 0; i < result2.length; i++) {
            var flag = 0;
            for (var j = 0; j < subjectiveQuestions.length; j++) {
              if (subjectiveQuestions[j].question_id === result2[i].question_id) {
                flag = 1;
                subjectiveQuestions[j].responses.push(result2[i].response);
              }
            }
            if (flag == 0) {
              var subjective_question = {};
              subjective_question.question_id = result2[i].question_id;
              subjective_question.question = result2[i].question;
              subjective_question.responses = [];
              subjective_question.responses.push(result2[i].response);
              subjectiveQuestions.push(subjective_question);
            }
          }
          for (var i = 0; i < objectiveQuestions.length; i++) {
            for (var j = 0; j < objectiveQuestions[i].followups.length; j++) {
              var response = {};
              var subjectiveQuestionsId = objectiveQuestions[i].followups[j];
              var index = _.findIndex(subjectiveQuestions, ['question_id', subjectiveQuestionsId]); //Lodash used
              response = subjectiveQuestions[index];
              objectiveQuestions[i].subjective_followups.push(subjectiveQuestions[index]);
            }

          }
          return doneCallback(null, objectiveQuestions);
        });
      });
    }
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var response = status.getStatus('success');
    response.data = {};
    response.data.category_sentiment = result[0];
    response.data.questions_category = result[1];
    response.data.users_answers_by_questions = result[2];
    return callback(null, response);
  });
};


var departmentWiseAnalitycs = function(companyId, callback) {
  if (!companyId) {
    return callback(status.getStatus('input_missing'));
  }
  async.waterfall([
    function(doneCallback) {
      dashboardModel.getDesignationsByCompanyId(companyId, function(err, result) {
        console.log(result);
        if (err) {
          return callback(err);
        }
        return doneCallback(null, result);
      });
    },
    function(designations, doneCallback) {
      var designationWiseSentiment = [];
      async.forEach(designations, function(d, cb) {
        var params = {};
        params.companyId = companyId;
        params.designationId = d.designation_id;
        params.designation = d.designation;
        getDesignationSentiment(params, function(err, result) {
          result.designation = d.designation;
          designationWiseSentiment.push(result);
          cb();
        });
      }, function(err) {
        if (err) {
          return callback(err);
        }
        return doneCallback(null, designationWiseSentiment);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var data = status.getStatus('success');
    data.data = result;
    return callback(null, data);
  });
}


var getDesignationSentiment = function(params, callback) {
  if (!params) {
    return callback(null, null)
  }
  async.parallel([
    function(doneCallback) {
      dashboardModel.getDesignationSentimentBySurveyCycle(params, function(err, result) {
        var month = [];
        if (result) {
          result.forEach(function(re) {
            var r = {};
            r.date = re.sc_start_date;
            r.sentiment = re.avg_sentiment;
            month.push(r);
          });
          return doneCallback(null, month);
        } else {
          var r = {};
          r.date = null;
          r.sentiment = null;
          month.push(r);
          return doneCallback(null, month);
        }
      });
    },
    function(doneCallback) {
      dashboardModel.getAvgDesignationSentiment(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result[0]);
      });
    },
    function(doneCallback) {
      dashboardModel.getDesignationSentimentData(params, function(err, result) {

        if (err) {
          return callback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var data = {};
    data.avg_sentiment = result[1].avg_sentiment;
    data.months = result[0];
    data.sentiment_data = result[2];
    return callback(null, data);
  });
}

var locationWiseAlalitycs = function(companyId, callback) {
  if (!companyId) {
    return callback(status.getStatus('input_missing'));
  }
  async.waterfall([
    function(doneCallback) {
      dashboardModel.getLocationsByCompanyId(companyId, function(err, result) {
        if (err) {
          return callback(err);
        }
        return doneCallback(null, result);
      });
    },
    function(cities, doneCallback) {
      var locationWiseSentiment = [];
      async.forEach(cities, function(c, cb) {
        var params = {};
        params.companyId = companyId;
        params.cityId = c.city_id;
        params.city = c.city;
        getLocationSentiment(params, function(err, result) {
          result.city = c.city;
          locationWiseSentiment.push(result);
          cb();
        });
      }, function(err) {
        if (err) {
          return callback(err);
        }
        return doneCallback(null, locationWiseSentiment);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var data = status.getStatus('success');
    data.data = result;
    return callback(null, data);
  });
}

var getLocationSentiment = function(params, callback) {
  if (!params) {
    return callback(null, null)
  }
  async.parallel([
    function(doneCallback) {
      dashboardModel.getLocationSentimentBySurveyCycle(params, function(err, result) {
        var month = [];
        if (result) {
          result.forEach(function(re) {
            var r = {};
            r.date = re.sc_start_date;
            r.sentiment = re.avg_sentiment;
            month.push(r);
          });
          return doneCallback(null, month);
        } else {
          var r = {};
          r.date = null;
          r.sentiment = null;
          month.push(r);
          return doneCallback(null, month);
        }
      });
    },
    function(doneCallback) {
      dashboardModel.getAvgLocationSentiment(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result[0]);
      });
    },
    function(doneCallback) {
      dashboardModel.getLocationSentimentData(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var data = {};
    data.avg_sentiment = result[1].avg_sentiment;
    data.months = result[0];
    data.sentiment_data = result[2];
    return callback(null, data);
  });
}

var companyBucketWiseAnalytics = function(companyId, callback) {
  if (!companyId) {
    return callback(status.getStatus('input_missing'));
  }
  async.waterfall([
    function(doneCallback) {
      dashboardModel.getCompanyTargetsByCompanyId(companyId, function(err, result) {
        if (err) {
          return callback(err);
        }
        return doneCallback(null, result);
      });
    },
    function(companyTargets, doneCallback) {
      var bucketWiseSentiment = [];
      async.forEach(companyTargets, function(ct, cb) {
        var params = {};
        params.companyId = companyId;
        params.companyTargetId = ct.id;
        getBucketSentiment(params, function(err, result) {
          if (ct.end === null) {
            result.bucket = ct.start + '+';
          } else {
            result.bucket = ct.start + '-' + ct.end;
          }
          bucketWiseSentiment.push(result);
          cb();
        });
      }, function(err) {
        if (err) {
          return callback(err);
        }
        return doneCallback(null, bucketWiseSentiment);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var data = status.getStatus('success');
    data.data = result;
    return callback(null, data);
  });
};

var getBucketSentiment = function(params, callback) {
  if (!params) {
    return callback(status.getStatus('input_missing'));
  }
  async.parallel([
    function(doneCallback) {
      dashboardModel.getBucketSentimentBySurveyCycle(params, function(err, result) {
        var month = [];
        if (result) {
          result.forEach(function(re) {
            var r = {};
            r.date = re.sc_start_date;
            r.sentiment = re.avg_sentiment;
            month.push(r);
          });
          return doneCallback(null, month);
        } else {
          var r = {};
          r.date = null;
          r.sentiment = null;
          month.push(r);
          return doneCallback(null, month);
        }
      });
    },
    function(doneCallback) {
      dashboardModel.getAvgBucketSentiment(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result[0]);
      });
    },
    function(doneCallback) {
      dashboardModel.getBucketSentimentData(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var data = {};
    data.avg_sentiment = result[1].avg_sentiment;
    data.months = result[0];
    data.sentiment_data = result[2];
    return callback(null, data);
  });
}


var superiorUserWiseAnalytics = function(companyId, callback) {
  if (!companyId) {
    return callback(status.getStatus('input_missing'));
  }
  async.waterfall([
    function(doneCallback) {
      dashboardModel.getSuperiorUsersByCompanyId(companyId, function(err, result) {
        if (err) {
          return callback(err);
        }
        return doneCallback(null, result);
      });
    },
    function(superiorsUsers, doneCallback) {
      var superiorsUsersWiseSentiment = [];
      async.forEach(superiorsUsers, function(su, cb) {
        var params = {};
        params.companyId = companyId;
        params.superiorUserId = su.superior_user_id;
        getSuperiorUserSentiment(params, function(err, result) {
          result.superior_user = su.superior_user;
          superiorsUsersWiseSentiment.push(result);
          cb();
        });
      }, function(err) {
        if (err) {
          return callback(err);
        }
        return doneCallback(null, superiorsUsersWiseSentiment);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var data = status.getStatus('success');
    data.data = result;
    return callback(null, data);
  });
}

var getSuperiorUserSentiment = function(params, callback) {
  if (!params) {
    return callback(status.getStatus('input_missing'))
  }
  async.parallel([
    function(doneCallback) {
      dashboardModel.getSuperiorUserSentimentBySurveyCycle(params, function(err, result) {
        var month = [];
        if (result) {
          result.forEach(function(re) {
            var r = {};
            r.date = re.sc_start_date;
            r.sentiment = re.avg_sentiment;
            month.push(r);
          });
          return doneCallback(null, month);
        } else {
          var r = {};
          r.date = null;
          r.sentiment = null;
          month.push(r);
          return doneCallback(null, month);
        }
      });
    },
    function(doneCallback) {
      dashboardModel.getSuperiorUserAvgSentiment(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result[0]);
      });
    },
    function(doneCallback) {
      dashboardModel.getSuperiorUserSentimentData(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var data = {};
    data.avg_sentiment = result[1].avg_sentiment;
    data.months = result[0];
    data.sentiment_data = result[2];
    return callback(null, data);
  });
};

var getBucketCategorySentiment = function(companyId, callback) { //Added
  if (!companyId) {
    return callback(status.getStatus('input_missing'));
  }
  dashboardModel.getBucketCategorySentiment(companyId, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (!result) {
      return callback(status.getStatus('input_missing'));
    }

    var bucket_sentiment = [];
    for (var i = 0; i < result.length;) {

      var bucket = {};
      if (result[i].end === null) {
        bucket.bucket = result[i].start + '+';
      } else {
        bucket.bucket = result[i].start + '-' + result[i].end;
      }
      var start = result[i].start;
      bucket.Category = [];

      while (result[i].start == start) {

        var category = {};
        category.category_id = result[i].category_id;
        category.category_name = result[i].category_name;
        category.category_sentiment = result[i].category_sentiment;
        bucket.Category.push(category);
        i++;
        if (!result[i])
          break;
      }
      bucket_sentiment.push(bucket);
      if (!result[i])
        break;
    }
    var response = status.getStatus('success');
    response.data = {};
    response.data.bucket_sentiment = [];

    for (var j = 0; j < bucket_sentiment.length; j++)
      response.data.bucket_sentiment[j] = bucket_sentiment[j];

    return callback(null, response);
  });
};

var getBucketSentiment = function(params, callback) {
  if (!params) {
    return callback(status.getStatus('input_missing'));
  }
  async.parallel([
    function(doneCallback) {
      dashboardModel.getBucketSentimentBySurveyCycle(params, function(err, result) {
        var month = [];
        if (result) {
          result.forEach(function(re) {
            var r = {};
            r.date = re.sc_start_date;
            r.sentiment = re.avg_sentiment;
            month.push(r);
          });
          return doneCallback(null, month);
        } else {
          var r = {};
          r.date = null;
          r.sentiment = null;
          month.push(r);
          return doneCallback(null, month);
        }
      });
    },
    function(doneCallback) {
      dashboardModel.getAvgBucketSentiment(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result[0]);
      });
    },
    function(doneCallback) {
      dashboardModel.getBucketSentimentData(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result);
      });
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var data = {};
    data.avg_sentiment = result[1].avg_sentiment;
    data.months = result[0];
    data.sentiment_data = result[2];
    return callback(null, data);
  });
}


var getUserFeedbackGenuinity = function(companyId, callback) {
  if (!companyId) {
    return callback(status.getStatus('input_missing'));
  }
  async.waterfall([
    function(doneCallback) {
      dashboardModel.getUserSentimentStdDev(companyId, function(err, result) {
        if (err) {
          return callback(err);
        }
        var avgStdDev = 0;
        var timeForObjResponseNotGenuine = 3; //Would come after testing
        var timeForObjResponseGenuine = 10; //Would come after testing
        var timeForSubjResponseNotGenuine = 6; //Would come after testing
        var timeForSubjResponseGenuine = 20; //Would come after testing
        for (var i = 0; i < result.length; i++) { //For G1
          avgStdDev = avgStdDev + result[i].G1;
        }
        avgStdDev = avgStdDev / result.length;
        for (var i = 0; i < result.length; i++) {
          result[i].G1 = Math.round(10000 * result[i].G1 / avgStdDev) / 100; //For G1
          if (result[i].G1 > 100)
            result[i].G1 = 100;
          //For G3
          var Tmin = (timeForObjResponseGenuine * result[i].obj + timeForSubjResponseGenuine * result[i].subj); //Min time reqd to fill survey genuinely
          var Tskip = (timeForObjResponseNotGenuine * result[i].obj + timeForSubjResponseNotGenuine * result[i].subj); //Min time reqd to fill survey ingenuinely
          var Ttaken = result[i].G3; //Time taken by user to fill the survey
          result[i].G3 = ((Ttaken - Tskip) / (Tmin - Tskip));
          result[i].G3 = Math.round(10000 * result[i].G3) / 100;
          if (result[i].G3 > 100)
            result[i].G3 = 100;
          if (result[i].G3 < 0)
            result[i].G3 = 0;
        }
        return doneCallback(null, result);
      });
    },
    function(genuinityData, doneCallback) {
      dashboardModel.getUserSubjectiveResponses(companyId, function(err, result) {
        if (err) {
          return callback(err);
        }

        var Res = [];

        for (var i = 0; i < result.length;) {

          var res = {};
          res.userId = result[i].user_id;
          res.surveyCycle = result[i].survey_cycle;
          var userResponsePoints = 0; //Points given to user based on his/her answer (as described in model)
          var totalPoints = 0;

          while ((result[i].user_id === res.userId) && (res.surveyCycle === result[i].survey_cycle)) {

            userResponsePoints = userResponsePoints + WordCount(result[i].response); //CODE!!!
            totalPoints = totalPoints + 4;
            i++;
            if (!result[i])
              break;
          }
          res.G2 = (userResponsePoints / totalPoints);
          res.G2 = Math.round(10000 * res.G2) / 100;
          Res.push(res);
          if (!result[i])
            break;
        }

        for (var i = 0; i < Res.length; i++) {

          var index = _.findIndex(genuinityData, {
            'user_id': Res[i].userId,
            'survey_cycle': Res[i].surveyCycle
          }); //Lodash used
          //console.log(index);
          if (index >= 0)
            genuinityData[index].G2 = Res[i].G2;
        }
        //console.log(genuinityData);
        //console.log(Res);
        return doneCallback(null, genuinityData);
      });
    },
    function(genuinityData, doneCallback) {

      genuinityData = _.sortBy(genuinityData, ['survey_cycle', 'survey_id']); //Outer sort: survey_cycle, Inner sort: survey_id
      var survey_cycles = [];
      for (var i = 0; i < genuinityData.length;) {

        var survey_cycle_id = genuinityData[i].survey_cycle;
        var survey_cycle = {};
        survey_cycle.cycle_number = survey_cycle_id;
        survey_cycle.surveys = [];

        while (survey_cycle_id = genuinityData[i].survey_cycle) {

          var survey_id = genuinityData[i].survey_id;
          var survey = {};
          survey.survey_id = survey_id;
          survey.Users = [];

          while ((survey_cycle_id = genuinityData[i].survey_cycle) && (survey_id = genuinityData[i].survey_id)) {

            var users = {};
            users.id = genuinityData[i].user_id;
            users.name = genuinityData[i].user_name;
            users.location = genuinityData[i].location;
            users.designation = genuinityData[i].designation;
            users.employee_id = genuinityData[i].employee_id;
            users.G1 = genuinityData[i].G1;
            users.G2 = genuinityData[i].G2;
            users.G3 = genuinityData[i].G3;
            //users.Genuinity = xG1 + yG2 + zG3; //Once training is done, replace G1,G2,G3 by this

            survey.Users.push(users);
            i++;
            if (!genuinityData[i])
              break;

          }
          survey_cycle.surveys.push(survey)
          if (!genuinityData[i])
            break;
        }
        survey_cycles.push(survey_cycle);
        if (!genuinityData[i])
          break;
      }

      return doneCallback(null, survey_cycles);
    } //Remove this function to get raw data
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var response = status.getStatus('success');
    response.data = {};
    response.data.userFeedbackGenuinity = result;
    return callback(null, response);
  });
}

function WordCount(str) { //Added //Should give number of proper english words for factor G2
  if (!str || str.lenght == 0)
    return 0;
  var word = str.split(" ");
  if (!word || word.lenght == 0)
    return 0;
  var count = 0;
  for (var i = 0; i < word.length; i++) {

    if (word[i].length < 4) //Word should be at least 4 letters long to avoid unnecessary words inclusion
      continue;

    //if(word[i] == 'yes' || 'no' || 'bad') continue; //add frequently inputted useless words of min length 4

    var wordLength = 0,
      vowelCount = 0,
      consonentCount = 0;

    word[i] = word[i].toLowerCase();

    for (var j = 0; j < word[i].length; j++) {

      if (word[i][j] && word[i][j + 1] && word[i][j + 2]) //Three same letters in a row means not a word
        if ((word[i][j] == word[i][j + 1]) && (word[i][j + 1] == word[i][j + 2])) {
          wordLength = 0;
          break;
        }
      //Methods to check if alphabet: 1. ECHMAScript case transformation (used) 2. regex or unicode... str[i].match(/[a-z]/i)
      if ((word[i][j].toLowerCase() != word[i][j].toUpperCase()) || word[i][j] == '-') { //It will take into account non-ASCII Unicode character classes of some foreign alphabets as well hence used over regex method
        if (word[i][j] == 'a' || word[i][j] == 'e' || word[i][j] == 'i' || word[i][j] == 'o' || word[i][j] == 'u') { //5 consecutive vowels/consonents would not count as a word
          vowelCount++;
          consonentCount = 0;
          //console.log(j + '  ' + vowelCount + '  ' + consonentCount);
          if (vowelCount >= 5) {
            wordLength = 0;
            break;
          }
        } else {
          vowelCount = 0;
          consonentCount++;
          //console.log(j + '  ' + vowelCount + '  ' + consonentCount);
          if (consonentCount >= 5) {
            wordLength = 0;
            break;
          }
        }
        //console.log(word[i][j]);
        wordLength++;
      } else { //If special character occurs between a string, it is not a word... end of string considered as a word
        if (!word[i][j + 1]) {
          break;
        }
        wordLength = 0;
        break;
      }
    }
    if (wordLength >= 4)
      count++;
  }
  if (count > 4)
    count = 4;
  return count;
}

var getProgressBar = function(companyId, callback) {
  async.parallel([
    function(doneCallback) {
      dashboardModel.getUsersFilled(companyId, function(err, result) {
        if (err) {
          return doneCallback(null, []);
        }
        if (!result) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result);
      });
    },
    function(doneCallback) {
      dashboardModel.getUsersUnfilled(companyId, function(err, result) {
        if (err) {
          return doneCallback(null, []);
        }
        if (!result) {
          return doneCallback(null, []);
        }
        return doneCallback(null, result);
      });
    }
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    var response = status.getStatus('success');
    response.data = {};
    response.data.filled = result[0];
    response.data.unfilled = result[1];
    return callback(null, response);
  });
};

var jivaKeywordsData = require('app/services/jivaCategoryKeywords');
var getCategoryKeywords = function(companyId, callback) {
  if (companyId != 3) {
    var response = status.getStatus('input_missing');
    return callback(null, response);
  }
  var response = jivaKeywordsData;
  return callback(null, response);
};


var pushNotificationForAll = function(params, callback) {
  if (!params.companyId || !params.message || !params.title || !params.messageTime) {
    return callback(status.getStatus('input_missing'));
  }
  async.parallel([
    function(doneCallback) {
      dashboardModel.pushNotificationToRTD(params, function(err, result) {
        if (err) {
          return doneCallback(err);
        }
        if (result) {
          return doneCallback(null, result);
        }
      })
    },

    function(doneCallback) {
      dashboardModel.pushNotificationToFCM(params, function(err, result) {
        if (err) {
          return doneCallback(err);
        }
        if (result) {
          return doneCallback(null, result);
        }
      })
    },

    function(doneCallback) {
      dashboardModel.storeNotificationInDatabase(params, function(err, result) {
        if (err) {
          return doneCallback(err);
        }

        return doneCallback(null, result);
      })
    },
  ], function(err, result) {
    if (err) {
      return callback(err);
    }

    if (result[0] && result[1] && result[2]) {
      return callback(null, status.getStatus('success'));
    }
  })
};

var getAllPushedNotificationsByCompanyId = function(params, callback) {
  if (!params.companyId) {
    return callback(status.getStatus('input_missing'));
  }

  async.waterfall([
    function(doneCallback) {
      dashboardModel.getAllNotificationByCompanyId(params.companyId, function(err, result) {
        if (err) {
          return callback(err);
        }

        if (!result || result.length === 0) {
          return doneCallback(null, []);
        }

        return doneCallback(null, result);
      })
    },

    function(notificationResult, doneCallback) {
      let response = status.getStatus('success');
      response.data = {};
      response.data.companyId = params.companyId;
      response.data.notifications = notificationResult;

      return doneCallback(null, response);
    }
  ], function(err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  })
};

var getVoluntaryFeedback = function(params, callback) {
  if (!params) {
    return callback(status.getStatus('input_missing'));
  }
  dashboardModel.getVoluntaryFeedback(params, function(err, result) {
    if (err) {
      return callback(err);
    }
    var _tokenWiseData = []
    result.forEach(function(r) {
      var _index = _.findIndex(_tokenWiseData, function(o) {
        return o.token == r.token
      });
      var _feedback = {};
      if (_index >= 0) {
        _feedback.feedback = r.feedback;
        _feedback.date = r.created_date;
        _feedback.admin_id = r.admin_id;
        if (!r.admin_id) {
          _tokenWiseData[_index].seen = r.seen;
        }
        _tokenWiseData[_index].conversation.push(_feedback);
      } else {
        var conv = {};
        _feedback.name = r.name;
        _feedback.seen = r.seen;
        _feedback.user_id = r.user_id;
        _feedback.token = r.token;
        _feedback.active = r.active;
        _feedback.conversation = [];
        conv.feedback = r.feedback;
        conv.date = r.created_date;
        conv.admin_id = r.admin_id;
        _feedback.conversation.push(conv);
        _tokenWiseData.push(_feedback);
      }
    });
    var response = status.getStatus('success');
    response.data = _tokenWiseData;
    return callback(null, response);
  });
};

var createVoluntaryFeedback = function(params, callback) {
  if (!params) {
    return callback(status.getStatus('input_missing'));
  }
  async.waterfall([
    function(donecallback) {
      dashboardModel.createVoluntaryFeedback(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (!result) {
          return callback(null, status.getStatus('user_is_not_admin'));
        }
        return donecallback(null, result);
      });
    },
    function(feedbackResult, donecallback) {
      usersModel.getRegisteredCloudTokenByUserId(params.userId, function(err, result) {
        if (err) {
          return callback(err);
        }
        return donecallback(null, feedbackResult, result);
      });
    },
    function(feedbackResult, registeredToken, donecallback) {
      var notificationParams = {};
      notificationParams.user_id = params.userId;
      notificationParams.registeredToken = registeredToken.registeredToken;
      notificationParams.company_id = registeredToken.company_id;
      notificationParams.message = params.feedback;
      sendPushNotification(notificationParams, function(err, result) {
        if (err) {
          return callback(err);
        }
        return donecallback(null, feedbackResult);
      });
    }
  ], function(err, result) {
    var response = status.getStatus('success');
    response.data = {};
    response.data.id = result.insertId;
    return callback(null, response);
  })
};


var sendPushNotification = function(params, callback) {
  async.parallel([
    function(donecallback) {
      dashboardModel.pushNotificationToRTDIndividualUser(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        return donecallback(null, result);
      });
    },
    function(donecallback) {
      dashboardModel.pushNotificationToFCMIndividualUser(params, function(err, result) {
        if (err) {
          return callback(err);
        }
        return donecallback(null, result);
      });
    }
  ], function(err, result) {
    if (err) {
      return callback(status.getStatus('input_missing'));
    }
    return callback(null, result);
  });
}


//by Ashutosh
var getMasterData = function(companyId, callback) {
  dashboardModel.getMasterData(companyId, function(err, result) {
    if (err) {
      return callback(err);
    }

    if (!result) {
      result = [];
    }

    var response = status.getStatus('success');
    response.data = {};
    response.data = result;
    return callback(null, response);
  });
};


var masterQuestionFilter = function(params, callback) {
  if (!params) {
    return callback(null, status.getStatus('input_missing'));
  }
  dashboardModel.masterQuestionFilter(params, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (!result) {
      return callback(null, [])
    }
    var response = status.getStatus('success');
    response.data = {};
    response.data = result;
    return callback(null, response);
  })
}

//by Ashutosh
var getQuestionResponsesOnFilter = function(params, callback) {
  dashboardModel.getQuestionResponsesOnFilter(params, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (!result) {
      result = [];
    }
    var response = status.getStatus('success');
    response.data = {};
    response.data = result;
    return callback(null, response);
  });
};


//by Ashutosh
var getFollowupQuestion = function(params, callback) {
  dashboardModel.getFollowupQuestion(params, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (!result) {
      result = [];
    }
    var response = status.getStatus('success');
    response.data = {};
    response.data = result;
    return callback(null, response);
  });
};

var changeStatusToSeen = function(params, callback) {
  dashboardModel.changeStatusToSeen(params, function(err, result) {
    if (err) {
      return callback(err);
    }
    var response = status.getStatus('success');
    return callback(null, response);
  });
}

module.exports = {
getResponsiveUsers:getResponsiveUsers,
  getUserDetailsByCompanyId: getUserDetailsByCompanyId,
  getSelectiveUserNotification: getSelectiveUserNotification,
  getOrgchartByCompanyId: getOrgchartByCompanyId,
  getQuestionAndBucketSentimentByCompanyId: getQuestionAndBucketSentimentByCompanyId,
  getQuestionResponseByUserId: getQuestionResponseByUserId,
  getRecievedFeedbackForAllUsersByCompanyId: getRecievedFeedbackForAllUsersByCompanyId,
  getUsersStage1: getUsersStage1,
  getUsersStage2: getUsersStage2,
  categoryWiseQuestionSentiment: categoryWiseQuestionSentiment,
  companyBucketWiseAnalytics: companyBucketWiseAnalytics,
  departmentWiseAnalitycs: departmentWiseAnalitycs,
  locationWiseAlalitycs: locationWiseAlalitycs,
  superiorUserWiseAnalytics: superiorUserWiseAnalytics,
  getBucketCategorySentiment: getBucketCategorySentiment,
  pushNotificationForAll: pushNotificationForAll,
  getAllPushedNotificationsByCompanyId: getAllPushedNotificationsByCompanyId,
  getVoluntaryFeedback: getVoluntaryFeedback,
  createVoluntaryFeedback: createVoluntaryFeedback,
  getMasterData: getMasterData, //by Ashutosh
  masterQuestionFilter: masterQuestionFilter, //by Ashutosh
  getQuestionResponsesOnFilter: getQuestionResponsesOnFilter,
  getFollowupQuestion: getFollowupQuestion,
  changeStatusToSeen: changeStatusToSeen,
  getUserFeedbackGenuinity: getUserFeedbackGenuinity, //Added
  getCategoryKeywords: getCategoryKeywords, //Added
  getProgressBar: getProgressBar, //Added
};
