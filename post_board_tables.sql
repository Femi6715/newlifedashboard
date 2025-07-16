-- Create post_board table
CREATE TABLE post_board (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    visibility ENUM('public', 'role_based', 'user_specific', 'private') NOT NULL,
    status ENUM('draft', 'active', 'archived', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    INDEX idx_author_id (author_id),
    INDEX idx_visibility (visibility),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create post_board_roles table for role-based visibility
CREATE TABLE post_board_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    role ENUM('admin', 'clinical_director', 'counselor', 'nurse', 'therapist', 'staff') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post_board(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    UNIQUE KEY unique_post_role (post_id, role),
    INDEX idx_post_id (post_id),
    INDEX idx_role (role)
);

-- Create post_board_users table for user-specific visibility
CREATE TABLE post_board_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post_board(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    UNIQUE KEY unique_post_user (post_id, user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
); 