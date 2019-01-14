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
            setup.globalData((err, result) => {              // This sets up global data for auths
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

test('Test code surveys is working', done => {          //Trial test case                    
    var r = 1;
    expect(r).toEqual(1);
    done();
});

var token;

let log = {};                                               //For login and admin x-auth token generation
log.customer = {};

log.customer.options = {
    url: 'http://localhost:3000/auths/login',            //base_url?
    method: 'POST',
    json: true,
    headers: {
        'x-origin': 1,
        'x-version': 2,
        'x-auth': null,
    },
    qs: {},                                             //query string
    body: {                                             //Put admin credentials here
        "email": "DoctorStrange@xanebot.ai",
        "password": "API"
    }
};

let data = {};                                            //General request for all dashboard APIs
data.customer = {};

test('0. POST login', (done) => {                                  //Has only test of admin login success case... In depth test is in auths.test.js

    let options = JSON.parse(JSON.stringify(log.customer.options));

    request(options, (err, response, body) => {
        // The expected object is something like
        /*
{
    "code": "success",
    "error": false,
    "message": "Successful",
    "data": {
        "user": {
            "id": 1,
            "name": "XaneAi Admin",
            "designation": "Software Engineer",
            "role": {
                "id": 1,
                "role": "superadmin"
            }
        },
        "session": {
            "token": "a850268fa69c4e8480d6c4a749af59fd"         //This token value would vary on every API hit
        },
        "company": {
            "company_id": 1,
            "company_name": "Xane.AI"
        }
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

        expect(body.data.user).toBeDefined();
        expect(body.data.user.id).toBeDefined();
        expect(body.data.user.id).toBe(1292);
        expect(body.data.user.name).toBeDefined();
        expect(body.data.user.name).toBe('Stephen Strange');
        expect(body.data.user.designation).toBeDefined();
        expect(body.data.user.designation).toBe('Buseness Developement');
        expect(body.data.user.role).toBeDefined();
        expect(body.data.user.role.id).toBeDefined();
        expect(body.data.user.role.id).toBe(2);
        expect(body.data.user.role.role).toBeDefined();
        expect(body.data.user.role.role).toBe('employee');

        expect(body.data.session).toBeDefined();
        expect(body.data.session.token).toBeDefined();
        expect(body.data.session.token).toBeTruthy();

        expect(body.data.company).toBeDefined();
        expect(body.data.company.company_id).toBeDefined();
        expect(body.data.company.company_id).toBe(1);
        expect(body.data.company.company_name).toBeDefined();
        expect(body.data.company.company_name).toBe('Xane.AI');

        token = body.data.session.token;

        data.customer.options = {
            url: 'http://localhost:3000/surveys',            //base_url
            method: 'GET',
            json: true,
            headers: {
                'x-origin': 1,
                'x-version': 2,
                'x-auth': token
            },
            qs: {},
            body: {}
        };

        return done();
    });
});

test('1. GET surveys/active', (done) => {

    let options = JSON.parse(JSON.stringify(data.customer.options));

    options.url = options.url + '/active',

    request(options, (err, response, body) => {
        // The expected object is something like
        /*
{
    "code": "success",
    "error": false,
    "message": "Successful",
    "data": {
        "surveys": [
            {
                "id": 28,
                "answered_questions": [
                    {
                        "question_id": 632,
                        "question": "How has your journey been with Xane so far?",
                        "answer_id": 764,
                        "answer_sequence": 4,
                        "answer": ":slightly_frowning_face:",
                        "created_at": "2018-05-31T05:30:37.000Z"
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

        expect(body.data.surveys).toBeDefined();
        expect(body.data.surveys.length).not.toBe(0);
        expect(body.data.surveys[0].id).toBeDefined();
        expect(body.data.surveys[0].id).toBeTruthy();
        expect(body.data.surveys[0].answered_questions).toBeDefined();
        expect(body.data.surveys[0].answered_questions.length).not.toBe(0);
        expect(body.data.surveys[0].answered_questions[0].question_id).toBeDefined();
        expect(body.data.surveys[0].answered_questions[0].question_id).toBeTruthy();
        expect(body.data.surveys[0].answered_questions[0].question).toBeDefined();
        expect(body.data.surveys[0].answered_questions[0].question).toBeTruthy();
        expect(body.data.surveys[0].answered_questions[0].answer_id).toBeDefined();
        expect(body.data.surveys[0].answered_questions[0].answer_id).toBeTruthy();
        expect(body.data.surveys[0].answered_questions[0].answer_sequence).toBeDefined();
        expect(body.data.surveys[0].answered_questions[0].answer_sequence).toBeTruthy();
        expect(body.data.surveys[0].answered_questions[0].answer).toBeDefined();
        expect(body.data.surveys[0].answered_questions[0].answer).toBeTruthy();
        expect(body.data.surveys[0].answered_questions[0].created_at).toBeDefined();
        expect(body.data.surveys[0].answered_questions[0].created_at).toBeTruthy();
        return done();

    });
});

describe('2. POST surveys/28/answers', () => {

    test('Objective answer with subjective next question', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/28/answers';
        options.method = 'POST';
        options.headers['content-type'] = 'application/json; charset=utf-8';

        options.body.question_id = '548';
        options.body.answer_id = '668';

        request(options, (err, response, body) => {
        // The expected object is something like       
        /*{
            "code": "success",
            "error": false,
            "message": "Successful",
            "data": {
                "next_question": {
                    "question_id": 549,
                    "question": "What is that one thing you like the most about working here?",
                    "answer": [
                            {
                            "id": null,
                            "answer": null,
                            "sequence": null,
                            "prequel_text": "Awesome. First few days at a new workplace are quiet crucial, I am glad you had a good experience"
                            }
                    ]
                }
            }   
        }*/

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.next_question).toBeDefined();
            expect(body.data.next_question.question_id).toBeDefined();
            expect(body.data.next_question.question_id).toBe(549);
            expect(body.data.next_question.question).toBeDefined();
            expect(body.data.next_question.question).toBe('What is that one thing you like the most about working here?');
            expect(body.data.next_question.answer).toBeDefined();
            expect(body.data.next_question.answer.length).not.toBe(0);

            expect(body.data.next_question.answer[0].id).toBeDefined();
            expect(body.data.next_question.answer[0].id).toBeNull();
            expect(body.data.next_question.answer[0].answer).toBeDefined();
            expect(body.data.next_question.answer[0].answer).toBeNull();
            expect(body.data.next_question.answer[0].sequence).toBeDefined();
            expect(body.data.next_question.answer[0].sequence).toBeNull();
            expect(body.data.next_question.answer[0].prequel_text).toBeDefined();
            expect(body.data.next_question.answer[0].prequel_text).toBe('Awesome. First few days at a new workplace are quiet crucial, I am glad you had a good experience');

            return done();
        });
    });

    test('Subjective answer with objective next question', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/28/answers';
        options.method = 'POST';
        options.headers['content-type'] = 'application/json; charset=utf-8';

        options.body.question_id = 549;
        options.body.answer = 'I am very happy';

        request(options, (err, response, body) => {
        // The expected object is something like       
        /*{
            "code": "success",
            "error": false,
            "message": "Successful",
            data": {
                "next_question": {
                    "question_id": 552,
                    "question": "One more thing, Does your manager effectively communicate the objectives for the company to achieve?",
                    "answer": [
                        {
                            "id": 673,
                            "answer": "Yes, Very Clearly",
                            "sequence": 1,
                            "prequel_text": "Sounds great. You got a good manager."
                        }
                    ]
                }
            }
        }*/

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.next_question).toBeDefined();
            expect(body.data.next_question.question_id).toBeDefined();
            expect(body.data.next_question.question_id).toBe(552);
            expect(body.data.next_question.question).toBeDefined();
            expect(body.data.next_question.question).toBe('One more thing, Does your manager effectively communicate the objectives for the company to achieve?');
            expect(body.data.next_question.answer).toBeDefined();
            expect(body.data.next_question.answer.length).not.toBe(0);

            expect(body.data.next_question.answer[0].id).toBeDefined();
            expect(body.data.next_question.answer[0].id).toBe(673);
            expect(body.data.next_question.answer[0].answer).toBeDefined();
            expect(body.data.next_question.answer[0].answer).toBe('Yes, Very Clearly');
            expect(body.data.next_question.answer[0].sequence).toBeDefined();
            expect(body.data.next_question.answer[0].sequence).toBe(1);
            expect(body.data.next_question.answer[0].prequel_text).toBeDefined();
            expect(body.data.next_question.answer[0].prequel_text).toBe('Sounds great. You got a good manager.');

            return done();
        });
    });

    test('Objective answer with objective next question', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/28/answers';
        options.method = 'POST';
        options.headers['content-type'] = 'application/json; charset=utf-8';

        options.body.question_id = 552;
        options.body.answer_id = 673;

        request(options, (err, response, body) => {
            // The expected object is something like       
            /*{
                "code": "success",
                "error": false,
                "message": "Successful",
                data": {
                    "next_question": {
                        "question_id": 555,
                        "question": "Is the pace of Training optimum, to get complete hold on your job?",
                        "answer": [
                            {
                                "id": 676,
                                "answer": "Yes",
                                "sequence": 1,
                                "prequel_text": "Nice. Learning at the right pace is like surfing on the perfect wave."
                            }
                        ]
                    }
                }
            }*/

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.next_question).toBeDefined();
            expect(body.data.next_question.question_id).toBeDefined();
            expect(body.data.next_question.question_id).toBe(555);
            expect(body.data.next_question.question).toBeDefined();
            expect(body.data.next_question.question).toBe('Is the pace of Training optimum, to get complete hold on your job?');
            expect(body.data.next_question.answer).toBeDefined();
            expect(body.data.next_question.answer.length).not.toBe(0);

            expect(body.data.next_question.answer[0].id).toBeDefined();
            expect(body.data.next_question.answer[0].id).toBe(676);
            expect(body.data.next_question.answer[0].answer).toBeDefined();
            expect(body.data.next_question.answer[0].answer).toBe('Yes');
            expect(body.data.next_question.answer[0].sequence).toBeDefined();
            expect(body.data.next_question.answer[0].sequence).toBe(1);
            expect(body.data.next_question.answer[0].prequel_text).toBeDefined();
            expect(body.data.next_question.answer[0].prequel_text).toBe('Nice. Learning at the right pace is like surfing on the perfect wave.');

            return done();
        });
    });

    test('Next question is null', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/28/answers';
        options.method = 'POST';
        options.headers['content-type'] = 'application/json; charset=utf-8';

        options.body.question_id = 562;
        options.body.answer = 'This is the end';

        request(options, (err, response, body) => {
            // The expected object is something like       
            /*{
                "code": "success",
                "error": false,
                "message": "Successful",
                data": {
                    "next_question": {
                        "question_id": null,
                        "question": null,
                        "answer": [
                            {
                                "id": null,
                                "answer": null,
                                "sequence": null,
                                "prequel_text": null
                            }
                        ]
                    }
                }
            }*/

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.next_question).toBeDefined();
            expect(body.data.next_question.question_id).toBeDefined();
            expect(body.data.next_question.question_id).toBeNull();
            expect(body.data.next_question.question).toBeDefined();
            expect(body.data.next_question.question).toBeNull();
            expect(body.data.next_question.answer).toBeDefined();
            expect(body.data.next_question.answer.length).not.toBeNull();

            expect(body.data.next_question.answer[0].id).toBeDefined();
            expect(body.data.next_question.answer[0].id).toBeNull();
            expect(body.data.next_question.answer[0].answer).toBeDefined();
            expect(body.data.next_question.answer[0].answer).toBeNull();
            expect(body.data.next_question.answer[0].sequence).toBeDefined();
            expect(body.data.next_question.answer[0].sequence).toBeNull();
            expect(body.data.next_question.answer[0].prequel_text).toBeDefined();
            expect(body.data.next_question.answer[0].prequel_text).toBeNull();

            return done();
        });
    });

    test('Answer_id missing for objective question', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/28/answers';
        options.method = 'POST';
        options.headers['content-type'] = 'application/json; charset=utf-8';

        options.body.question_id = 548;
        options.body.answer = 'dddd';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');
            expect(body.data).toBeDefined();

            return done();
        });
    });

    test('Answer missing for subjective question', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/28/answers';
        options.method = 'POST';
        options.headers['content-type'] = 'application/json; charset=utf-8';

        options.body.question_id = 549;
        options.body.answer_id = 673;

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('input_missing');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Missing mandatory input fields');
            expect(body.data).toBeDefined();

            return done();
        });
    });

    test('Question_id missing', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/28/answers';
        options.method = 'POST';
        options.headers['content-type'] = 'application/json; charset=utf-8';

        options.body.answer_id = 673;

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

describe('3. GET surveys/28', () => {

    test('Survey Id exists', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/28';

        request(options, (err, response, body) => {
            // The expected object is something like       
            /*{
                "code": "success",
                "error": false,
                "message": "Successful",
                "data": {
                    "survey": {
                        "id": 28,
                        "survey_type": "Pulse",
                        "company": "Xane.AI",
                        "first_question_id": null,
                        "questions": [
                            {
                                "id": 632,                              //Objective question with multiple answer routes
                                "question": "How has your journey been with Xane so far?",
                                "answers":[
                                    {
                                        "id": 761,
                                        "sequence": 1,
                                        "answer": ":smiley:",
                                        "prequel_text": "Pleased to know that.",
                                        "next_question_id": 633
                                    }
                                ]
                            },
                            {
                                "id": 633,                              //Subjective question with only one route
                                "question": "What is that one thing you like the most about working here?",
                                "answers": [
                                    {
                                        "id": null,
                                        "sequence": null,
                                        "answer": null,
                                        "prequel_text": "Noted",
                                        "next_question_id": 636
                                    }
                                ]
                            }
                        ]
                    }
                }   
            }*/

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('success');
            expect(body.error).toBeDefined();
            expect(body.error).toBeFalsy();
            expect(body.message).toBeDefined();
            expect(body.message).toBe('Successful');
            expect(body.data).toBeDefined();

            expect(body.data.survey).toBeDefined();
            expect(body.data.survey.id).toBeDefined();
            expect(body.data.survey.id).toBe(28);
            expect(body.data.survey.survey_type).toBeDefined();
            expect(body.data.survey.survey_type).toBe('Pulse');
            expect(body.data.survey.company).toBeDefined();
            expect(body.data.survey.company).toBe('Xane.AI');
            expect(body.data.survey.first_question_id).toBeDefined();
            expect(body.data.survey.first_question_id).toBeNull();      //Why?
            expect(body.data.survey.questions).toBeDefined();
            expect(body.data.survey.questions.length).not.toBe(0);

            expect(body.data.survey.questions[0].id).toBeDefined();
            expect(body.data.survey.questions[0].id).toBe(632);
            expect(body.data.survey.questions[0].question).toBeDefined();
            expect(body.data.survey.questions[0].question).toBe('How has your journey been with Xane so far?');
            expect(body.data.survey.questions[0].answers).toBeDefined();
            expect(body.data.survey.questions[0].answers.length).not.toBe(0);

            expect(body.data.survey.questions[0].answers[0].id).toBeDefined();
            expect(body.data.survey.questions[0].answers[0].id).toBe(761);
            expect(body.data.survey.questions[0].answers[0].sequence).toBeDefined();
            expect(body.data.survey.questions[0].answers[0].sequence).toBe(1);
            expect(body.data.survey.questions[0].answers[0].answer).toBeDefined();
            expect(body.data.survey.questions[0].answers[0].answer).toBe(':smiley:');
            expect(body.data.survey.questions[0].answers[0].prequel_text).toBeDefined();
            expect(body.data.survey.questions[0].answers[0].prequel_text).toBe('Pleased to know that.');
            expect(body.data.survey.questions[0].answers[0].next_question_id).toBeDefined();
            expect(body.data.survey.questions[0].answers[0].next_question_id).toBe(633);

            expect(body.data.survey.questions[1].id).toBeDefined();
            expect(body.data.survey.questions[1].id).toBe(633);
            expect(body.data.survey.questions[1].question).toBeDefined();
            expect(body.data.survey.questions[1].question).toBe('What is that one thing you like the most about working here?');
            expect(body.data.survey.questions[1].answers).toBeDefined();
            expect(body.data.survey.questions[1].answers.length).toBe(1);

            expect(body.data.survey.questions[1].answers[0].id).toBeDefined();
            expect(body.data.survey.questions[1].answers[0].id).toBeNull();
            expect(body.data.survey.questions[1].answers[0].sequence).toBeDefined();
            expect(body.data.survey.questions[1].answers[0].sequence).toBeNull();
            expect(body.data.survey.questions[1].answers[0].answer).toBeDefined();
            expect(body.data.survey.questions[1].answers[0].answer).toBeNull();
            expect(body.data.survey.questions[1].answers[0].prequel_text).toBeDefined();
            expect(body.data.survey.questions[1].answers[0].prequel_text).toBe('Noted');
            expect(body.data.survey.questions[1].answers[0].next_question_id).toBeDefined();
            expect(body.data.survey.questions[1].answers[0].next_question_id).toBe(636);

            return done();
        });
    });

    test('Survey Id does not exist', (done) => {

        let options = JSON.parse(JSON.stringify(data.customer.options));

        options.url = options.url + '/314159265';

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
});