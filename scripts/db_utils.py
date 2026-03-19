"""
Shared database utilities for scrapers
"""
import os
from contextlib import contextmanager
import psycopg
from psycopg import sql


@contextmanager
def get_db_connection():
    """Get a PostgreSQL connection to Supabase"""
    conn = psycopg.connect(os.environ["POSTGRES_URL_NON_POOLING"])
    try:
        yield conn
    finally:
        conn.close()


def check_scrape_log(source_url: str, content_hash: str) -> bool:
    """
    Check if this content has been scraped before (idempotency check)
    Returns True if already scraped, False if new
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM scrape_log WHERE source_url = %s AND content_hash = %s",
                (source_url, content_hash),
            )
            result = cur.fetchone()
            return result is not None


def log_scrape(source_url: str, content_hash: str, status: str, error_message: str | None = None):
    """Log a scrape attempt to the scrape_log table"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(
                    """
                    INSERT INTO scrape_log (source_url, content_hash, status, error_message)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (content_hash) DO UPDATE SET status = %s
                    """,
                    (source_url, content_hash, status, error_message, status),
                )
                conn.commit()
            except Exception as e:
                print(f"[v0] Error logging scrape: {e}")
                conn.rollback()


def execute_query(query: str, params: tuple = ()):
    """Execute a raw SQL query"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            conn.commit()
