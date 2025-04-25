CREATE DATABASE IT_ROADMAP;
USE IT_ROADMAP;

-- Bảng User
CREATE TABLE User (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Roadmap
CREATE TABLE Roadmap (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Bảng Enroll (N-N giữa User và Roadmap)
CREATE TABLE Enroll (
	id CHAR(36),
    UserID CHAR(36),
    RoadmapID CHAR(36),
    start_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NULL,
    PRIMARY KEY (id, UserID, RoadmapID),
    FOREIGN KEY (UserID) REFERENCES User(ID) ON DELETE CASCADE,
    FOREIGN KEY (RoadmapID) REFERENCES Roadmap(ID) ON DELETE CASCADE
);

-- Bảng Bookmark
CREATE TABLE Bookmark (
	id CHAR(36),
    UserID CHAR(36),
    RoadmapID CHAR(36),
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id, UserID, RoadmapID),
    FOREIGN KEY (UserID) REFERENCES User(ID) ON DELETE CASCADE,
    FOREIGN KEY (RoadmapID) REFERENCES Roadmap(ID) ON DELETE CASCADE
);

-- Bảng Topic
CREATE TABLE Topic (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

-- Bảng Topic_Roadmap
CREATE TABLE Topic_Roadmap (
	id CHAR(36),
	TopicID CHAR(36),
    RoadmapID CHAR(36),
    topic_order INT NOT NULL,
	PRIMARY KEY (id, TopicID, RoadmapID),
	FOREIGN KEY (TopicID) REFERENCES Topic(ID) ON DELETE CASCADE,
    FOREIGN KEY (RoadmapID) REFERENCES Roadmap(ID) ON DELETE CASCADE
);

-- Bảng User_Topic_Progress
CREATE TABLE User_Topic_Progress (
	id CHAR(36),
	UserID CHAR(36),
    TopicID CHAR(36),
    status ENUM('pending', 'done', 'skip') NOT NULL DEFAULT 'pending',
    PRIMARY KEY (id, UserID, TopicID),
    FOREIGN KEY (UserID) REFERENCES User(ID) ON DELETE CASCADE,
    FOREIGN KEY (TopicID) REFERENCES Topic(ID) ON DELETE CASCADE
);

-- Bảng Resource_Type
CREATE TABLE Resource_Type (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Bảng Resource
CREATE TABLE Resource (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    TopicID CHAR(36),
    Resource_TypeID CHAR(36),
    FOREIGN KEY (TopicID) REFERENCES Topic(ID) ON DELETE CASCADE,
    FOREIGN KEY (Resource_TypeID) REFERENCES Resource_Type(ID) ON DELETE CASCADE
);

-- Bảng Exercise
CREATE TABLE Exercise (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    TopicID CHAR(36),
    FOREIGN KEY (TopicID) REFERENCES Topic(ID) ON DELETE CASCADE
);

-- Bảng Quiz_Question
CREATE TABLE Quiz_Question (
    id CHAR(36) PRIMARY KEY,
    question_text TEXT NOT NULL,
    ExerciseID CHAR(36),
    FOREIGN KEY (ExerciseID) REFERENCES Exercise(ID) ON DELETE CASCADE
);

-- Bảng Quiz_Answer
CREATE TABLE Quiz_Answer (
    id CHAR(36) PRIMARY KEY,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    Quiz_QuestionID CHAR(36),
    FOREIGN KEY (Quiz_QuestionID) REFERENCES Quiz_Question(ID) ON DELETE CASCADE
);

Drop database it_roadmap;

-- Lấy toàn bộ người dùng
SELECT * FROM User;

-- Lấy toàn bộ roadmap
SELECT * FROM Roadmap;

-- Lấy toàn bộ bản ghi đăng ký roadmap
SELECT * FROM Enroll;

-- Lấy toàn bộ bản ghi đánh dấu roadmap
SELECT * FROM Bookmark;

-- Lấy toàn bộ topic
SELECT * FROM Topic;

-- Lấy toàn bộ mối liên hệ topic-roadmap
SELECT * FROM Topic_Roadmap;

-- Lấy toàn bộ tiến độ học tập của người dùng theo topic
SELECT * FROM User_Topic_Progress;

-- Lấy toàn bộ loại tài nguyên
SELECT * FROM Resource_Type;

-- Lấy toàn bộ tài nguyên học tập
SELECT * FROM Resource;

-- Lấy toàn bộ bài tập
SELECT * FROM Exercise;

-- Lấy toàn bộ câu hỏi quiz
SELECT * FROM Quiz_Question;

-- Lấy toàn bộ câu trả lời cho quiz
SELECT * FROM Quiz_Answer;

DESCRIBE User;

SELECT id, role FROM User WHERE id = 'US001';

