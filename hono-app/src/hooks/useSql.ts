"use client";

import { useCallback, useEffect, useState } from "react";
import initSqlJs, { Database } from "sql.js";

export function useSql() {
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const SQL = await initSqlJs({
          // Fetch WASM from CDN to avoid Next.js/Turbopack static file caching issues
          locateFile: (file) => `https://unpkg.com/sql.js@1.14.0/dist/${file}`,
        });
        const newDb = new SQL.Database();
        // Initialize sample data for curriculum problems
        newDb.run(`
          CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, role TEXT, score INTEGER);
          INSERT INTO users VALUES (1, 'Alice', 'Admin', 95);
          INSERT INTO users VALUES (2, 'Bob', 'User', 80);
          INSERT INTO users VALUES (3, 'Charlie', 'User', 88);
          INSERT INTO users VALUES (4, 'Diana', 'Manager', 92);
          INSERT INTO users VALUES (5, 'Eve', 'User', 75);
        `);
        setDb(newDb);
        setIsReady(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadData = useCallback(async (rowCount: number) => {
    if (!db) return;
    try {
      setLoading(true);
      setError(null);

      // Yield to main thread to allow React to paint the loading state
      await new Promise(resolve => setTimeout(resolve, 50));

      // Drop and recreate
      db.run(`DROP TABLE IF EXISTS users;`);
      db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY,
          name TEXT,
          role TEXT,
          score INTEGER
        );
      `);

      // Begin bulk insert
      db.run('BEGIN TRANSACTION;');
      const stmt = db.prepare('INSERT INTO users (id, name, role, score) VALUES (?, ?, ?, ?)');
      const roles = ['GUEST', 'MEMBER', 'ADMIN', 'MODERATOR'];
      
      for (let i = 1; i <= rowCount; i++) {
        const role = roles[Math.floor(Math.random() * roles.length)];
        const score = Math.floor(Math.random() * 10000);
        stmt.run([i, `User${i}`, role, score]);
      }
      stmt.free();
      db.run('COMMIT;');
      
    } catch (err: any) {
      setError(err.message);
      db.run('ROLLBACK;'); // rollback on error
    } finally {
      setLoading(false);
    }
  }, [db]);

  const runQuery = useCallback((query: string) => {
    if (!db) return { results: null, timeMs: 0 };
    try {
      setError(null);
      const start = performance.now();
      const res = db.exec(query);
      const end = performance.now();
      
      return { results: res, timeMs: end - start };
    } catch (err: any) {
      setError(err.message);
      return { results: null, timeMs: 0 };
    }
  }, [db]);

  return { db, runQuery, loadData, error, loading, isReady };
}
