DROP DATABASE IF EXISTS books;
-- DROP DATABASE IF EXISTS books_test;

CREATE DATABASE books;
-- CREATE DATABASE books_test;

\c books
-- \c books_test

CREATE TABLE books (
  isbn TEXT PRIMARY KEY,
  amazon_url TEXT,
  author TEXT,
  language TEXT, 
  pages INTEGER,
  publisher TEXT,
  title TEXT, 
  year INTEGER
);
