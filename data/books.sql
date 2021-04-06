DROP TABLE IF EXISTS books;
CREATE TABLE books(
    id SERIAL PRIMARY KEY,
    author VARCHAR(250),
    title VARCHAR(250),
    isbn VARCHAR(550),
    image_url VARCHAR(500),
    descriptions VARCHAR(200)
);