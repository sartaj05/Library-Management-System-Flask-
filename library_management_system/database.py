import sqlite3

def connect_db():
    conn = sqlite3.connect('library.db')
    return conn

def create_tables():
    conn = connect_db()
    cursor = conn.cursor()

    # Create books table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS books (
        book_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        available_copies INTEGER NOT NULL
    )
    ''')

    # Create members table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS members (
        member_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
    )
    ''')
    
    # Create borrowing table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS borrowing (
        borrow_id INTEGER PRIMARY KEY,
        member_id INTEGER,
        book_id INTEGER,
        borrow_date TEXT,
        return_date TEXT,
        FOREIGN KEY(member_id) REFERENCES members(member_id),
        FOREIGN KEY(book_id) REFERENCES books(book_id)
    )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS latefee (
        borrow_id INTEGER PRIMARY KEY,
        date TEXT NOT NULL,
        fees INTEGER
    )
    ''')
    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_tables()
