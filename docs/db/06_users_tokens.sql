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