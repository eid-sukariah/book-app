DROP TABLE IF EXISTS books;
CREATE TABLE books(
    id SERIAL PRIMARY KEY,
    author VARCHAR(1000),
    title VARCHAR(1000),
    isbn VARCHAR(1000),
    image_url VARCHAR(2255),
    descriptions VARCHAR(2255)
);