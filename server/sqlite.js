import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
export function openDatabase(directory){mkdirSync(directory,{recursive:true});const db=new DatabaseSync(path.join(directory,'defcon.sqlite'));db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');db.exec('CREATE TABLE IF NOT EXISTS local_migrations(name TEXT PRIMARY KEY)');const name='0000_sessions';if(!db.prepare('SELECT name FROM local_migrations WHERE name=?').get(name)){db.exec('BEGIN IMMEDIATE');try{db.exec(readFileSync(new URL('../drizzle/0000_sessions.sql',import.meta.url),'utf8'));db.prepare('INSERT INTO local_migrations(name) VALUES(?)').run(name);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}}
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values);},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){const result=db.prepare(sql).run(...args);return {meta:{changes:Number(result.changes)}};},sql,args});
 return {prepare:wrap,async batch(statements){db.exec('BEGIN IMMEDIATE');try{const results=[];for(const s of statements)results.push(db.prepare(s.sql).run(...s.args));db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}},close(){db.close();}};
}
