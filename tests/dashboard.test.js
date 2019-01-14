'use strict';

const async = require('async');
const request = require('request');
const config = require('app/configs/config');
const setup = require('./setup');

beforeAll((done) => {
    console.info('Running database setup...');
    async.waterfall([

        (doneCallback) => {
            setup.setup((err, result) => {              // This sets up sql files 01-08
                if (err) {
                    return done(err);
                }

                console.info('Finished database setup 1.');
                return doneCallback(null);
            });
        },

        (doneCallback) => {
            setup.globalData((err, result) => {              // This sets up global data for dashboard
                if (err) {
                    return done(err);
                }

                console.info('Finished database setup 2.');
                return doneCallback(null);
            });
        }

    ], (err, result) => {
        if (err) {
            return done(err);
        }
        return done();
    }); 

}, 100000);             //timeout limit! (x10)

afterAll((done) => {
    setup.teardown(done);                       //This destroys the database
});

beforeEach((done) => {
    expect(process.env.NODE_ENV).toBe('testing');
    return done();
});

test('Test code dashboard is working', done => {          //Trial test case                    
    var r = 1;
    expect(r).toEqual(1);
    done();
});

let data = {};                                            //General request for all dashboard APIs
data.customer = {};
data.customer.options = {
    url: 'http://localhost:3000/dashboard',            //base_url
    method: 'GET',
    json: true,
    headers: {
        'x-origin': 4,                                    //If origin is not 4 then must not be authenticated (Admin origin is 4)
        'x-version': 1,                                   //Version does not play any role. It is just for sending reminders to users to upgrade app
        'x-auth': 'API26testing10token1996Admin'          //Admin's active token, expiry 3018
    },
    qs: {},
    body: {}
};

describe('Admin to see dashboard', () => {

    test('1. GET orgchart', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/orgchart',

            options.body.auth_code = null;

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
    {
        "code": "success",
        "error": false,
        "message": "Successful",
        "data": {
            "people_to_meet": [
                {
                    "user_id": 1277,
                    "user_name": "Nathan Hughes",
                    "location": "Gurgaon",
                    "employee_id": 11080,
                    "designation": "QA Analist",
                    "sentiment": 1.36
                }
            ],
            "company_name": [
                {
                    "company": "Xane.AI"
                }
            ],
             "org_chart_data": [
                {
                    "user_id": 1198,
                    "user_name": "Chloe Smith",
                    "location": "Mumbai",
                    "designation": "CEO",
                    "manager_name": null,
                    "managers_location": null,
                    "sentiment": 5
                }
            ]
        }
    }
            */
            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.people_to_meet).toBeDefined();
            expect(body.data.people_to_meet.length).not.toBe(0);
            expect(body.data.people_to_meet[0].user_id).toBeDefined();
            expect(body.data.people_to_meet[0].user_id).toBeTruthy();
            expect(body.data.people_to_meet[0].user_name).toBeDefined();
            expect(body.data.people_to_meet[0].user_name).toBeTruthy();
            expect(body.data.people_to_meet[0].location).toBeDefined();
            expect(body.data.people_to_meet[0].location).toBeTruthy();
            expect(body.data.people_to_meet[0].employee_id).toBeDefined();
            expect(body.data.people_to_meet[0].employee_id).toBeTruthy();
            expect(body.data.people_to_meet[0].designation).toBeDefined();
            expect(body.data.people_to_meet[0].designation).toBeTruthy();
            expect(body.data.people_to_meet[0].sentiment).toBeDefined();
            expect(body.data.people_to_meet[0].sentiment).toBeTruthy();

            expect(body.data.company_name).toBeDefined();
            expect(body.data.company_name.length).toBe(1);
            expect(body.data.company_name[0].company).toBeDefined();
            expect(body.data.company_name[0].company).toBe('Xane.AI');

            expect(body.data.org_chart_data).toBeDefined();
            expect(body.data.org_chart_data.length).not.toBe(0);
            expect(body.data.org_chart_data[0].user_id).toBeDefined();
            expect(body.data.org_chart_data[0].user_id).toBeTruthy();
            expect(body.data.org_chart_data[0].user_name).toBeDefined();
            expect(body.data.org_chart_data[0].user_name).toBeTruthy();
            expect(body.data.org_chart_data[0].location).toBeDefined();
            expect(body.data.org_chart_data[0].location).toBeTruthy();
            expect(body.data.org_chart_data[0].designation).toBeDefined();
            expect(body.data.org_chart_data[0].designation).toBeTruthy();
            expect(body.data.org_chart_data[0].manager_name).toBeDefined();
            expect(body.data.org_chart_data[0].managers_location).toBeDefined();
            expect(body.data.org_chart_data[0].sentiment).toBeDefined();
            expect(body.data.org_chart_data[0].sentiment).toBeTruthy();

            return done();

        });
    });

    test('2. GET question_and_bucket_sentiment', (done) => {
        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/question_and_bucket_sentiment',

            options.body.auth_code = null;

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
    {
        "code": "success",
        "error": false,
        "message": "Successful",
        "data": {
            "bucket_sentiment": [
                {
                    "bucket": "All",
                    "avg_sentiment": "2.51",
                    "months": [
                        {
                            "date": "May 2018",
                            "sentiment": "2.51"
                        }
                    ]
                }
            ],
            "question_sentiment": [
                {
                    "question_id": 548,
                    "question": "How was your first day at Xane?",
                    "avg_sentiment": 3.73,
                    "date": "May 2018",
                    "positive": 47,
                    "negative": 22,
                    "neutral": 4,
                    "months": [
                        {
                            "date": "May 2018",
                            "sentiment": 3.73
                        }
                    ]
                },
            ]
        }
    }
            */
            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.bucket_sentiment).toBeDefined();
            expect(body.data.bucket_sentiment.length).not.toBe(0);
            expect(body.data.bucket_sentiment[0].bucket).toBeDefined();
            expect(body.data.bucket_sentiment[0].bucket).toBeTruthy();
            expect(body.data.bucket_sentiment[0].avg_sentiment).toBeDefined();
            expect(body.data.bucket_sentiment[0].avg_sentiment).toBeTruthy();
            expect(body.data.bucket_sentiment[0].months).toBeDefined();
            expect(body.data.bucket_sentiment[0].months.length).not.toBe(0);
            expect(body.data.bucket_sentiment[0].months[0].date).toBeDefined();
            expect(body.data.bucket_sentiment[0].months[0].date).toBeTruthy();
            expect(body.data.bucket_sentiment[0].months[0].sentiment).toBeDefined();
            expect(body.data.bucket_sentiment[0].months[0].sentiment).toBeTruthy();

            expect(body.data.question_sentiment).toBeDefined();
            expect(body.data.question_sentiment.length).not.toBe(0);
            expect(body.data.question_sentiment[0].question_id).toBeDefined();
            expect(body.data.question_sentiment[0].question_id).toBeTruthy();
            expect(body.data.question_sentiment[0].question).toBeDefined();
            expect(body.data.question_sentiment[0].question).toBeTruthy();
            expect(body.data.question_sentiment[0].avg_sentiment).toBeDefined();
            expect(body.data.question_sentiment[0].avg_sentiment).toBeTruthy();
            expect(body.data.question_sentiment[0].date).toBeDefined();
            expect(body.data.question_sentiment[0].date).toBeTruthy();
            expect(body.data.question_sentiment[0].positive).toBeDefined();
            expect(body.data.question_sentiment[0].positive).toBeTruthy();
            expect(body.data.question_sentiment[0].negative).toBeDefined();
            expect(body.data.question_sentiment[0].negative).toBeTruthy();
            expect(body.data.question_sentiment[0].neutral).toBeDefined();
            expect(body.data.question_sentiment[0].neutral).toBeTruthy();
            expect(body.data.question_sentiment[0].months).toBeDefined();
            expect(body.data.question_sentiment[0].months.length).not.toBe(0);
            expect(body.data.question_sentiment[0].months[0].date).toBeDefined();
            expect(body.data.question_sentiment[0].months[0].date).toBeTruthy();
            expect(body.data.question_sentiment[0].months[0].sentiment).toBeDefined();
            expect(body.data.question_sentiment[0].months[0].sentiment).toBeTruthy();

            return done();
        });
    });

    test('3. GET question_response', (done) => {
        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1200/question_response',

            options.body.auth_code = null;

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
    {
        "code": "success",
        "error": false,
        "message": "Successful",
        "data": [
            {
                "questionId": 632,
                "question": "How has your journey been with Xane so far?",
                "answers": ":slightly_smiling_face:",
                "response": null,
                "sentiment": 3
            }
        ]
    }
            */
            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.length).not.toBe(0);
            expect(body.data[0].questionId).toBeDefined();
            expect(body.data[0].questionId).toBeTruthy();
            expect(body.data[0].question).toBeDefined();
            expect(body.data[0].question).toBeTruthy();
            expect(body.data[0].answers).toBeDefined();                 //Both answers and response must be defined but one of them wuld be null
            expect(body.data[0].answers).toBeTruthy();
            expect(body.data[0].response).toBeDefined();
            expect(body.data[0].response).toBeNull();
            expect(body.data[0].sentiment).toBeDefined();
            expect(body.data[0].sentiment).toBeTruthy();

            return done();
        });
    });

    test('4. GET feedback_recieved', (done) => {
        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/feedback_recieved',

            options.body.auth_code = null;

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
    {
        "code": "success",
        "error": false,
        "message": "Successful",
        "data": {
            "feedback_data": [
                {
                    "question_id": 562,
                    "question": "Tell me one thing you like the most about working here?",
                    "answer": null,
                    "response": "People",
                    "name": "Xane Demo",
                    "location": "Noida",
                    "employee_id": null,
                    "date": "8th June 2018"
                }
            ]
            "count": 5559
        }
    }
            */
            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.feedback_data).toBeDefined();
            expect(body.data.feedback_data.length).not.toBe(0);
            expect(body.data.feedback_data[0].question_id).toBeDefined();
            expect(body.data.feedback_data[0].question_id).toBeTruthy();
            expect(body.data.feedback_data[0].question).toBeDefined();
            expect(body.data.feedback_data[0].question).toBeTruthy();
            expect(body.data.feedback_data[0].answer).toBeDefined();                        //Both answers and response must be defined but one of them wuld be null
            expect(body.data.feedback_data[0].answer).toBeNull();
            expect(body.data.feedback_data[0].response).toBeDefined();
            expect(body.data.feedback_data[0].response).toBeTruthy();
            expect(body.data.feedback_data[0].name).toBeDefined();
            expect(body.data.feedback_data[0].name).toBeTruthy();
            expect(body.data.feedback_data[0].location).toBeDefined();
            expect(body.data.feedback_data[0].location).toBeTruthy();
            expect(body.data.feedback_data[0].employee_id).toBeDefined();
            expect(body.data.feedback_data[0].employee_id).toBeNull();                      //db has it null
            expect(body.data.feedback_data[0].date).toBeDefined();
            expect(body.data.feedback_data[0].date).toBeTruthy();

            expect(body.data.count).toBeDefined();
            expect(body.data.count).toBeTruthy();

            return done();
        });
    });

    test('5. GET get_user_stage_fill_surveys', (done) => {
        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/get_user_stage_fill_surveys',

            options.body.auth_code = null;

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
    {
        "code": "success",
        "error": false,
        "message": "Successful",
        "data": {
            "users": [
                {
                    "user_id": 1,
                    "user_name": "XaneAi Admin",
                    "location": "Mumbai",
                    "employee_id": null,
                    "email": "admin@xane.ai",
                    "user_answer_id": null,
                    "bucket": [
                        {
                            "bucket": null,
                            "bucket_type": "old"
                        }
                    ]
                },
            ]
        }
    }
            */
            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.users).toBeDefined();
            expect(body.data.users.length).not.toBe(0);
            expect(body.data.users[0].user_id).toBeDefined();
            expect(body.data.users[0].user_id).toBeTruthy();
            expect(body.data.users[0].user_name).toBeDefined();
            expect(body.data.users[0].user_name).toBeTruthy();
            expect(body.data.users[0].location).toBeDefined();
            expect(body.data.users[0].location).toBeTruthy();
            expect(body.data.users[0].employee_id).toBeDefined();
            expect(body.data.users[0].employee_id).toBeNull();
            expect(body.data.users[0].email).toBeDefined();
            expect(body.data.users[0].email).toBeTruthy();
            expect(body.data.users[0].user_answer_id).toBeDefined();
            //expect(body.data.users[0].user_answer_id).toBeTruthy();
            expect(body.data.users[0].bucket).toBeDefined();
            expect(body.data.users[0].bucket.length).not.toBe(0);
            expect(body.data.users[0].bucket[0].bucket).toBeDefined();
            //expect(body.data.users[0].bucket[0].bucket).toBeTruthy();
            expect(body.data.users[0].bucket[0].bucket_type).toBeDefined();
            expect(body.data.users[0].bucket[0].bucket_type).toBeTruthy();

            return done();
        });
    });      //Async timeout! limit set to 15000!! Takes 11 secs (other APIs take 0.6-0.8s on my system)

    test('6. GET get_user_stage_download_app', (done) => {
        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/get_user_stage_download_app',

            options.body.auth_code = null;

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
    {
        "code": "success",
        "error": false,
        "message": "Successful",
        "data": {
            "users": [
                {
                    "user_id": 1137,
                    "user_name": "Xane Demo",
                    "location": "Noida",
                    "employee_id": null,
                    "email": "xane5360@xane.ai",
                    "doj": "2018-04-25T13:00:00.000Z"
                }
            ]
        }
    }
            */
            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.users).toBeDefined();
            expect(body.data.users.length).not.toBe(0);
            expect(body.data.users[0].user_id).toBeDefined();
            expect(body.data.users[0].user_id).toBeTruthy();
            expect(body.data.users[0].user_name).toBeDefined();
            expect(body.data.users[0].user_name).toBeTruthy();
            expect(body.data.users[0].location).toBeDefined();
            expect(body.data.users[0].location).toBeTruthy();
            expect(body.data.users[0].employee_id).toBeDefined();
            expect(body.data.users[0].employee_id).toBeTruthy();
            expect(body.data.users[0].email).toBeDefined();
            expect(body.data.users[0].email).toBeTruthy();
            expect(body.data.users[0].doj).toBeDefined();
            expect(body.data.users[0].doj).toBeTruthy();

            return done();
        });
    });

    test('7. GET questions_category_table', (done) => {
        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/questions_category_table',

            options.body.auth_code = null;

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
    {
        "code": "success",
        "error": false,
        "message": "Successful",
        "data": {
            "category_sentiment": [
                {
                    "category_id": 1,
                    "category_name": "FEEDBACK",
                    "category_sentiment": 2.7,
                    "months": [
                        {
                            "date": "January 2018",
                            "sentiment": 2.71,
                            "survey_cycle": 1,
                            "sentiment_data": [
                                242,
                                45,
                                48,
                                42,
                                166
                            ]
                        }
                    ],
                }
            ],
            "questions_category": [
                {
                    "category_id": 1,
                    "questions": [
                        {
                            "question_id": 548,
                            "question": "How was your first day at Xane?",
                            "sentiment": 3.71
                        }
                    ]
                }
            ],
             "users_answers_by_questions": [
                {
                    "question_id": 548,
                    "followups": [
                        549,
                        550,
                        551
                    ],
                    "subjective_followups": [
                        {
                            "question_id": 549,
                            "question": "What is that one thing you like the most about working here?",
                            "responses": [
                                "Lorem ipsum",
                                "Excepteur sint occaecat cupidatat non proident",
                                "Excepteur sint occaecat cupidatat non proident"
                            ]
                        }
                    ]
                }
            ]
        }
    }
            */
            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.category_sentiment).toBeDefined();
            expect(body.data.category_sentiment.length).not.toBe(0);
            expect(body.data.category_sentiment[0].category_id).toBeDefined();
            expect(body.data.category_sentiment[0].category_id).toBeTruthy();
            expect(body.data.category_sentiment[0].category_name).toBeDefined();
            expect(body.data.category_sentiment[0].category_name).toBeTruthy();
            expect(body.data.category_sentiment[0].category_sentiment).toBeDefined();
            expect(body.data.category_sentiment[0].category_sentiment).toBeTruthy();

            expect(body.data.category_sentiment[0].months).toBeDefined();
            expect(body.data.category_sentiment[0].months.length).not.toBe(0);
            expect(body.data.category_sentiment[0].months[0].date).toBeDefined();
            expect(body.data.category_sentiment[0].months[0].date).toBeTruthy();
            expect(body.data.category_sentiment[0].months[0].sentiment).toBeDefined();
            expect(body.data.category_sentiment[0].months[0].sentiment).toBeTruthy();
            expect(body.data.category_sentiment[0].months[0].survey_cycle).toBeDefined();
            expect(body.data.category_sentiment[0].months[0].survey_cycle).toBeTruthy();
            expect(body.data.category_sentiment[0].months[0].sentiment_data).toBeDefined();
            expect(body.data.category_sentiment[0].months[0].sentiment_data.length).toBe(5);
            expect(body.data.category_sentiment[0].months[0].sentiment_data[0]).toBeTruthy();

            expect(body.data.questions_category).toBeDefined();
            expect(body.data.questions_category.length).not.toBe(0);
            expect(body.data.questions_category[0].category_id).toBeDefined();
            expect(body.data.questions_category[0].category_id).toBeTruthy();
            expect(body.data.questions_category[0].questions).toBeDefined();
            expect(body.data.questions_category[0].questions.length).not.toBe(0);
            expect(body.data.questions_category[0].questions[0].question_id).toBeDefined();
            expect(body.data.questions_category[0].questions[0].question_id).toBeTruthy();
            expect(body.data.questions_category[0].questions[0].question).toBeDefined();
            expect(body.data.questions_category[0].questions[0].question).toBeTruthy();
            expect(body.data.questions_category[0].questions[0].sentiment).toBeDefined();
            expect(body.data.questions_category[0].questions[0].sentiment).toBeTruthy();

            expect(body.data.users_answers_by_questions).toBeDefined();
            expect(body.data.users_answers_by_questions.length).not.toBe(0);
            expect(body.data.users_answers_by_questions[0].question_id).toBeDefined();
            expect(body.data.users_answers_by_questions[0].question_id).toBeTruthy();
            expect(body.data.users_answers_by_questions[0].followups).toBeDefined();
            expect(body.data.users_answers_by_questions[0].followups.length).not.toBe(0);             //Could be blank but not acc to my dbSetup
            expect(body.data.users_answers_by_questions[0].followups[0]).toBeTruthy();

            expect(body.data.users_answers_by_questions[0].subjective_followups).toBeDefined();
            expect(body.data.users_answers_by_questions[0].subjective_followups.length).not.toBe(0);
            expect(body.data.users_answers_by_questions[0].subjective_followups[0].question_id).toBeDefined();
            expect(body.data.users_answers_by_questions[0].subjective_followups[0].question_id).toBeTruthy();
            expect(body.data.users_answers_by_questions[0].subjective_followups[0].question).toBeDefined();
            expect(body.data.users_answers_by_questions[0].subjective_followups[0].question).toBeTruthy();
            expect(body.data.users_answers_by_questions[0].subjective_followups[0].responses).toBeDefined();
            expect(body.data.users_answers_by_questions[0].subjective_followups[0].responses.length).not.toBe(0);
            expect(body.data.users_answers_by_questions[0].subjective_followups[0].responses[0]).toBeTruthy();

            return done();
        });
    });

    test('8. GET org_survey_analytics', (done) => {
        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/org_survey_analytics',

            options.body.auth_code = null;

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
    {
        "bucket_wise_data": {
            "code": "success",
            "error": false,
            "message": "Successful",
            "data": [
                {
                    "avg_sentiment": 2.84,
                    "months": [
                        {
                            "date": "January 2018",
                            "sentiment": 3.33
                        }
                    ],
                    "sentiment_data": [
                        {
                            "avg_sentiment": 1
                        }
                    ],
                    "bucket": "0 - 1"
                }
            ]
        },
        "department_wise_data": {
            "code": "success",
            "error": false,
            "message": "Successful",
            "data": [
                {
                    "avg_sentiment": 2.78,
                    "months": [
                        {
                            "date": "January 2018",
                            "sentiment": 2.75
                        }
                    ],
                    "sentiment_data": [
                        {
                            "avg_sentiment": 1.5
                        }
                    ],
                    "designation": "Software Engineer"
                }
            ]
        },
        "location_wise_data": {
            "code": "success",
            "error": false,
            "message": "Successful",
            "data": [
                {
                    "avg_sentiment": 2.78,
                    "months": [
                        {
                            "date": "January 2018",
                            "sentiment": 2.75
                        }
                    ],
                    "sentiment_data": [
                        {
                            "avg_sentiment": 1.5
                        }
                    ],
                    "city": "Delhi"
                }
            ]
        },
        "hierarchy_wise_data": {
            "code": "success",
            "error": false,
            "message": "Successful",
            "data": [
                {
                    "avg_sentiment": 2.78,
                    "months": [
                        {
                            "date": "January 2018",
                            "sentiment": 2.75
                        }
                    ],
                    "sentiment_data": [
                        {
                            "avg_sentiment": 1.5
                        }
                    ],
                    "superior_user": "RJ"
                }
            ]
        }
    }
            */
            expect(err).toBeNull();
            expect(body).toBeDefined();

            expect(body.bucket_wise_data).toBeDefined();
            expect(body.bucket_wise_data.code).toBeDefined();
            expect(body.bucket_wise_data.code).toBe('success');
            expect(body.bucket_wise_data.error).toBeDefined();
            expect(body.bucket_wise_data.error).toBeFalsy();
            expect(body.bucket_wise_data.message).toBeDefined();
            expect(body.bucket_wise_data.message).toBe('Successful');
            expect(body.bucket_wise_data.data).toBeDefined();
            expect(body.bucket_wise_data.data.length).not.toBe(0);
            expect(body.bucket_wise_data.data[0].avg_sentiment).toBeDefined();
            expect(body.bucket_wise_data.data[0].avg_sentiment).toBeTruthy();
            expect(body.bucket_wise_data.data[0].months).toBeDefined();
            expect(body.bucket_wise_data.data[0].months.length).not.toBe(0);
            expect(body.bucket_wise_data.data[0].months[0].date).toBeDefined();
            expect(body.bucket_wise_data.data[0].months[0].date).toBeTruthy();
            expect(body.bucket_wise_data.data[0].months[0].sentiment).toBeDefined();
            expect(body.bucket_wise_data.data[0].months[0].sentiment).toBeTruthy();
            expect(body.bucket_wise_data.data[0].sentiment_data).toBeDefined();
            expect(body.bucket_wise_data.data[0].sentiment_data.length).not.toBe(0);
            expect(body.bucket_wise_data.data[0].sentiment_data[0].avg_sentiment).toBeDefined();
            expect(body.bucket_wise_data.data[0].sentiment_data[0].avg_sentiment).toBeTruthy();
            expect(body.bucket_wise_data.data[0].bucket).toBeDefined();
            expect(body.bucket_wise_data.data[0].bucket).toBeTruthy();

            expect(body.department_wise_data).toBeDefined();
            expect(body.department_wise_data.code).toBeDefined();
            expect(body.department_wise_data.code).toBe('success');
            expect(body.department_wise_data.error).toBeDefined();
            expect(body.department_wise_data.error).toBeFalsy();
            expect(body.department_wise_data.message).toBeDefined();
            expect(body.department_wise_data.message).toBe('Successful');
            expect(body.department_wise_data.data).toBeDefined();
            expect(body.department_wise_data.data.length).not.toBe(0);
            expect(body.department_wise_data.data[0].avg_sentiment).toBeDefined();
            expect(body.department_wise_data.data[0].avg_sentiment).toBeTruthy();
            expect(body.department_wise_data.data[0].months).toBeDefined();
            expect(body.department_wise_data.data[0].months.length).not.toBe(0);
            expect(body.department_wise_data.data[0].months[0].date).toBeDefined();
            expect(body.department_wise_data.data[0].months[0].date).toBeTruthy();
            expect(body.department_wise_data.data[0].months[0].sentiment).toBeDefined();
            expect(body.department_wise_data.data[0].months[0].sentiment).toBeTruthy();
            expect(body.department_wise_data.data[0].sentiment_data).toBeDefined();
            expect(body.department_wise_data.data[0].sentiment_data.length).not.toBe(0);
            expect(body.department_wise_data.data[0].sentiment_data[0].avg_sentiment).toBeDefined();
            expect(body.department_wise_data.data[0].sentiment_data[0].avg_sentiment).toBeTruthy();
            expect(body.department_wise_data.data[0].designation).toBeDefined();
            expect(body.department_wise_data.data[0].designation).toBeTruthy();

            expect(body.location_wise_data).toBeDefined();
            expect(body.location_wise_data.code).toBeDefined();
            expect(body.location_wise_data.code).toBe('success');
            expect(body.location_wise_data.error).toBeDefined();
            expect(body.location_wise_data.error).toBeFalsy();
            expect(body.location_wise_data.message).toBeDefined();
            expect(body.location_wise_data.message).toBe('Successful');
            expect(body.location_wise_data.data).toBeDefined();
            expect(body.location_wise_data.data.length).not.toBe(0);
            expect(body.location_wise_data.data[0].avg_sentiment).toBeDefined();
            expect(body.location_wise_data.data[0].avg_sentiment).toBeTruthy();
            expect(body.location_wise_data.data[0].months).toBeDefined();
            expect(body.location_wise_data.data[0].months.length).not.toBe(0);
            expect(body.location_wise_data.data[0].months[0].date).toBeDefined();
            expect(body.location_wise_data.data[0].months[0].date).toBeTruthy();
            expect(body.location_wise_data.data[0].months[0].sentiment).toBeDefined();
            expect(body.location_wise_data.data[0].months[0].sentiment).toBeTruthy();
            expect(body.location_wise_data.data[0].sentiment_data).toBeDefined();
            expect(body.location_wise_data.data[0].sentiment_data.length).not.toBe(0);
            expect(body.location_wise_data.data[0].sentiment_data[0].avg_sentiment).toBeDefined();
            expect(body.location_wise_data.data[0].sentiment_data[0].avg_sentiment).toBeTruthy();
            expect(body.location_wise_data.data[0].city).toBeDefined();
            expect(body.location_wise_data.data[0].city).toBeTruthy();

            expect(body.hierarchy_wise_data).toBeDefined();
            expect(body.hierarchy_wise_data.code).toBeDefined();
            expect(body.hierarchy_wise_data.code).toBe('success');
            expect(body.hierarchy_wise_data.error).toBeDefined();
            expect(body.hierarchy_wise_data.error).toBeFalsy();
            expect(body.hierarchy_wise_data.message).toBeDefined();
            expect(body.hierarchy_wise_data.message).toBe('Successful');
            expect(body.hierarchy_wise_data.data).toBeDefined();
            expect(body.hierarchy_wise_data.data.length).not.toBe(0);
            expect(body.hierarchy_wise_data.data[0].avg_sentiment).toBeDefined();
            expect(body.hierarchy_wise_data.data[0].avg_sentiment).toBeTruthy();
            expect(body.hierarchy_wise_data.data[0].months).toBeDefined();
            expect(body.hierarchy_wise_data.data[0].months.length).not.toBe(0);
            expect(body.hierarchy_wise_data.data[0].months[0].date).toBeDefined();
            expect(body.hierarchy_wise_data.data[0].months[0].date).toBeTruthy();
            expect(body.hierarchy_wise_data.data[0].months[0].sentiment).toBeDefined();
            expect(body.hierarchy_wise_data.data[0].months[0].sentiment).toBeTruthy();
            expect(body.hierarchy_wise_data.data[0].sentiment_data).toBeDefined();
            expect(body.hierarchy_wise_data.data[0].sentiment_data.length).not.toBe(0);
            expect(body.hierarchy_wise_data.data[0].sentiment_data[0].avg_sentiment).toBeDefined();
            expect(body.hierarchy_wise_data.data[0].sentiment_data[0].avg_sentiment).toBeTruthy();
            expect(body.hierarchy_wise_data.data[0].superior_user).toBeDefined();
            expect(body.hierarchy_wise_data.data[0].superior_user).toBeTruthy();

            return done();
        });
    });            //Async timeout! limit set to 20000!! Takes 17 secs (other APIs take 0.6-0.8s on my system)

    test('9. GET bucket_category_sentiment', (done) => {
        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/bucket_category_sentiment',

            options.body.auth_code = null;

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
    {
        "code": "success",
        "error": false,
        "message": "Successful",
        "data": {
            "bucket_sentiment": [
                {
                    "bucket": "0-1",
                    "Category": [
                        {
                            "category_id": 1,
                            "category_name": "FEEDBACK",
                            "category_sentiment": 3.37
                        }
                    ]
                }
            ]
        }
    }
            */
            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.bucket_sentiment).toBeDefined();
            expect(body.data.bucket_sentiment.length).not.toBe(0);
            expect(body.data.bucket_sentiment[0].bucket).toBeDefined();
            expect(body.data.bucket_sentiment[0].bucket).toBeTruthy();
            expect(body.data.bucket_sentiment[0].Category).toBeDefined();
            expect(body.data.bucket_sentiment[0].Category.length).not.toBe(0);
            expect(body.data.bucket_sentiment[0].Category[0].category_id).toBeDefined();
            expect(body.data.bucket_sentiment[0].Category[0].category_id).toBeTruthy();
            expect(body.data.bucket_sentiment[0].Category[0].category_name).toBeDefined();
            expect(body.data.bucket_sentiment[0].Category[0].category_name).toBeTruthy();
            expect(body.data.bucket_sentiment[0].Category[0].category_sentiment).toBeDefined();
            expect(body.data.bucket_sentiment[0].Category[0].category_sentiment).toBeTruthy();

            return done();
        });
    });

});

describe('User access must be denied', () => {           

    test('1. GET questions_category_table', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/orgchart';
        options.headers['x-auth'] = 'NOT88AN88ADMIN';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');


            return done();
        });
    });

    test('2. GET question_and_bucket_sentiment', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/question_and_bucket_sentiment';
        options.headers['x-auth'] = 'NOT88AN88ADMIN';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('3. GET question_response', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1200/question_response';
        options.headers['x-auth'] = 'NOT88AN88ADMIN';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('4. GET feedback_recieved', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/feedback_recieved';
        options.headers['x-auth'] = 'NOT88AN88ADMIN';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('5. GET get_user_stage_fill_surveys', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/get_user_stage_fill_surveys';
        options.headers['x-auth'] = 'NOT88AN88ADMIN';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('6. GET get_user_stage_download_app', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/get_user_stage_download_app';
        options.headers['x-auth'] = 'NOT88AN88ADMIN';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('7. GET questions_category_table', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/questions_category_table';
        options.headers['x-auth'] = 'NOT88AN88ADMIN';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('8. GET org_survey_analytics', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/org_survey_analytics';
        options.headers['x-auth'] = 'NOT88AN88ADMIN';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('9. GET bucket_category_sentiment', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/bucket_category_sentiment';
        options.headers['x-auth'] = 'NOT88AN88ADMIN';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

});     //All fail... Revision in code required

describe('Origin if not 4 must be denied', () => {

    test('1. GET questions_category_table', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/orgchart';
        options.headers['origin'] = '1';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('2. GET question_and_bucket_sentiment', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/question_and_bucket_sentiment';
        options.headers['origin'] = '2';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('3. GET question_response', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1200/question_response';
        options.headers['origin'] = '3';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('4. GET feedback_recieved', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/feedback_recieved';
        options.headers['origin'] = '1';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('5. GET get_user_stage_fill_surveys', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/get_user_stage_fill_surveys';
        options.headers['origin'] = '2';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('6. GET get_user_stage_download_app', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/get_user_stage_download_app';
        options.headers['origin'] = '3';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('7. GET questions_category_table', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/questions_category_table';
        options.headers['origin'] = '1';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('8. GET org_survey_analytics', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/org_survey_analytics';
        options.headers['origin'] = '2';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

    test('9. GET bucket_category_sentiment', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/bucket_category_sentiment';
        options.headers['origin'] = '3';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authr_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Authorisation failed');

            return done();
        });
    });

});     //All fail... Revision in code required

describe('Company Id requested is missing', () => {         //Giving blank array instead of faulty input/missing input message

    test('1. GET orgchart', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/9999/orgchart';
        options.headers['x-auth'] = 'API26testing10token1996Admin';

        request(options, (err, response, body) => {

            /*expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBeTruthy();
            expect(body.data).toBeDefined();

            expect(body.data.people_to_meet).toBeDefined();
            expect(body.data.people_to_meet.length).toBe(0);
            expect(body.data.company_name).toBeDefined();
            expect(body.data.company_name.length).toBe(0);
            expect(body.data.org_chart_data).toBeDefined();
            expect(body.data.org_chart_data.length).toBe(0);*/

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('2. GET question_and_bucket_sentiment', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/9999/question_and_bucket_sentiment';
        options.headers['x-auth'] = 'API26testing10token1996Admin';

        request(options, (err, response, body) => {

            /*expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBeTruthy();
            expect(body.data).toBeDefined();

            expect(body.data.bucket_sentiment).toBeDefined();
            expect(body.data.bucket_sentiment.length).toBe(0);
            expect(body.data.question_sentiment).toBeDefined();
            expect(body.data.question_sentiment.length).toBe(0);*/

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('3. GET question_response', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/9999/question_response';
        options.headers['x-auth'] = 'API26testing10token1996Admin';

        request(options, (err, response, body) => {

            /*expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBeTruthy();
            expect(body.data).toBeDefined();
            expect(body.data.length).toBe(0);*/

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('4. GET feedback_recieved', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/9999/feedback_recieved';
        options.headers['x-auth'] = 'API26testing10token1996Admin';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('5. GET get_user_stage_fill_surveys', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/9999/get_user_stage_fill_surveys';
        options.headers['x-auth'] = 'API26testing10token1996Admin';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('6. GET get_user_stage_download_app', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/9999/get_user_stage_download_app';
        options.headers['x-auth'] = 'API26testing10token1996Admin';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('7. GET questions_category_table', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/9999/questions_category_table';
        options.headers['x-auth'] = 'API26testing10token1996Admin';

        request(options, (err, response, body) => {

            /*expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            //expect(body.code).toBe('Company missing');
            expect(body.code).toBeTruthy();
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            //expect(body.message).toBe('company_missing');
            expect(body.message).toBeTruthy();*/

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });     //Two messages specified for missing company

    test('8. GET org_survey_analytics', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/9999/org_survey_analytics';
        options.headers['x-auth'] = 'API26testing10token1996Admin';

        request(options, (err, response, body) => {

            /*expect(err).toBeNull();
            expect(body).toBeDefined();

            expect(body.bucket_wise_data).toBeDefined();
            expect(body.bucket_wise_data.code).toBeDefined();
            expect(body.bucket_wise_data.code).toBe('success');
            expect(body.bucket_wise_data.error).toBeDefined();
            expect(body.bucket_wise_data.error).toBeFalsy();
            expect(body.bucket_wise_data.message).toBeDefined();
            expect(body.bucket_wise_data.message).toBe('Successful');
            expect(body.bucket_wise_data.data).toBeDefined();
            expect(body.bucket_wise_data.data.length).toBe(0);

            expect(body.department_wise_data).toBeDefined();
            expect(body.department_wise_data.code).toBeDefined();
            expect(body.department_wise_data.code).toBe('success');
            expect(body.department_wise_data.error).toBeDefined();
            expect(body.department_wise_data.error).toBeFalsy();
            expect(body.department_wise_data.message).toBeDefined();
            expect(body.department_wise_data.message).toBe('Successful');
            expect(body.department_wise_data.data).toBeDefined();
            expect(body.department_wise_data.data.length).toBe(0);

            expect(body.location_wise_data).toBeDefined();
            expect(body.location_wise_data.code).toBeDefined();
            expect(body.location_wise_data.code).toBe('success');
            expect(body.location_wise_data.error).toBeDefined();
            expect(body.location_wise_data.error).toBeFalsy();
            expect(body.location_wise_data.message).toBeDefined();
            expect(body.location_wise_data.message).toBe('Successful');
            expect(body.location_wise_data.data).toBeDefined();
            expect(body.location_wise_data.data.length).toBe(0);

            expect(body.hierarchy_wise_data).toBeDefined();
            expect(body.hierarchy_wise_data.code).toBeDefined();
            expect(body.hierarchy_wise_data.code).toBe('success');
            expect(body.hierarchy_wise_data.error).toBeDefined();
            expect(body.hierarchy_wise_data.error).toBeFalsy();
            expect(body.hierarchy_wise_data.message).toBeDefined();
            expect(body.hierarchy_wise_data.message).toBe('Successful');
            expect(body.hierarchy_wise_data.data).toBeDefined();
            expect(body.hierarchy_wise_data.data.length).toBe(0);*/

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('9. GET bucket_category_sentiment', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/9999/bucket_category_sentiment';
        options.headers['x-auth'] = 'API26testing10token1996Admin';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

});     //Non-uniformity in response

describe('Auth token is blank', () => {         //Giving blank array instead of faulty input/missing input message

    test('1. GET orgchart', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/orgchart';
        options.headers['x-auth'] = '';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('2. GET question_and_bucket_sentiment', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/question_and_bucket_sentiment';
        options.headers['x-auth'] = '';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('3. GET question_response', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1200/question_response';
        options.headers['x-auth'] = '';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('4. GET feedback_recieved', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/feedback_recieved';
        options.headers['x-auth'] = '';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('5. GET get_user_stage_fill_surveys', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/get_user_stage_fill_surveys';
        options.headers['x-auth'] = '';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('6. GET get_user_stage_download_app', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/get_user_stage_download_app';
        options.headers['x-auth'] = '';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('7. GET questions_category_table', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/questions_category_table';
        options.headers['x-auth'] = '';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });    

    test('8. GET org_survey_analytics', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/org_survey_analytics';
        options.headers['x-auth'] = '';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

    test('9. GET bucket_category_sentiment', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/1/bucket_category_sentiment';
        options.headers['x-auth'] = '';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');

            return done();
        });
    });

});