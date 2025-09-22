const sqlite3 = require('sqlite3');
const path = require('path');

const db = new sqlite3(path.resolve(__dirname,'database.db'));
db.serialize(()=>{
    db.run(`
        create table if not exists tasks(
        id integer primary key  autoincrement,
        title text not null,
        description text,
        done integer default 0)
        user_id integer,
        foreign key(user_id) references users(id) on delete set null

        `);
    db.run(`
        create table if not exists users(
            id integer primary key  autoincrement,
            name text not null,
            emaila text unique

        )
        `);

    db.run(`
        create table if not exists profiles(
        user_id integer primary key,
        bio text,
        foreign key(user_id) references users(id) on delete cascade)
        `) ;       

    db.run(`
        CREATE TABLE IF NOT EXISTS tags(
            id integer primary key  autoincrement,
            name ttext not null unique
        )
        `);
    
    db.run(`
        create table if not exist task_tags(
            task_id integer not null,
            tag_id integer not null,
            primary key (task_id, tag_id),
            FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE

        )`)
});


module.exports = db;