CREATE DATABASE IF NOT EXISTS kazilink
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE kazilink;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'freelancer', 'admin') NOT NULL DEFAULT 'owner',
  email_verified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email),
  KEY users_role_idx (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) NOT NULL,
  title VARCHAR(160) NULL,
  service VARCHAR(160) NULL,
  category VARCHAR(100) NULL,
  subcategories JSON NOT NULL,
  price DECIMAL(12, 2) NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  location VARCHAR(160) NULL,
  languages JSON NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  experience ENUM('new', 'established', 'expert') NULL,
  availability ENUM('this week', 'this month', 'flexible') NULL,
  accepts_mpesa BOOLEAN NOT NULL DEFAULT FALSE,
  online BOOLEAN NOT NULL DEFAULT FALSE,
  bio TEXT NULL,
  avatar_url TEXT NULL,
  portfolio JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY profiles_category_idx (category),
  KEY profiles_location_idx (location),
  KEY profiles_availability_idx (availability),
  KEY profiles_price_idx (price),
  KEY profiles_verified_idx (verified),
  KEY profiles_created_idx (created_at),
  CONSTRAINT profiles_user_fk
    FOREIGN KEY (id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT profiles_price_check CHECK (price IS NULL OR price >= 0),
  CONSTRAINT profiles_rating_check CHECK (rating BETWEEN 0 AND 5),
  CONSTRAINT profiles_portfolio_array_check CHECK (JSON_TYPE(portfolio) = 'ARRAY'),
  CONSTRAINT profiles_languages_array_check CHECK (JSON_TYPE(languages) = 'ARRAY'),
  CONSTRAINT profiles_subcategories_array_check CHECK (JSON_TYPE(subcategories) = 'ARRAY')
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS job_requests (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  client_id CHAR(36) NOT NULL,
  client_name VARCHAR(120) NOT NULL,
  freelancer_id CHAR(36) NOT NULL,
  freelancer_name VARCHAR(120) NOT NULL,
  service VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(12, 2) NOT NULL,
  deadline DATE NOT NULL,
  location VARCHAR(160) NOT NULL,
  status ENUM('pending', 'accepted', 'declined', 'completed') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY job_requests_client_created_idx (client_id, created_at),
  KEY job_requests_freelancer_created_idx (freelancer_id, created_at),
  KEY job_requests_created_idx (created_at),
  CONSTRAINT job_requests_client_fk
    FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT job_requests_freelancer_fk
    FOREIGN KEY (freelancer_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT job_requests_parties_check CHECK (client_id <> freelancer_id),
  CONSTRAINT job_requests_budget_check CHECK (budget > 0),
  CONSTRAINT job_requests_description_check CHECK (CHAR_LENGTH(TRIM(description)) >= 12)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS saved_profiles (
  user_id CHAR(36) NOT NULL,
  profile_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, profile_id),
  KEY saved_profiles_profile_idx (profile_id),
  CONSTRAINT saved_profiles_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT saved_profiles_profile_fk
    FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT saved_profiles_distinct_users_check CHECK (user_id <> profile_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  request_id CHAR(36) NOT NULL,
  client_id CHAR(36) NOT NULL,
  client_name VARCHAR(120) NOT NULL,
  freelancer_id CHAR(36) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY reviews_request_unique (request_id),
  KEY reviews_freelancer_created_idx (freelancer_id, created_at),
  KEY reviews_client_idx (client_id),
  CONSTRAINT reviews_request_fk
    FOREIGN KEY (request_id) REFERENCES job_requests (id) ON DELETE CASCADE,
  CONSTRAINT reviews_client_fk
    FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT reviews_freelancer_fk
    FOREIGN KEY (freelancer_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_comment_check CHECK (CHAR_LENGTH(TRIM(comment)) >= 10)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auth_tokens (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  token_type ENUM('email_verification', 'password_reset') NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY auth_tokens_hash_unique (token_hash),
  KEY auth_tokens_user_type_idx (user_id, token_type, expires_at),
  CONSTRAINT auth_tokens_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
