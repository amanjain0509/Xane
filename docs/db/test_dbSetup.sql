# 01_DB_UNICODE_COLLATION

SET NAMES utf8mb4;
ALTER DATABASE xane_test CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

ALTER TABLE question_answers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE question_routings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_answers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE question_answers CHANGE answer answer VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE question_routings CHANGE prequel_text prequel_text VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE user_answers CHANGE answer answer VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

# 02_missing_routings

DROP VIEW IF EXISTS missing_routings;
CREATE VIEW missing_routings
AS

SELECT DISTINCT q.survey_id, q.id AS question_id, at.answer_type, qa.answer, qa.sequence
FROM question_answers qa
LEFT JOIN question_routings qr ON qr.question_id = qa.question_id AND qr.answer_sequence = qa.sequence
LEFT JOIN questions q ON q.id = qa.question_id
INNER JOIN answer_types at ON at.id = q.answer_type_id
WHERE at.id = 1 AND qr.id IS NULL

UNION

SELECT DISTINCT q.survey_id, q.id as question_id, at.answer_type, null as answer, null as sequence
FROM questions q
INNER JOIN answer_types at ON at.id = q.answer_type_id
LEFT JOIN question_routings qr ON qr.question_id = q.id
WHERE at.id = 2 AND qr.id IS NULL;

# 03_user_answer_sentiment

ALTER TABLE user_answers
ADD COLUMN sentiment FLOAT NULL AFTER answer;

ALTER TABLE user_answers
DROP COLUMN sentiment_id;


ALTER TABLE user_answers
ADD COLUMN sentiment_id INT AFTER sentiment;

ALTER TABLE user_answers
ADD CONSTRAINT user_answer_sentiment_id FOREIGN KEY(sentiment_id) REFERENCES sentiments(id);

# 04_city_and_employeeId

DROP TABLE IF EXISTS`city`;
CREATE TABLE`city`(`id` int(11) NOT NULL AUTO_INCREMENT, city VARCHAR(40) Not Null, PRIMARY KEY(`id`));

ALTER TABLE users
ADD COLUMN city_id INT after email;

ALTER TABLE users
ADD CONSTRAINT user_city_id FOREIGN KEY(city_id) REFERENCES city(id);

ALTER TABLE users
ADD COLUMN employee_id INT after designation_id;

ALTER TABLE users
ADD COLUMN alternate_email varchar(80) AFTER email;

# 05_question_categories

CREATE TABLE categories
    (
    id INT NOT NULL AUTO_INCREMENT,
    category VARCHAR(63) NOT NULL,
    PRIMARY KEY(id)
    );

select * from questions;
#ALTER TABLE questions
#ADD COLUMN category_id INT NULL AFTER survey_id;
ALTER TABLE questions
ADD CONSTRAINT FK_question_category_id FOREIGN KEY(category_id) REFERENCES categories(id);

# 06_users_tokens

DROP TABLE IF EXISTS users_tokens;

CREATE TABLE users_tokens(
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(256) NOT NULL,
    expiry DATETIME NOT NULL,
    active BOOL DEFAULT TRUE,
    context varchar(20) not null,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    updated_at DATETIME NULL DEFAULT NULL,
    deleted_at DATETIME NULL DEFAULT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

# 07_survey_cycles

drop table if exists survey_cycles;
create table survey_cycles(
    id int not null AUTO_INCREMENT,
    cycle_number int not null,
    survey_id int,
    start datetime not null default '1970-01-01 00:00:00',
    end datetime not null default '2099-12-31 23:59:59',
    active boolean not null default true,
    created_at datetime not null default now(),
    updated_at datetime null default null,
    delete_at datetime null default null,
    primary key(id),
    foreign key(survey_id) references surveys(id)
);
alter table user_answers add column survey_cycles_id int not null after sentiment_id;

# 08_is_followup

alter table question_routings
add column is_followup boolean default false after next_question_id;