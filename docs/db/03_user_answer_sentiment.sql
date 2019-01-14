ALTER TABLE user_answers 
ADD COLUMN sentiment FLOAT NULL AFTER answer;

ALTER TABLE user_answers
DROP COLUMN sentiment_id;


ALTER TABLE user_answers 
ADD COLUMN sentiment_id INT AFTER sentiment;

ALTER TABLE user_answers
ADD CONSTRAINT user_answer_sentiment_id FOREIGN KEY (sentiment_id) REFERENCES sentiments(id);
