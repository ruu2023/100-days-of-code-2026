"use client";

import { useEffect, useState, useCallback } from "react";
import initSqlJs, { Database, SqlJsStatic } from "sql.js";

export function useSql() {
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `/${file}`,
        });
        const newDb = new SQL.Database();
        
        // Initialize sample data
        newDb.run(`
          CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, role TEXT, score INTEGER);
          INSERT INTO users VALUES (1, 'Alice', 'Admin', 95);
          INSERT INTO users VALUES (2, 'Bob', 'User', 80);
          INSERT INTO users VALUES (3, 'Charlie', 'User', 88);
          INSERT INTO users VALUES (4, 'Diana', 'Manager', 92);
          INSERT INTO users VALUES (5, 'Eve', 'User', 75);
        `);
        
        setDb(newDb);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const runQuery = useCallback((query: string) => {
    if (!db) return null;
    try {
      setError(null);
      const res = db.exec(query);
      return res;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [db]);

  return { db, runQuery, error, loading };
}
