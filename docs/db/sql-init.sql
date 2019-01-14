# Database
DROP DATABASE IF EXISTS xane;
CREATE DATABASE xane;
USE xane;

# Tables
DROP TABLE IF EXISTS
companies,
designations,
roles,
users,
origins,
sessions,
survey_types,
surveys,
answer_types,
questions,
sentiments,
question_answers,
user_answers,
question_routings,
units,
targets,
company_targets,
user_hierarchy;

CREATE TABLE companies(
  id INT NOT NULL AUTO_INCREMENT,
  company VARCHAR(32) NOT NULL,
  domain VARCHAR(32) NULL DEFAULT NULL,
  active BOOL NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE designations(
  id INT NOT NULL AUTO_INCREMENT,
  designation VARCHAR(32) NOT NULL,
  active BOOL NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE roles(
  id INT NOT NULL AUTO_INCREMENT,
  role VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE users(
  id INT NOT NULL AUTO_INCREMENT,
  role_id INT NOT NULL,
  company_id INT NOT NULL,
  designation_id INT ,
  first_name VARCHAR(64) NOT NULL,
  last_name VARCHAR(64) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  email VARCHAR(64) NOT NULL,
  password VARCHAR(64) NOT NULL,
  join_date DATETIME NOT NULL DEFAULT NOW(),
  gender ENUM('M', 'F', 'O') NULL DEFAULT NULL,
  active BOOL NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(role_id) REFERENCES roles(id),
  FOREIGN KEY(company_id) REFERENCES companies(id),
  FOREIGN KEY(designation_id) REFERENCES designations(id)
);

CREATE TABLE origins(
  id INT NOT NULL AUTO_INCREMENT,
  origin VARCHAR(32) NOT NULL,
  deprecated_version INT NOT NULL DEFAULT 0,
  current_release INT NOT NULL DEFAULT 999,
  PRIMARY KEY(id)
);

CREATE TABLE sessions(
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(256) NOT NULL,
  origin_id INT NOT NULL,
  version INT NOT NULL,
  expiry DATETIME NOT NULL,
  active BOOL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(origin_id) references origins(id)
);

CREATE TABLE survey_types (
  id INT NOT NULL AUTO_INCREMENT,
  survey_type VARCHAR(32) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE surveys (
  id INT NOT NULL AUTO_INCREMENT,
  survey_type_id INT NOT NULL,
  company_id INT NOT NULL,
  first_question_id INT NULL,
  start DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00',
  end DATETIME NOT NULL DEFAULT '2099-12-31 23:59:59',
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(survey_type_id) REFERENCES survey_types(id),
  FOREIGN KEY(company_id) REFERENCES companies(id)
);

CREATE TABLE answer_types (
  id INT NOT NULL AUTO_INCREMENT,
  answer_type VARCHAR(32) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE questions (
  id INT NOT NULL AUTO_INCREMENT,
  survey_id INT NOT NULL,
  question VARCHAR(255) NOT NULL,
  answer_type_id INT NOT NULL,
  steps INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (survey_id) REFERENCES surveys(id),
  FOREIGN KEY (answer_type_id) REFERENCES answer_types(id)
);

CREATE TABLE sentiments (
  id INT NOT NULL AUTO_INCREMENT,
  sentiment VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE question_answers (
  id INT NOT NULL AUTO_INCREMENT,
  question_id INT NOT NULL,
  answer VARCHAR(255) NULL,
  sequence INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE user_answers (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_sequence INT NULL,
  answer VARCHAR(255) NULL,
  sentiment_id FLOAT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE question_routings (
  id INT NOT NULL AUTO_INCREMENT,
  question_id INT NOT NULL,
  answer_sequence INT NULL DEFAULT NULL, 
  next_question_id INT NULL DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NULL DEFAULT NULL,
  deleted_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (next_question_id) REFERENCES questions(id)
);

# Indexes
CREATE INDEX company_id ON companies(id) USING HASH;

CREATE INDEX designation_id ON designations(id) USING HASH;

CREATE INDEX role_id ON roles(id) USING HASH;

CREATE INDEX user_id ON users(id) USING HASH;
CREATE INDEX user_role_id ON users(role_id) USING HASH;
CREATE INDEX user_company_id ON users(company_id) USING HASH;
CREATE INDEX user_designation_id ON users(designation_id) USING HASH;
CREATE UNIQUE INDEX user_email ON users(email);
CREATE UNIQUE INDEX unique_user ON users(role_id, email) USING HASH;

CREATE INDEX session_id ON sessions(id) USING HASH;
CREATE INDEX session_user_id on sessions(user_id) USING HASH;

CREATE INDEX survey_type_id ON survey_types(id) USING HASH;

CREATE INDEX survey_id ON surveys(id) USING HASH;
CREATE INDEX survey_survey_type_id ON surveys(survey_type_id) USING HASH;
CREATE INDEX survey_company_id ON surveys(company_id) USING HASH;

CREATE INDEX answer_type_id ON answer_types(id) USING HASH;

CREATE INDEX question_id ON questions(id) USING HASH;
CREATE INDEX question_survey_id ON questions(survey_id) USING HASH;
CREATE INDEX question_answer_type_id ON questions(answer_type_id) USING HASH;

CREATE INDEX sentiment_id ON sentiments(id) USING HASH;

CREATE INDEX question_answer_id ON question_answers(id) USING HASH;
CREATE INDEX question_answer_question_id ON question_answers(question_id) USING HASH;

CREATE INDEX user_answer_id ON user_answers(id) USING HASH;
CREATE INDEX user_answer_question_id ON user_answers(question_id) USING HASH;
CREATE INDEX user_answer_sentiment_id ON user_answers(sentiment_id) USING HASH;

CREATE INDEX question_routing_id ON question_routings(id) USING HASH;
CREATE INDEX question_routing_question_id ON question_routings(question_id) USING HASH;
CREATE INDEX question_routing_next_question_id ON question_routings(next_question_id) USING HASH;

# Data
INSERT INTO companies(id, company, domain) VALUES(1, 'Xane.AI', 'xane.ai');
INSERT INTO companies(id, company, domain) VALUES(2, 'Baxi', 'baxi.taxi');

INSERT INTO designations(id, designation) VALUES(1, 'Admin');
INSERT INTO designations(id, designation) VALUES(2, 'Software Engineer');

INSERT INTO roles(id, role) VALUES(1, 'superadmin');
INSERT INTO roles(id, role) VALUES(2, 'employee');

INSERT INTO users(id, role_id, company_id, designation_id, first_name, last_name, phone, email, password) VALUES(1, 1, 1, 1, 'XaneAI', 'Admin', '9999999999', 'admin@xane.ai', md5('password'));
INSERT INTO users(id, role_id, company_id, designation_id, first_name, last_name, phone, email, password) VALUES(2, 1, 2, 1, 'Manu', 'Rana', '8888888888', 'manu.rana@baxi.taxi', md5('password'));
INSERT INTO users(id, role_id, company_id, designation_id, first_name, last_name, phone, email, password) VALUES(3, 2, 2, 2, 'Sahil', 'Narain', '7777777777', 'sahil.narain@baxi.taxi', md5('password'));

INSERT INTO origins (id, origin, deprecated_version, current_release) VALUES (1, 'android', 0, 1);
INSERT INTO origins (id, origin, deprecated_version, current_release) VALUES (2, 'ios', 0, 1);
INSERT INTO origins (id, origin, deprecated_version, current_release) VALUES (3, 'Web', 0, 1);
INSERT INTO origins (id, origin, deprecated_version, current_release) VALUES (4, 'Admin', 0, 1);

INSERT INTO sessions(id, user_id, token, origin_id, version, expiry) VALUES(1, 1, 'forestadmin', 1, 1, '2099-12-31 23:59:59');

INSERT INTO survey_types (id, survey_type) VALUES (1, 'Pulse');
INSERT INTO survey_types (id, survey_type) VALUES (2, '360');
INSERT INTO survey_types (id, survey_type) VALUES (3, 'Peer');

INSERT INTO answer_types(id, answer_type) VALUES (1, 'Objective');
INSERT INTO answer_types(id, answer_type) VALUES (2, 'Subjective');

INSERT INTO sentiments (id, sentiment) VALUES (1, 'Negative');
INSERT INTO sentiments (id, sentiment) VALUES (2, 'Neutral');
INSERT INTO sentiments (id, sentiment) VALUES (3, 'Positive'); 


# Views

CREATE VIEW survey_questions AS (
  select
    s.id,
    st.survey_type,
    c.company,
    q1.id as question_id,
    q1.question,
    q1.steps,
    case when qr.answer_sequence is not null then qr.answer_sequence else 0 end as answer_sequence,
    case when qa.id is not null then qa.id else 0 end as answer_id,
    case when qa.answer is not null then qa.answer else 0 end as answer,
    q2.id as next_question_id,
    q2.question as next_question
  from
    question_routings qr
    inner join questions q1 on q1.id = qr.question_id
    inner join surveys s on s.id = q1.survey_id
    inner join survey_types st on st.id = s.survey_type_id
    inner join companies c on c.id = s.company_id
    left join questions q2 on q2.id = qr.next_question_id
    left join question_answers qa on qa.question_id = qr.question_id
    and qa.sequence = qr.answer_sequence
  order by
    s.id,
    q1.id,
    qr.answer_sequence
);




# Categorisation edits

CREATE TABLE units
(
id INT NOT NULL AUTO_INCREMENT,
unit VARCHAR(32) NOT NULL,
PRIMARY KEY(id)
);

CREATE UNIQUE INDEX unit_id ON units(id) USING HASH;

INSERT INTO units (id, unit)
VALUES (1, 'days');

###

CREATE TABLE targets
(
id INT NOT NULL AUTO_INCREMENT,
code VARCHAR(32) NOT NULL,
unit_id INT NOT NULL,
description VARCHAR(256) NOT NULL,
active BOOL NOT NULL DEFAULT TRUE,
created_at DATETIME NOT NULL DEFAULT NOW(),
updated_at DATETIME NULL,
deleted_at DATETIME NULL,
PRIMARY KEY(id)
);


CREATE UNIQUE INDEX target_id on targets(id) USING HASH;

INSERT INTO targets (id, code, description)
VALUES (1, 'EMP_AGE', 'Employee age in company');
INSERT INTO targets (id, code, description)
VALUES (2, 'GENDER', 'Employee gender');
INSERT INTO targets (id, code, description)
VALUES (3, 'DES', 'Employee designation');
INSERT INTO targets (id, code, description)
VALUES (4, 'DEP', 'Employee department');

###


CREATE TABLE company_targets (
id INT NOT NULL AUTO_INCREMENT,
company_id INT NOT NULL,
target_id INT NOT NULL,
unit_id INT NOT NULL,
start VARCHAR(256) NULL,
end VARCHAR(256) NULL,
active BOOL NOT NULL DEFAULT TRUE,
created_at DATETIME NOT NULL DEFAULT NOW(),
updated_at DATETIME NULL,
deleted_at DATETIME NULL,
PRIMARY KEY(id),
FOREIGN KEY (company_id) REFERENCES companies(id),
FOREIGN KEY (target_id) REFERENCES targets(id)
);

INSERT INTO company_targets (id, company_id, target_id, unit_id, start, end)
VALUES (1, 2, 1, 1, '0', '15');
INSERT INTO company_targets (id, company_id, target_id, unit_id, start, end)
VALUES (2, 2, 1, 1, '16', '30');
INSERT INTO company_targets (id, company_id, target_id, unit_id, start, end)
VALUES (3, 2, 1, 1, '30', null);

ALTER TABLE surveys
DROP FOREIGN KEY surveys_ibfk_2;
ALTER TABLE surveys
DROP COLUMN company_id;

ALTER TABLE surveys
ADD COLUMN company_target_id INT NOT NULL AFTER survey_type_id;

# Small talk
ALTER TABLE question_routings
ADD COLUMN prequel_text VARCHAR(256) NULL DEFAULT NULL AFTER answer_sequence;

# Privacy
ALTER TABLE user_answers
ADD COLUMN private BOOL NOT NULL DEFAULT FALSE AFTER answer;

# User hierarchy

CREATE TABLE user_hierarchy
(
id INT NOT NULL AUTO_INCREMENT,
user_id INT NOT NULL,
superior_user_id INT ,
active BOOL NOT NULL DEFAULT TRUE,
created_at DATETIME NOT NULL DEFAULT NOW(),
updated_at DATETIME NULL DEFAULT NULL,
deleted_at DATETIME NULL DEFAULT NULL,
PRIMARY KEY (id),
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (superior_user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX user_hierarchy_id ON user_hierarchy(id) USING HASH;
CREATE INDEX user_hierarchy_user_id ON user_hierarchy(user_id) USING HASH;
CREATE INDEX user_hierarchy_superior_user_id ON user_hierarchy(superior_user_id) USING HASH;

ALTER TABLE surveys
ADD FOREIGN KEY(first_question_id) REFERENCES questions(id);

INSERT INTO companies (id, company, domain) VALUES (3, 'JIVA Ayurved', 'jiva.com');

UPDATE company_targets
SET company_id=3 WHERE company_id=2;

INSERT INTO users (role_id, company_id, designation_id, first_name, last_name, phone, email, password, join_date) VALUES ('2', '3', '2', 'Preeti', '', '', 'preeti@jiva.com', '2beb09860a0da62e3332e911c95abc0f', '2017-12-24 18:30:00'
);
INSERT INTO users (role_id, company_id, designation_id, first_name, last_name, phone, email, password, join_date) VALUES ('2', '3', '2', 'Leena', 'Kalra', '', 'leena.kalra@jiva.com', 'dbb0ed295228c24f4f99722ca3feb7ce', '2017-11-27 18:30:00'
);
INSERT INTO users (role_id, company_id, designation_id, first_name, last_name, phone, email, password, join_date) VALUES ('2', '3', '2', 'Omshiv', 'Mishra', '', 'omshiv.mishra@jiva.com', 'a2d0ed43489b8ca671f2f4762b4174cb', '2017-10-27 18:30:00'
);
INSERT INTO users (role_id, company_id, designation_id, first_name, last_name, phone, email, password, join_date) VALUES ('2', '3', '2', 'Bhavani', '', '', 'bhavani@jiva.com', '106523c67a45ec08036388be8af73c03', '2017-09-24 18:30:00'
);
INSERT INTO users (role_id, company_id, designation_id, first_name, last_name, phone, email, password, join_date) VALUES ('2', '3', '2', 'Govind', 'Kohli', '', 'govind.kohli@jiva.com', '8471fb271ebdd75da7c321f238ffc412', '2018-01-28 18:30:00'
);
INSERT INTO users (role_id, company_id, designation_id, first_name, last_name, phone, email, password, join_date) VALUES ('2', '3', '2', 'Meenakshi', '', '', 'meenakshi@jiva.com', '80efc87eb8d2ac4d375c85008a64cea5', '2018-01-12 18:30:00'
);

CREATE TABLE question_categories
(
	id INT NOT NULL AUTO_INCREMENT,
	code VARCHAR(16) NOT NULL,
	description VARCHAR(256) NULL DEFAULT NULL,
	PRIMARY KEY (id)
);

INSERT INTO question_categories (code, description) VALUES ('ViAl','Vision Alignment');
INSERT INTO question_categories (code, description) VALUES ('TnDv','Training & Development');
INSERT INTO question_categories (code, description) VALUES ('PeGr','Personal Growth');
INSERT INTO question_categories (code, description) VALUES ('MnRe','Manager Relations');
INSERT INTO question_categories (code, description) VALUES ('Hapi','Happiness');
INSERT INTO question_categories (code, description) VALUES ('Feed','Feedback');
INSERT INTO question_categories (code, description) VALUES ('Cult','Culture');
INSERT INTO question_categories (code, description) VALUES ('CoRe','Colleague Relations');
INSERT INTO question_categories (code, description) VALUES ('Ambs','Ambassadorship');

ALTER TABLE questions
ADD COLUMN category_id INT NOT NULL DEFAULT 1 AFTER question;

ALTER TABLE questions
ADD FOREIGN KEY (category_id) REFERENCES question_categories(id);
