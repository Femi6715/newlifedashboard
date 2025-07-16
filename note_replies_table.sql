-- Create note_replies table
CREATE TABLE note_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES post_board(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    INDEX idx_note_id (note_id),
    INDEX idx_author_id (author_id),
    INDEX idx_created_at (created_at)
); 