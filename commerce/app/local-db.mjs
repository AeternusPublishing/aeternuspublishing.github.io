import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function database(filename = ':memory:') {
  const sqlite = new DatabaseSync(filename);
  sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  sqlite.exec(readFileSync(new URL('./migrations/0001.sql',import.meta.url),'utf8'));
  function prepare(sql) {
    let parameters = [];
    const statement = sqlite.prepare(sql);
    const wrapper = {
      bind(...args) {parameters = args; return wrapper;},
      async first() {return statement.get(...parameters) || null;},
      async all() {return {results:statement.all(...parameters)};},
      async run() {const result=statement.run(...parameters); return {meta:{changes:Number(result.changes)}};},
      execute() {const result=statement.run(...parameters); return {meta:{changes:Number(result.changes)}};}
    };
    return wrapper;
  }
  return {prepare,async batch(statements) {
    sqlite.exec('BEGIN IMMEDIATE');
    try {const results=statements.map(s=>s.execute()); sqlite.exec('COMMIT'); return results;}
    catch(error) {sqlite.exec('ROLLBACK'); throw error;}
  }, close:()=>sqlite.close(), backup(path) {sqlite.prepare('VACUUM INTO ?').run(path);}};
}
