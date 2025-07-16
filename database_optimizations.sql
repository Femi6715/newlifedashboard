-- Database Optimizations for Note Board

-- 1. Add composite indexes for better query performance
ALTER TABLE post_board ADD INDEX idx_status_created_at (status, created_at);
ALTER TABLE post_board ADD INDEX idx_author_status (author_id, status);
ALTER TABLE post_board ADD INDEX idx_visibility_status (visibility, status);

-- 2. Add composite indexes for role and user visibility
ALTER TABLE post_board_roles ADD INDEX idx_post_role (post_id, role);
ALTER TABLE post_board_users ADD INDEX idx_post_user (post_id, user_id);

-- 3. Add index for note replies
ALTER TABLE note_replies ADD INDEX idx_note_created (note_id, created_at);

-- 4. Add covering indexes for common queries
ALTER TABLE users ADD INDEX idx_id_role_active (id, role, is_active);
ALTER TABLE users ADD INDEX idx_active_name (is_active, first_name, last_name);

-- 5. Optimize the post_board table structure
-- Add a computed column for better visibility checking
ALTER TABLE post_board ADD COLUMN visibility_type ENUM('public', 'role_based', 'user_specific', 'private') AS (visibility) STORED;
ALTER TABLE post_board ADD INDEX idx_visibility_type_status (visibility_type, status);

-- 6. Create a view for faster post retrieval with author info
CREATE VIEW v_posts_with_authors AS
SELECT 
    pb.id,
    pb.title,
    pb.content,
    pb.author_id,
    pb.visibility,
    pb.status,
    pb.created_at,
    pb.updated_at,
    CONCAT(u.first_name, ' ', u.last_name) as author_name,
    u.role as author_role
FROM post_board pb
INNER JOIN users u ON pb.author_id = u.id
WHERE pb.status = 'active';

-- 7. Create a view for post visibility permissions
CREATE VIEW v_post_permissions AS
SELECT 
    pb.id as post_id,
    pb.visibility,
    pb.author_id,
    pbr.role as allowed_role,
    pbu.user_id as allowed_user_id
FROM post_board pb
LEFT JOIN post_board_roles pbr ON pb.id = pbr.post_id
LEFT JOIN post_board_users pbu ON pb.id = pbu.post_id
WHERE pb.status = 'active';

-- 8. Add fulltext search index for content search (optional)
ALTER TABLE post_board ADD FULLTEXT INDEX ft_title_content (title, content); 