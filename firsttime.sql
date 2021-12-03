USE KO

DROP USER IF EXISTS 'node'@'localhost';
DROP USER IF EXISTS 'c'@'localhost';

CREATE USER 'node'@'localhost';

GRANT ALL PRIVILEGES ON * . * TO 'node'@'localhost';

CREATE USER 'c'@'localhost';

GRANT ALL PRIVILEGES ON * . * TO 'c'@'localhost';