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
ADD CONSTRAINT FK_question_category_id FOREIGN KEY (category_id) REFERENCES categories(id);
