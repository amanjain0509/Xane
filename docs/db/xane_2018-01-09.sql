# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: mysql.r2d.unoride.in (MySQL 5.6.34-log)
# Database: xane
# Generation Time: 2018-01-09 09:36:13 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table answer_types
# ------------------------------------------------------------

DROP TABLE IF EXISTS `answer_types`;

CREATE TABLE `answer_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `answer_type` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `answer_type_id` (`id`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `answer_types` WRITE;
/*!40000 ALTER TABLE `answer_types` DISABLE KEYS */;

INSERT INTO `answer_types` (`id`, `answer_type`)
VALUES
	(1,'Objective'),
	(2,'Subjective');

/*!40000 ALTER TABLE `answer_types` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table companies
# ------------------------------------------------------------

DROP TABLE IF EXISTS `companies`;

CREATE TABLE `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company` varchar(32) NOT NULL,
  `domain` varchar(32) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`id`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;

INSERT INTO `companies` (`id`, `company`, `domain`, `active`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,'Xane.AI','xane.ai',1,'2017-12-22 07:48:41',NULL,NULL),
	(2,'Baxi','baxi.taxi',1,'2017-12-22 07:48:41',NULL,NULL);

/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table designations
# ------------------------------------------------------------

DROP TABLE IF EXISTS `designations`;

CREATE TABLE `designations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `designation` varchar(32) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `designation_id` (`id`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `designations` WRITE;
/*!40000 ALTER TABLE `designations` DISABLE KEYS */;

INSERT INTO `designations` (`id`, `designation`, `active`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,'Admin',1,'2017-12-22 07:48:41',NULL,NULL),
	(2,'Software Engineer',1,'2017-12-22 07:48:41',NULL,NULL);

/*!40000 ALTER TABLE `designations` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table origins
# ------------------------------------------------------------

DROP TABLE IF EXISTS `origins`;

CREATE TABLE `origins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `origin` varchar(32) NOT NULL,
  `deprecated_version` int(11) NOT NULL DEFAULT '0',
  `current_release` int(11) NOT NULL DEFAULT '999',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `origins` WRITE;
/*!40000 ALTER TABLE `origins` DISABLE KEYS */;

INSERT INTO `origins` (`id`, `origin`, `deprecated_version`, `current_release`)
VALUES
	(1,'Web-Admin',0,1),
	(2,'android',0,1),
	(3,'ios',0,1);

/*!40000 ALTER TABLE `origins` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table question_answers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `question_answers`;

CREATE TABLE `question_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `answer` varchar(255) DEFAULT NULL,
  `sequence` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `question_answer_id` (`id`) USING HASH,
  KEY `question_answer_question_id` (`question_id`) USING HASH,
  CONSTRAINT `question_answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `question_answers` WRITE;
/*!40000 ALTER TABLE `question_answers` DISABLE KEYS */;

INSERT INTO `question_answers` (`id`, `question_id`, `answer`, `sequence`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,1,'Yes',1,'2017-12-22 07:48:48',NULL,NULL),
	(2,1,'No',2,'2017-12-22 07:48:48',NULL,NULL),
	(3,2,'1',1,'2017-12-22 07:48:48',NULL,NULL),
	(4,2,'2',2,'2017-12-22 07:48:48',NULL,NULL),
	(5,2,'3',3,'2017-12-22 07:48:48',NULL,NULL),
	(6,2,'4',4,'2017-12-22 07:48:48',NULL,NULL),
	(7,2,'5',5,'2017-12-22 07:48:48',NULL,NULL),
	(8,3,'Yes',1,'2017-12-22 07:48:48',NULL,NULL),
	(9,3,'No',2,'2017-12-22 07:48:48',NULL,NULL),
	(10,4,'Yes',1,'2017-12-22 07:48:49',NULL,NULL),
	(11,4,'No',2,'2017-12-22 07:48:49',NULL,NULL),
	(12,5,'1',1,'2017-12-22 07:48:49',NULL,NULL),
	(13,5,'2',2,'2017-12-22 07:48:49',NULL,NULL),
	(14,5,'3',3,'2017-12-22 07:48:49',NULL,NULL),
	(15,5,'4',4,'2017-12-22 07:48:49',NULL,NULL),
	(16,5,'5',5,'2017-12-22 07:48:49',NULL,NULL);

/*!40000 ALTER TABLE `question_answers` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table question_routings
# ------------------------------------------------------------

DROP TABLE IF EXISTS `question_routings`;

CREATE TABLE `question_routings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `answer_sequence` int(11) DEFAULT NULL,
  `next_question_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `question_routing_id` (`id`) USING HASH,
  KEY `question_routing_question_id` (`question_id`) USING HASH,
  KEY `question_routing_next_question_id` (`next_question_id`) USING HASH,
  CONSTRAINT `question_routings_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`),
  CONSTRAINT `question_routings_ibfk_2` FOREIGN KEY (`next_question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `question_routings` WRITE;
/*!40000 ALTER TABLE `question_routings` DISABLE KEYS */;

INSERT INTO `question_routings` (`id`, `question_id`, `answer_sequence`, `next_question_id`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,1,1,2,'2017-12-22 07:48:50',NULL,NULL),
	(2,1,2,6,'2017-12-22 07:48:50',NULL,NULL),
	(3,2,1,7,'2017-12-22 07:48:50',NULL,NULL),
	(4,2,2,7,'2017-12-22 07:48:50',NULL,NULL),
	(5,2,3,8,'2017-12-22 07:48:50',NULL,NULL),
	(6,2,4,3,'2017-12-22 07:48:50',NULL,NULL),
	(7,2,5,3,'2017-12-22 07:48:50',NULL,NULL),
	(8,3,1,9,'2017-12-22 07:48:50',NULL,NULL),
	(9,3,2,10,'2017-12-22 07:48:51',NULL,NULL),
	(10,4,1,5,'2017-12-22 07:48:51',NULL,NULL),
	(11,4,2,11,'2017-12-22 07:48:51',NULL,NULL),
	(12,5,1,12,'2017-12-22 07:48:51',NULL,NULL),
	(13,5,2,12,'2017-12-22 07:48:51',NULL,NULL),
	(14,5,3,12,'2017-12-22 07:48:51',NULL,NULL),
	(15,5,4,13,'2017-12-22 07:48:51',NULL,NULL),
	(16,5,5,13,'2017-12-22 07:48:51',NULL,NULL),
	(17,6,NULL,2,'2017-12-22 07:48:51',NULL,NULL),
	(18,7,NULL,3,'2017-12-22 07:48:51',NULL,NULL),
	(19,8,NULL,3,'2017-12-22 07:48:51',NULL,NULL),
	(20,9,NULL,4,'2017-12-22 07:48:51',NULL,NULL),
	(21,10,NULL,4,'2017-12-22 07:48:52',NULL,NULL),
	(22,11,NULL,5,'2017-12-22 07:48:52',NULL,NULL),
	(23,12,NULL,NULL,'2017-12-22 07:48:52',NULL,NULL),
	(24,13,NULL,NULL,'2017-12-22 07:48:52',NULL,NULL);

/*!40000 ALTER TABLE `question_routings` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table questions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `questions`;

CREATE TABLE `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer_type_id` int(11) NOT NULL,
  `steps` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `question_id` (`id`) USING HASH,
  KEY `question_survey_id` (`survey_id`) USING HASH,
  KEY `question_answer_type_id` (`answer_type_id`) USING HASH,
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`),
  CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`answer_type_id`) REFERENCES `answer_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;

INSERT INTO `questions` (`id`, `survey_id`, `question`, `answer_type_id`, `steps`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,1,'Did you feel welcomed at your first day at JIVA Ayurveda?',1,2,'2017-12-22 07:48:48',NULL,NULL),
	(2,1,'What about the interaction with your manager and colleagues, how did it go?',1,5,'2017-12-22 07:48:48',NULL,NULL),
	(3,1,'Do you think that goals and objectives of the company were laid out clearly?',1,2,'2017-12-22 07:48:48',NULL,NULL),
	(4,1,'What about the resources and facilities at JIVA, do you think they are sufficient to do your job best?',1,2,'2017-12-22 07:48:49',NULL,NULL),
	(5,1,'How proud do you feel about working at JIVA?',1,5,'2017-12-22 07:48:49',NULL,NULL),
	(6,1,':( Really! What do you think went missing?',2,0,'2017-12-22 07:48:49',NULL,NULL),
	(7,1,'Oh, okay! Why do you think it wasn\'t good?',2,0,'2017-12-22 07:48:49',NULL,NULL),
	(8,1,'Alright! What do you think could have been better?',2,0,'2017-12-22 07:48:49',NULL,NULL),
	(9,1,'What is that one thing you like the most about the vision of the company?',2,0,'2017-12-22 07:48:50',NULL,NULL),
	(10,1,'Oh, okay! Tell me what do you think is unclear? Work is more fun if the purpose is clear.',2,0,'2017-12-22 07:48:50',NULL,NULL),
	(11,1,'What do you think is missing at the workplace?',2,0,'2017-12-22 07:48:50',NULL,NULL),
	(12,1,'Alright. What do you think are the reasons for your answer above?',2,0,'2017-12-22 07:48:50',NULL,NULL),
	(13,1,'Nice! What is that one thing you are most proud of working here?',2,0,'2017-12-22 07:48:50',NULL,NULL);

/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table roles
# ------------------------------------------------------------

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(32) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `role_id` (`id`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;

INSERT INTO `roles` (`id`, `role`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,'superadmin','2017-12-22 07:48:41',NULL,NULL),
	(2,'employee','2017-12-22 07:48:41',NULL,NULL);

/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sentiments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sentiments`;

CREATE TABLE `sentiments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sentiment` varchar(32) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sentiment_id` (`id`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `sentiments` WRITE;
/*!40000 ALTER TABLE `sentiments` DISABLE KEYS */;

INSERT INTO `sentiments` (`id`, `sentiment`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,'Negative','2017-12-22 07:48:42',NULL,NULL),
	(2,'Neutral','2017-12-22 07:48:42',NULL,NULL),
	(3,'Positive','2017-12-22 07:48:42',NULL,NULL);

/*!40000 ALTER TABLE `sentiments` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sessions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(256) NOT NULL,
  `origin_id` int(11) NOT NULL,
  `version` int(11) NOT NULL,
  `expiry` datetime NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `origin_id` (`origin_id`),
  KEY `session_id` (`id`) USING HASH,
  KEY `session_user_id` (`user_id`) USING HASH,
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`origin_id`) REFERENCES `origins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;

INSERT INTO `sessions` (`id`, `user_id`, `token`, `origin_id`, `version`, `expiry`, `active`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,1,'forestadmin',1,1,'2099-12-31 23:59:59',1,'2017-12-22 07:48:42','2018-01-08 08:19:30',NULL),
	(2,3,'0cf1c242fa164c71858775017a1da14e',1,1,'2018-06-21 18:51:41',1,'2017-12-23 18:51:27','2018-01-08 08:19:30',NULL),
	(3,1,'9fce9b7ba6e34fc99676119620c2c774',2,1,'2018-07-02 11:25:47',1,'2018-01-03 11:25:47','2018-01-08 08:19:30',NULL),
	(4,3,'5f5eb83ea51447b5b802c3e8c1640350',1,1,'2018-07-03 09:03:44',0,'2018-01-04 09:03:44','2018-01-08 08:19:30',NULL),
	(5,1,'17a492ab343a4178b9c6f22d1b875c11',2,1,'2018-07-03 09:20:54',0,'2018-01-04 09:20:54','2018-01-08 08:19:30',NULL),
	(6,3,'87acffbd03c3496baa5b6403e033d151',1,1,'2018-07-03 09:25:58',0,'2018-01-04 09:25:58','2018-01-08 08:19:30',NULL),
	(7,3,'0326ad9537c641cdb7a2c9bded23d3d7',1,1,'2018-07-03 09:38:36',0,'2018-01-04 09:38:36','2018-01-08 08:19:30',NULL),
	(8,1,'b899046ec4444ef394dd4efcac6bab04',2,1,'2018-07-03 10:20:47',0,'2018-01-04 10:20:46','2018-01-08 08:19:30',NULL),
	(9,3,'f4898a2bee4c4b88a9b40bbf1e00d4d6',2,1,'2018-07-03 10:21:47',1,'2018-01-04 10:21:46','2018-01-08 08:19:30',NULL),
	(10,3,'452070276ce64e9b8ae330f8c3a00e2c',1,1,'2018-07-03 10:24:43',0,'2018-01-04 10:24:43','2018-01-08 08:19:30',NULL),
	(11,3,'9e067bf6c1b1482183da6fd85ee31f14',1,1,'2018-07-04 13:31:41',0,'2018-01-05 13:31:40','2018-01-08 08:19:30',NULL),
	(12,3,'eb3840f28f6d40bdb0932d1b394e3361',1,1,'2018-07-04 14:46:59',1,'2018-01-05 14:46:58','2018-01-08 08:19:30',NULL),
	(13,3,'0114817c28f640b6a811501153b4381a',1,1,'2018-07-04 14:47:19',0,'2018-01-05 14:47:18','2018-01-08 08:19:30',NULL),
	(14,3,'37ca692daa2e42c685bff32a757a77b2',1,1,'2018-07-04 14:58:33',0,'2018-01-05 14:58:33','2018-01-08 08:19:30',NULL),
	(15,3,'a4aa1a948e284f75bd08092c8f4a3fc7',1,1,'2018-07-04 15:04:57',1,'2018-01-05 15:04:57','2018-01-08 08:19:30',NULL),
	(16,3,'b1fbbaa54fa34ba19d5d56120325c6fe',1,1,'2018-07-04 15:16:45',0,'2018-01-05 15:16:45','2018-01-08 08:19:30',NULL),
	(17,3,'b8663469048e442896acc3c6a5bbcfb8',1,1,'2018-07-04 17:38:33',0,'2018-01-05 17:38:33','2018-01-08 08:19:30',NULL),
	(18,3,'e68cb2b75a2440e8950cf4808ad45e14',1,1,'2018-07-07 07:53:39',1,'2018-01-08 07:53:38','2018-01-08 08:19:30',NULL),
	(19,3,'0369c231dc7a41cba140e340f6710489',1,1,'2018-07-07 08:05:10',1,'2018-01-08 08:05:09','2018-01-08 08:19:30',NULL);

/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table survey_questions
# ------------------------------------------------------------

DROP VIEW IF EXISTS `survey_questions`;

CREATE TABLE `survey_questions` (
   `id` INT(11) NOT NULL DEFAULT '0',
   `survey_type` VARCHAR(32) NOT NULL,
   `company` VARCHAR(32) NOT NULL,
   `question_id` INT(11) NOT NULL DEFAULT '0',
   `question` VARCHAR(255) NOT NULL,
   `answer_type` VARCHAR(32) NOT NULL,
   `steps` INT(11) NOT NULL,
   `answer_sequence` BIGINT(11) NULL DEFAULT NULL,
   `answer_id` BIGINT(11) NULL DEFAULT NULL,
   `answer` VARCHAR(255) NULL DEFAULT NULL,
   `next_question_id` INT(11) NULL DEFAULT '0',
   `next_question` VARCHAR(255) NULL DEFAULT NULL
) ENGINE=MyISAM;



# Dump of table survey_types
# ------------------------------------------------------------

DROP TABLE IF EXISTS `survey_types`;

CREATE TABLE `survey_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_type` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `survey_type_id` (`id`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `survey_types` WRITE;
/*!40000 ALTER TABLE `survey_types` DISABLE KEYS */;

INSERT INTO `survey_types` (`id`, `survey_type`)
VALUES
	(1,'Pulse'),
	(2,'360'),
	(3,'Peer');

/*!40000 ALTER TABLE `survey_types` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table surveys
# ------------------------------------------------------------

DROP TABLE IF EXISTS `surveys`;

CREATE TABLE `surveys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_type_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `start` datetime NOT NULL DEFAULT '1970-01-01 00:00:00',
  `end` datetime NOT NULL DEFAULT '2099-12-31 23:59:59',
  `first_question_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `survey_id` (`id`) USING HASH,
  KEY `survey_survey_type_id` (`survey_type_id`) USING HASH,
  KEY `survey_company_id` (`company_id`) USING HASH,
  KEY `first_question_id` (`first_question_id`),
  CONSTRAINT `surveys_ibfk_1` FOREIGN KEY (`survey_type_id`) REFERENCES `survey_types` (`id`),
  CONSTRAINT `surveys_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `surveys_ibfk_3` FOREIGN KEY (`first_question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `surveys` WRITE;
/*!40000 ALTER TABLE `surveys` DISABLE KEYS */;

INSERT INTO `surveys` (`id`, `survey_type_id`, `company_id`, `start`, `end`, `first_question_id`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,1,2,'1970-01-01 00:00:00','2099-12-31 23:59:59',1,'2017-12-22 07:48:47',NULL,NULL),
	(2,2,2,'1970-01-01 00:00:00','2099-12-31 23:59:59',NULL,'2017-12-24 09:01:38',NULL,NULL);

/*!40000 ALTER TABLE `surveys` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user_answers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_answers`;

CREATE TABLE `user_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_sequence` int(11) DEFAULT NULL,
  `answers` varchar(255) DEFAULT NULL,
  `sentiment_id` float NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `user_answer_id` (`id`) USING HASH,
  KEY `user_answer_question_id` (`question_id`) USING HASH,
  KEY `user_answer_sentiment_id` (`sentiment_id`) USING HASH,
  CONSTRAINT `user_answers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `user_answers` WRITE;
/*!40000 ALTER TABLE `user_answers` DISABLE KEYS */;

INSERT INTO `user_answers` (`id`, `user_id`, `question_id`, `answer_sequence`, `answers`, `sentiment_id`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,3,1,2,NULL,0,'2017-12-24 08:37:28',NULL,NULL),
	(2,3,8,NULL,NULL,0,'2018-01-04 11:30:41',NULL,NULL),
	(3,3,9,NULL,NULL,0,'2018-01-04 11:30:43',NULL,NULL),
	(4,3,11,NULL,NULL,0,'2018-01-04 11:30:45',NULL,NULL),
	(5,3,13,NULL,NULL,0,'2018-01-04 11:30:47',NULL,NULL),
	(6,3,7,NULL,NULL,0,'2018-01-05 13:33:13',NULL,NULL),
	(7,3,6,NULL,NULL,0,'2018-01-06 13:47:18',NULL,NULL),
	(8,3,10,NULL,NULL,0,'2018-01-06 13:47:21',NULL,NULL);

/*!40000 ALTER TABLE `user_answers` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `designation_id` int(11) NOT NULL,
  `first_name` varchar(64) NOT NULL,
  `last_name` varchar(64) NOT NULL,
  `phone` varchar(64) NOT NULL,
  `email` varchar(64) NOT NULL,
  `password` varchar(64) NOT NULL,
  `join_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gender` enum('M','F','O') DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email` (`email`),
  UNIQUE KEY `unique_user` (`role_id`,`email`) USING HASH,
  KEY `user_id` (`id`) USING HASH,
  KEY `user_role_id` (`role_id`) USING HASH,
  KEY `user_company_id` (`company_id`) USING HASH,
  KEY `user_designation_id` (`designation_id`) USING HASH,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `role_id`, `company_id`, `designation_id`, `first_name`, `last_name`, `phone`, `email`, `password`, `join_date`, `gender`, `active`, `created_at`, `updated_at`, `deleted_at`)
VALUES
	(1,1,1,1,'XaneAI','Admin','9999999999','admin@xane.ai','5f4dcc3b5aa765d61d8327deb882cf99','2017-12-22 07:48:41',NULL,1,'2017-12-22 07:48:41',NULL,NULL),
	(2,1,2,1,'Manu','Rana','8888888888','manu.rana@baxi.taxi','5f4dcc3b5aa765d61d8327deb882cf99','2017-12-22 07:48:41',NULL,1,'2017-12-22 07:48:41',NULL,NULL),
	(3,2,2,2,'Sahil','Narain','7777777777','sahil.narain@gmail.com','5f4dcc3b5aa765d61d8327deb882cf99','2017-12-22 07:48:41',NULL,1,'2017-12-22 07:48:41',NULL,NULL);

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;




# Replace placeholder table for survey_questions with correct view syntax
# ------------------------------------------------------------

DROP TABLE `survey_questions`;

CREATE ALGORITHM=UNDEFINED DEFINER=`baxi`@`%` SQL SECURITY DEFINER VIEW `survey_questions` AS (select `s`.`id` AS `id`,`st`.`survey_type` AS `survey_type`,`c`.`company` AS `company`,`q1`.`id` AS `question_id`,`q1`.`question` AS `question`,`at`.`answer_type` AS `answer_type`,`q1`.`steps` AS `steps`,(case when (`qr`.`answer_sequence` is not null) then `qr`.`answer_sequence` else 0 end) AS `answer_sequence`,(case when (`qa`.`id` is not null) then `qa`.`id` else 0 end) AS `answer_id`,(case when (`qa`.`answer` is not null) then `qa`.`answer` else 0 end) AS `answer`,`q2`.`id` AS `next_question_id`,`q2`.`question` AS `next_question` from (((((((`question_routings` `qr` join `questions` `q1` on((`q1`.`id` = `qr`.`question_id`))) join `answer_types` `at` on((`at`.`id` = `q1`.`answer_type_id`))) join `surveys` `s` on((`s`.`id` = `q1`.`survey_id`))) join `survey_types` `st` on((`st`.`id` = `s`.`survey_type_id`))) join `companies` `c` on((`c`.`id` = `s`.`company_id`))) left join `questions` `q2` on((`q2`.`id` = `qr`.`next_question_id`))) left join `question_answers` `qa` on(((`qa`.`question_id` = `qr`.`question_id`) and (`qa`.`sequence` = `qr`.`answer_sequence`)))) order by `s`.`id`,`q1`.`id`,`qr`.`answer_sequence`);

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
