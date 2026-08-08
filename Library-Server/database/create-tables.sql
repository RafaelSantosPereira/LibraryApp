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

CREATE TABLE `loans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `request_date` timestamp DEFAULT CURRENT_TIMESTAMP, -- Quando o User clicou em "Request"
  `loan_date` timestamp NULL DEFAULT NULL,            -- Quando o Admin aprovou
  `due_date` timestamp NULL DEFAULT NULL,             -- Limite de entrega (ex: +14 dias)
  `return_date` timestamp NULL DEFAULT NULL,          -- Quando foi devolvido
  `status` enum('pending', 'active', 'returned', 'overdue') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Lista de Desejos (Wishlist / Favoritos)
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `added_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_book` (`user_id`, `book_id`) -- Impede duplicados
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;