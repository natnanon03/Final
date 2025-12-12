CREATE TABLE IF NOT EXISTS todo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed TINYINT(1) DEFAULT 0
);

INSERT INTO todo (title, completed) VALUES
('อ่านหนังสือสอบ', 0),
('ทำการบ้าน', 0),
('ออกกำลังกาย', 1);
