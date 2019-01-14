select * from survey_types;
select * from surveys;
select * from questions;
select * from question_answers;
select * from question_routings;

INSERT INTO surveys
(survey_type_id, company_id)
values (1,2);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'Did you feel welcomed at your first day at JIVA Ayurveda?', 1, 2);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (1, 'Yes', 1);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (1, 'No', 2);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'What about the interaction with your manager and colleagues, how did it go?', 1, 5);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (2, '1', 1);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (2, '2', 2);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (2, '3', 3);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (2, '4', 4);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (2, '5', 5);


INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'Do you think that goals and objectives of the company were laid out clearly?', 1, 2);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (3, 'Yes', 1);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (3, 'No', 2);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'What about the resources and facilities at JIVA, do you think they are sufficient to do your job best?', 1, 2);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (4, 'Yes', 1);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (4, 'No', 2);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'How proud do you feel about working at JIVA?', 1, 5);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (5, '1', 1);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (5, '2', 2);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (5, '3', 3);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (5, '4', 4);
INSERT INTO question_answers
(question_id, answer, sequence)
VALUES (5, '5', 5);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, ':( Really! What do you think went missing?', 2, 0);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'Oh, okay! Why do you think it wasn\'t good?', 2, 0);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'Alright! What do you think could have been better?', 2, 0);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'What is that one thing you like the most about the vision of the company?', 2, 0);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'Oh, okay! Tell me what do you think is unclear? Work is more fun if the purpose is clear.', 2, 0);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'What do you think is missing at the workplace?', 2, 0);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'Alright. What do you think are the reasons for your answer above?', 2, 0);

INSERT INTO questions
(survey_id, question, answer_type_id, steps)
VALUES (1, 'Nice! What is that one thing you are most proud of working here?', 2, 0);

INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(1,1,2);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(1,2,6);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(2,1,7);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(2,2,7);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(2,3,8);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(2,4,3);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(2,5,3);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(3,1,9);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(3,2,10);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(4,1,5);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(4,2,11);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(5,1,12);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(5,2,12);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(5,3,12);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(5,4,13);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(5,5,13);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(6,null,2);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(7,null,3);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(8,null,3);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(9,null,4);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(10,null,4);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(11,null,5);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(12,null,null);
INSERT INTO question_routings (question_id, answer_sequence, next_question_id) VALUES(13,null,null);