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

test('Test code auths is working', done => {          //Trial test case                    
    var r = 1;
    expect(r).toEqual(1);
    done();
});

var token;

let login = {};                                               //For login and admin x-auth token generation
login.customer = {};

login.customer.options = {
    url: 'http://localhost:3000/auths/login',            //base_url?
    method: 'POST',
    json: true,
    headers: { 
        'x-origin': 1,
        'x-version': 1,
        'x-auth': null,
    },
    qs: {},                                             //query string
    body: {}                                             //Put credentials here
};

let logout = {};                                               //For user logout using login token
logout.customer = {};

describe('1. POST login', () => {             //API 1

    test('Login successful', (done) => {

        let options = JSON.parse(JSON.stringify(login.customer.options));

        options.body.email = 'DoctorStrange@xanebot.ai';
        options.body.password = 'API';

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
{
    "code": "success",
    "error": false,
    "message": "Successful",
    "data": {
        "user": {
            "id": 1292,
            "name": "Stephen Patel",
            "designation": "Buseness Developement",
            "role": {
                "id": 2,
                "role": "employee"
            }
        },
        "session": {
            "token": "72025ae9dc024b6f9e6c0359273f1c17"
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

            logout.customer.options = {
                url: 'http://localhost:3000/auths/logout',
                method: 'PUT',
                json: true,
                headers: {
                    'x-origin': 1,
                    'x-version': 1,
                    'x-auth': token,
                },
                qs: {},
                body: {}
            };

            return done();
        });
    });

    test('Wrong email', done => {

        let options = JSON.parse(JSON.stringify(login.customer.options));

        options.body.email = 'wrong_id@xane.ai';
        options.body.password = 'API';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authn_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBeTruthy();

            return done();
        });
    });

    test('Wrong password', done => {

        let options = JSON.parse(JSON.stringify(login.customer.options));

        options.body.email = 'DoctorStrange@xanebot.ai';
        options.body.password = 'wrong_password';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authn_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBeTruthy();

            return done();
        });
    });

    test('Wrong password - case sensitive', done => {

        let options = JSON.parse(JSON.stringify(login.customer.options));

        options.body.email = 'DoctorStrange@xanebot.ai';
        options.body.password = 'api';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authn_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBeTruthy();

            return done();
        });
    });

    test('Missing email', done => {

        let options = JSON.parse(JSON.stringify(login.customer.options));

        options.body.email = '';
        options.body.password = 'API';

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

    test('Missing password', done => {

        let options = JSON.parse(JSON.stringify(login.customer.options));

        options.body.email = 'DoctorStrange@xanebot.ai';
        options.body.password = '';

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

    test('Mismatched email - password', done => {

        let options = JSON.parse(JSON.stringify(login.customer.options));

        options.body.email = 'admin@xane.ai';
        options.body.password = 'API';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authn_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBeTruthy();

            return done();
        });
    });
});

                                          
describe('2. PUT logout', () => {             //API 2

    test('Wrong x-auth token', done => {

        let options = JSON.parse(JSON.stringify(logout.customer.options));

        options.headers['x-auth'] = 'faulty_token332234';

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authn_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBeTruthy();

            return done();
        });
    });

    test('Logout successful', (done) => {

        let options = JSON.parse(JSON.stringify(logout.customer.options));

        request(options, (err, response, body) => {
            // The expected object is something like
            /*
{
    "code": "success",
    "error": false,
    "message": "Successful",
    "data": {
        "session": {
            "id": 1215
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
            expect(body.data.session).toBeDefined();
            expect(body.data.session.id).toBeDefined();
            expect(body.data.session.id).toBeTruthy();

            return done();
        });
    });

    test('Logged out already', (done) => {

        let options = JSON.parse(JSON.stringify(logout.customer.options));

        request(options, (err, response, body) => {

            expect(err).toBeNull();
            expect(body).toBeDefined();
            expect(body.code).toBeDefined();
            expect(body.code).toBe('authn_fail');
            expect(body.error).toBeDefined();
            expect(body.error).toBeTruthy();
            expect(body.message).toBeDefined();
            expect(body.message).toBeTruthy();

            return done();
        });
    });

});   

let signup = {                                            //For signup API
    url: 'http://localhost:3000/auths/signup?',           
    method: 'GET',
    json: true,
    headers: {
        'x-origin': 1,
        'x-version': 1,
    },
    qs: {},                                             
    body: {}                                             
};

describe('3. GET signup', () => {                   //API 3

    describe('-1 Check Email', () => {                  

        test('User has already verified its token', (done) => {

            let checkMail = JSON.parse(JSON.stringify(signup));

            checkMail.url = checkMail.url + 'type=email&action=check&email=test@bucket31.com';

            request(checkMail, (err, response, body) => {
                // The expected object is something like
                /*{
                      "code": "enter_password",
                      "error": false,
                      "message": "User can enter password",
                      "data": {
                           "user": {
                              "email": "api_testing@xanebot.ai",
                              "user_id": 1021
                            }
                      }
                  }*/

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body.code).toBeDefined();
                expect(body.code).toBe('enter_password');
                expect(body.error).toBeDefined();
                expect(body.error).toBeFalsy();
                expect(body.message).toBeDefined();
                expect(body.message).toBe('User can enter password');

                expect(body.data).toBeDefined();
                expect(body.data.user).toBeDefined();
                expect(body.data.user.email).toBeDefined();
                expect(body.data.user.email).toBe('test@bucket31.com');
                expect(body.data.user.user_id).toBeDefined();
                expect(body.data.user.user_id).toBe(1023);

                return done();

            });
        });      

        test('User has not verified its token yet', (done) => {             //User can have an existing token which may get extension to expiry

            let checkMail = JSON.parse(JSON.stringify(signup));

            checkMail.url = checkMail.url + 'type=email&action=check&email=CharlotteTaylor@xanebot.ai';

            request(checkMail, (err, response, body) => {
                // The expected object is something like
                /*{
                    "code": "email_sent",
                    "error": false,
                    "message": "Email has been sent to users mail",
                    "data": {
                       "user": {
                            "email": "CharlotteTaylor@xanebot.ai",
                            "user_id": 1200
                        }
                    }
                }*/

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body.code).toBeDefined();
                expect(body.code).toBe('email_sent');
                expect(body.error).toBeDefined();
                expect(body.error).toBeFalsy();
                expect(body.message).toBeDefined();
                expect(body.message).toBe('Email has been sent to users mail');

                expect(body.data).toBeDefined();
                expect(body.data.user).toBeDefined();
                expect(body.data.user.email).toBeDefined();
                expect(body.data.user.email).toBe('CharlotteTaylor@xanebot.ai');
                expect(body.data.user.user_id).toBeDefined();
                expect(body.data.user.user_id).toBe(1200);

                return done();

            });
        });

        test('Email is wrong', (done) => {

            let checkMail = JSON.parse(JSON.stringify(signup));

            checkMail.url = checkMail.url + 'type=email&action=check&email=email@wrong.com';

            request(checkMail, (err, response, body) => {

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body.code).toBeDefined();
                expect(body.code).toBe('email_is_not_valid');
                expect(body.error).toBeDefined();
                expect(body.error).toBeTruthy();
                expect(body.message).toBeDefined();
                expect(body.message).toBe('Email is not valid');

                return done();

            });
        }); 

        test('Email is missing', (done) => {

            let checkMail = JSON.parse(JSON.stringify(signup));

            checkMail.url = checkMail.url + 'type=email&action=check&email=';

            request(checkMail, (err, response, body) => {

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
    });                //API action 1

    describe('-2 Verify Token', () => {                   //API action 2  (Returns HTML response)

        test('Token verified - signup', (done) => {                

            let verifyToken = JSON.parse(JSON.stringify(signup));

            verifyToken.url = verifyToken.url + 'type=token&action=verify&token=8ecab853d71b4f579dee2545cecd84f82c23940f5e8543f4b4e9e24a2c001cac';   

            request(verifyToken, (err, response, body) => {

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body).toContain('Set Password');     //Note: Token expiry set for year 3018

                return done();

            });
        });

        test('Token verified - forgot password', (done) => {              

            let verifyToken = JSON.parse(JSON.stringify(signup));

            verifyToken.url = verifyToken.url + 'type=token&action=verify&token=f9fd5e6c1d734cb080bd7df6a966f3bbb0b62a5a427f4b2e9d20870159914cb9';

            request(verifyToken, (err, response, body) => {

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body).toContain('Set Password');     //Note: Token expiry set for year 3018

                return done();

            });
        });

        test('Token already used', (done) => {

            let verifyToken = JSON.parse(JSON.stringify(signup));

            verifyToken.url = verifyToken.url + 'type=token&action=verify&token=8ecab853d71b4f579dee2545cecd84f82c23940f5e8543f4b4e9e24a2c001cac';

            request(verifyToken, (err, response, body) => {

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body).toContain('Token has been used already!');

                return done();

            });
        });

        test('Invalid token', (done) => {

            let verifyToken = JSON.parse(JSON.stringify(signup));

            verifyToken.url = verifyToken.url + 'type=token&action=verify&token=i0n1v2a3l4i5d6t7o8k9e0n';

            request(verifyToken, (err, response, body) => {

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body).toContain('Invalid Token!');

                return done();

            });
        });

        test('Missing token', (done) => {

            let verifyToken = JSON.parse(JSON.stringify(signup));

            verifyToken.url = verifyToken.url + 'type=token&action=verify&token=';

            request(verifyToken, (err, response, body) => {

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body).toContain('Invalid Token!');

                return done();

            });
        });
    });               //API action 2 (Returns HTML response)

    describe('-3 Change Password', () => {     

        test('Password cannot be set to blank', (done) => {           

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change&email=DoctorStrange@xanebot.ai&password=';

            request(changePassword, (err, response, body) => {

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

        test('Password changed', (done) => {

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change&email=DoctorStrange@xanebot.ai&password=API';

            request(changePassword, (err, response, body) => {
                // The expected object is something like
                /*{
                    "code": "success",
                    "error": false,
                    "message": "Successful",
                    "data": {
                       "email": "DoctorStrange@xanebot.ai",
                       "password": "API"
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
                expect(body.data.email).toBeDefined();
                expect(body.data.email).toBe('DoctorStrange@xanebot.ai');
                expect(body.data.password).toBeDefined();
                expect(body.data.password).toBe('API');

                return done();

            });
        });

        test('Password field missing', (done) => {         

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change&email=DoctorStrange@xanebot.ai';

            request(changePassword, (err, response, body) => {

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

        test('Email field missing', (done) => {           //Timeout!

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change&password=API';

            request(changePassword, (err, response, body) => {

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
        });     //Async Timeout!!

        test('Email and password fields missing', (done) => {       

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change';

            request(changePassword, (err, response, body) => {

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

        test('Wrong email', (done) => {     //Timeout!

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change&email=StephenStrange@xanebot.ai&password=API';

            request(changePassword, (err, response, body) => {

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body.code).toBeDefined();
                expect(body.code).toBe('email_is_not_valid');
                expect(body.error).toBeDefined();
                expect(body.error).toBeTruthy();
                expect(body.message).toBeDefined();
                expect(body.message).toBe('Email is not valid');

                return done();

            });
        });             //Async Timeout!!
    });               //API action 3

    describe('-4 Set Password', () => {

        test('Password cannot be set to blank', (done) => {            //API flaw, will be changed...

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=set&email=jasonAnderson@xanebot.ai&password=';

            request(changePassword, (err, response, body) => {

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

        test('Password set', (done) => {

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change&email=jasonAnderson@xanebot.ai&password=API_testing';

            request(changePassword, (err, response, body) => {
                // The expected object is something like
                /*{
                    "code": "success",
                    "error": false,
                    "message": "Successful",
                    "data": {
                       "email": "jasonAnderson@xanebot.ai",
                       "password": "API_testing"
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
                expect(body.data.email).toBeDefined();
                expect(body.data.email).toBe('jasonAnderson@xanebot.ai');
                expect(body.data.password).toBeDefined();
                expect(body.data.password).toBe('API_testing');

                return done();

            });
        });

        test('Password field missing', (done) => {

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change&email=DoctorStrange@xanebot.ai';

            request(changePassword, (err, response, body) => {

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

        test('Email field missing', (done) => {           //Timeout!

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change&password=API';

            request(changePassword, (err, response, body) => {

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
        });      //Async Timeout!!

        test('Email and password fields missing', (done) => {

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change';

            request(changePassword, (err, response, body) => {

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

        test('Wrong email', (done) => {     //Timeout! (Even if limit x6)

            let changePassword = JSON.parse(JSON.stringify(signup));

            changePassword.url = changePassword.url + 'type=password&action=change&email=MisterStrange@xanebot.ai&password=API';

            request(changePassword, (err, response, body) => {

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body.code).toBeDefined();
                expect(body.code).toBe('email_is_not_valid');
                expect(body.error).toBeDefined();
                expect(body.error).toBeTruthy();
                expect(body.message).toBeDefined();
                expect(body.message).toBe('Email is not valid');

                return done();

            });
        });              //Async Timeout!!
    });               //API action 4 (HTML response)

    describe('-5 Forgot Password', () => {

        test('Email is valid', (done) => {

            let forgotPassword = JSON.parse(JSON.stringify(signup));

            forgotPassword.url = forgotPassword.url + 'type=password&action=forget&email=DoctorStrange@xanebot.ai';

            request(forgotPassword, (err, response, body) => {
                // The expected object is something like
                /*{
                     "code": "email_sent",
                     "error": false,
                     "message": "Email has been sent to users mail",
                     "data": {
                        "user": {
                            "email": "StephenPatel@xanebot.ai",
                            "user_id": 1292
                         }
                     }
                }*/

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body.code).toBeDefined();
                expect(body.code).toBe('email_sent');
                expect(body.error).toBeDefined();
                expect(body.error).toBeFalsy();
                expect(body.message).toBeDefined();
                expect(body.message).toBe('Email has been sent to users mail');

                expect(body.data).toBeDefined();
                expect(body.data.user).toBeDefined();
                expect(body.data.user.email).toBeDefined();
                expect(body.data.user.email).toBe('DoctorStrange@xanebot.ai');
                expect(body.data.user.user_id).toBeDefined();
                expect(body.data.user.user_id).toBe(1292);

                return done();

            });
        });

        test('Email is invalid', (done) => {

            let forgotPassword = JSON.parse(JSON.stringify(signup));

            forgotPassword.url = forgotPassword.url + 'type=password&action=forget&email=StephenStrange@xanebot.ai';

            request(forgotPassword, (err, response, body) => {

                expect(err).toBeNull();
                expect(body).toBeDefined();
                expect(body.code).toBeDefined();
                expect(body.code).toBe('email_is_not_valid');
                expect(body.error).toBeDefined();
                expect(body.error).toBeTruthy();
                expect(body.message).toBeDefined();
                expect(body.message).toBe('Email is not valid');

                return done();
            });
        });

        test('Email is missing', (done) => {

            let forgotPassword = JSON.parse(JSON.stringify(signup));

            forgotPassword.url = forgotPassword.url + 'type=password&action=forget&email=';

            request(forgotPassword, (err, response, body) => {

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

        test('Email parameter is missing', (done) => {

            let forgotPassword = JSON.parse(JSON.stringify(signup));

            forgotPassword.url = forgotPassword.url + 'type=password&action=forget';

            request(forgotPassword, (err, response, body) => {

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
    });                //API action 5
});