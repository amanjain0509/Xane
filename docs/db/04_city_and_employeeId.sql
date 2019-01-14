DROP TABLE IF EXISTS `city`;
CREATE TABLE `city` (`id` int(11) NOT NULL AUTO_INCREMENT,city VARCHAR(40) Not Null,PRIMARY KEY (`id`));

ALTER TABLE users
ADD COLUMN city_id INT after email;

ALTER TABLE users
ADD CONSTRAINT user_city_id FOREIGN KEY (city_id) REFERENCES city(id);

ALTER TABLE users
ADD COLUMN employee_id INT after designation_id;

ALTER TABLE users
ADD COLUMN alternate_email varchar(80) AFTER email;