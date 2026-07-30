-- library.books definição

CREATE TABLE books (
  id int NOT NULL AUTO_INCREMENT,
  title varchar(255) NOT NULL,
  author varchar(255) NOT NULL,
  year int DEFAULT NULL,
  category varchar(100) DEFAULT NULL,
  cover_image varchar(255) DEFAULT NULL,
  total_copies int DEFAULT '1',
  available_copies int DEFAULT '1',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- library.users definição

CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  email varchar(100) NOT NULL,
  role enum('admin','user') DEFAULT 'user',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY username (username),
  UNIQUE KEY email (email)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- library.user_auth definição

CREATE TABLE user_auth (
  user_id int NOT NULL,
  password_hash varchar(255) NOT NULL,
  last_login datetime DEFAULT NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT user_auth_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
