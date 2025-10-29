-- Create activity_logs table for admin dashboard
CREATE TABLE IF NOT EXISTS activity_logs (
    activity_id VARCHAR(12) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    user_id VARCHAR(12),
    user_name VARCHAR(100),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX idx_activity_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_activity_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_type ON activity_logs(type);

-- Insert sample activity logs
INSERT INTO activity_logs (activity_id, type, description, user_id, user_name, timestamp)
VALUES 
    (SUBSTRING(MD5(RANDOM()::text), 1, 12), 'USER_REGISTERED', 'Người dùng mới Test User đã đăng ký', NULL, 'Test User', NOW() - INTERVAL '1 hour'),
    (SUBSTRING(MD5(RANDOM()::text), 1, 12), 'PROJECT_CREATED', 'Dự án mới "Smart Campus" đã được tạo', NULL, 'John Doe', NOW() - INTERVAL '2 hours'),
    (SUBSTRING(MD5(RANDOM()::text), 1, 12), 'PROJECT_APPROVED', 'Dự án "IoT System" đã được phê duyệt', NULL, 'Jane Smith', NOW() - INTERVAL '3 hours'),
    (SUBSTRING(MD5(RANDOM()::text), 1, 12), 'TOPIC_CREATED', 'Chủ đề mới "Help with Java" đã được tạo', NULL, 'Mike Johnson', NOW() - INTERVAL '4 hours');
