CREATE TABLE IF NOT EXISTS todo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed TINYINT(1) DEFAULT 0,
  event_datetime DATETIME NULL
);

INSERT INTO todo (title, completed, event_datetime) VALUES
('อ่านหนังสือสอบ', 0, '2025-12-13 09:00:00'),
('ทำการบ้าน', 0, '2025-12-13 14:00:00'),
('ออกกำลังกาย', 1, '2025-12-13 18:00:00');
