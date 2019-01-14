'use strict';
var status = require('app/configs/status');
var dashboardService = require('app/services/dashboard');
var async = require('async');



var getResponsiveUsers = function(req, res, next) {
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }
  var companyId = parseInt(req.params.companyId);
  dashboardService.getResponsiveUsers(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};



var getUserDetails = function(req, res, next) {
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }
  var companyId = parseInt(req.params.companyId);
  dashboardService.getUserDetailsByCompanyId(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};



var getSelectiveUserNotification = function(req, res, next) {

var users = {};

  req.body.companyId ? users.companyId = parseInt(req.body.companyId) : null;
  req.body.id_location ? users.location = req.body.id_location : null;
  req.body.id_department ? users.department = req.body.id_department : null;
  req.body.id_designation ? users.designation = req.body.id_designation : null;
  req.body.id_theme ? users.theme = req.body.id_theme : null;
  req.body.id_tenure ? users.tenure = req.body.id_tenure : null;



  dashboardService.getSelectiveUserNotification(users, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });



};





var getorgchart = function(req, res, next) {
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }
  var companyId = parseInt(req.params.companyId);
  dashboardService.getOrgchartByCompanyId(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var getQuestionAndBucketSentimentByCompanyId = function(req, res, next) {
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }
  var companyId = parseInt(req.params.companyId);
  dashboardService.getQuestionAndBucketSentimentByCompanyId(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var getRecievedFeedbackForAllUsersByCompanyId = function(req, res, next) {
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }
  var pagination = {};
  if (req.query.limit) {
    pagination = req.query;
  } else {
    pagination.limit = 100
    pagination.offset = 0
  }
  var companyId = parseInt(req.params.companyId);
  dashboardService.getRecievedFeedbackForAllUsersByCompanyId(pagination, companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var getQuestionResponseByUserId = function(req, res, next) {
  if (!req.params.userId) {
    return next(status.getStatus('input_missing'));
  }
  var userId = parseInt(req.params.userId);
  dashboardService.getQuestionResponseByUserId(userId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result)
  });
}


var getUsersStageFillSurveys = function(req, res, next) {
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }

  var companyId = parseInt(req.params.companyId);
  dashboardService.getUsersStage1(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var getUsersStageDownloadApp = function(req, res, next) {
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }

  var companyId = parseInt(req.params.companyId);
  dashboardService.getUsersStage2(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var categoryWiseQuestionSentiment = function(req, res, next) {
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }

  var companyId = parseInt(req.params.companyId);
  dashboardService.categoryWiseQuestionSentiment(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};

var orgSurveyAnalytics = function(req, res, next) {

  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }
  var companyId = parseInt(req.params.companyId);
  async.parallel([
    function(donecallback) {
      dashboardService.companyBucketWiseAnalytics(companyId, function(err, result) {
        if (err) {
          return donecallback(status.getStatus('input_missing'));
        }
        return donecallback(null, result);
      });
    },
    function(donecallback) {
      dashboardService.departmentWiseAnalitycs(companyId, function(err, result) {
        if (err) {
          return donecallback(status.getStatus('input_missing'));
        }
        return donecallback(null, result);
      });
    },
    function(donecallback) {
      dashboardService.locationWiseAlalitycs(companyId, function(err, result) {
        if (err) {
          return donecallback(status.getStatus('input_missing'));
        }
        return donecallback(null, result);
      });
    },
    function(donecallback) {
      dashboardService.superiorUserWiseAnalytics(companyId, function(err, result) {
        if (err) {
          return donecallback(status.getStatus('input_missing'));
        }
        return donecallback(null, result);
      });
    }
  ], function(err, result) {
    if (err) {
      return next(err);
    }
    var data = {};
    data.bucket_wise_data = result[0];
    data.department_wise_data = result[1];
    data.location_wise_data = result[2];
    data.hierarchy_wise_data = result[3];
    return res.json(data);
  });
}

var getBucketCategorySentiment = function(req, res, next) { //Added
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }

  var companyId = parseInt(req.params.companyId);
  dashboardService.getBucketCategorySentiment(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};

var pushNotificationForAll = function(req, res, next) {
  if (!req.body.companyId || !req.body.message || !req.body.title) {
    return next(status.getStatus('input_missing'));
  }

  var notificationParams = {};
  notificationParams.companyId = parseInt(req.body.companyId);
  notificationParams.title = req.body.title;
  notificationParams.message = req.body.message;
  notificationParams.messageTime = new Date(new Date().getTime() + 11 * 30 * 60000).toISOString().slice(0, 19).replace('T', ' ');
  dashboardService.pushNotificationForAll(notificationParams, function(err, result) {
    if (err) {
      return next(err);
    }

    return res.json(result);
  })

};

var getAllPushedNotifications = function(req, res, next) {
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }

  let params = {};
  params.companyId = parseInt(req.params.companyId);
  dashboardService.getAllPushedNotificationsByCompanyId(params, function(err, result) {
    if (err) {
      return next(err);
    }

    return res.json(result);

  })
};

var getVoluntaryFeedback = function(req, res, next) { //Added
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }

  var params = {};
  params.companyId = parseInt(req.params.companyId);
  dashboardService.getVoluntaryFeedback(params, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};



var createVoluntaryFeedback = function(req, res, next) {
  if (!req.body.feedback || !req.body.feedback_token || !req.body.user_id) {
    return next(status.getStatus('input_missing'));
  }
  var params = {};
  params.feedback = req.body.feedback;
  params.adminId = req._user.id;
  params.userId = req.body.user_id;
  params.feedback_token = req.body.feedback_token;
  dashboardService.createVoluntaryFeedback(params, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};



var getMasterData = function(req, res, next) { //Added
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }

  var companyId = parseInt(req.params.companyId);
  dashboardService.getMasterData(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var masterQuestionFilter = function(req, res, next) { //by Ashutosh
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }
  var params = {};
  params.companyId = parseInt(req.params.companyId);
  req.query.category_id ? params.categoryId = parseInt(req.query.category_id) : null;
  req.query.city_id ? params.cityId = parseInt(req.query.city_id) : null;
  req.query.designation_id ? params.designationId = parseInt(req.query.designation_id) : null;
  req.query.department_id ? params.departmentId = parseInt(req.query.department_id) : null;
  req.query.company_target_id ? params.company_targetId = parseInt(req.query.company_target_id) : null;

  dashboardService.masterQuestionFilter(params, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var getQuestionResponsesOnFilter = function(req, res, next) { //by Ashutosh
  if (!req.params.questionId) {
    return next(status.getStatus('input_missing'));
  }
  var params = {};
  params.questionId = parseInt(req.params.questionId);
  req.query.category_id ? params.categoryId = parseInt(req.query.category_id) : null;
  req.query.city_id ? params.cityId = parseInt(req.query.city_id) : null;
  req.query.designation_id ? params.designationId = parseInt(req.query.designation_id) : null;
  req.query.department_id ? params.departmentId = parseInt(req.query.department_id) : null;

  dashboardService.getQuestionResponsesOnFilter(params, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var getFollowupQuestion = function(req, res, next) { //by Ashutosh
  if (!req.params.questionId) {
    return next(status.getStatus('input_missing'));
  }
  var params = {};
  params.questionId = parseInt(req.params.questionId);

  dashboardService.getFollowupQuestion(params, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};

var changeStatusToSeen = function(req, res, next) {
  if (!req.params.token) {
    return next(status.getStatus('input_missing'));
  }
  var params = {};
  params.token = req.params.token;

  dashboardService.changeStatusToSeen(params, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
}

var getUserFeedbackGenuinity = function(req, res, next) { //Added
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }

  var companyId = parseInt(req.params.companyId);
  dashboardService.getUserFeedbackGenuinity(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};

var getCategoryKeywords = function(req, res, next) { //Added
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }

  var companyId = parseInt(req.params.companyId);
  dashboardService.getCategoryKeywords(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};

var getProgressBar = function(req, res, next) { //Added
  if (!req.params.companyId) {
    return next(status.getStatus('input_missing'));
  }

  var companyId = parseInt(req.params.companyId);
  dashboardService.getProgressBar(companyId, function(err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};

module.exports = {
  getResponsiveUsers:getResponsiveUsers,
  getUserDetails: getUserDetails,
  getSelectiveUserNotification: getSelectiveUserNotification,

  getorgchart: getorgchart,
  getQuestionAndBucketSentimentByCompanyId: getQuestionAndBucketSentimentByCompanyId,
  getQuestionResponseByUserId: getQuestionResponseByUserId,
  getRecievedFeedbackForAllUsersByCompanyId: getRecievedFeedbackForAllUsersByCompanyId,
  getUsersStageDownloadApp: getUsersStageDownloadApp,
  getUsersStageFillSurveys: getUsersStageFillSurveys,
  categoryWiseQuestionSentiment: categoryWiseQuestionSentiment,
  orgSurveyAnalytics: orgSurveyAnalytics,
  pushNotificationForAll: pushNotificationForAll,
  getAllPushedNotifications: getAllPushedNotifications,
  getVoluntaryFeedback: getVoluntaryFeedback, // by Ashutosh
  createVoluntaryFeedback: createVoluntaryFeedback, // by Ashutosh      //modified by Raghav
  getMasterData: getMasterData, //by Ashutosh
  masterQuestionFilter: masterQuestionFilter, //by Ashutosh
  getQuestionResponsesOnFilter: getQuestionResponsesOnFilter,
  getFollowupQuestion: getFollowupQuestion,
  changeStatusToSeen: changeStatusToSeen,
  getBucketCategorySentiment: getBucketCategorySentiment, //Added
  getUserFeedbackGenuinity: getUserFeedbackGenuinity, //Added
  getCategoryKeywords: getCategoryKeywords, //Added
  getProgressBar: getProgressBar, //Added
};
