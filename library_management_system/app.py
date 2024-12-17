from flask import Flask, render_template, request, redirect, url_for, flash, jsonify,send_from_directory # type: ignore
import sqlite3
import os
from datetime import datetime 
from werkzeug.security import generate_password_hash,check_password_hash # type: ignore
import matplotlib.pyplot as plt # type: ignore
import io
import base64
app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('library.db')
    conn.row_factory = sqlite3.Row
    return conn
def calculate_late_fee(borrow_date, return_date, rate_per_day=10):
    # borrow_date='2024-11-01 13:59:06'
    borrow_date = datetime.strptime(borrow_date, '%Y-%m-%d %H:%M:%S')
    return_date = datetime.strptime(return_date, '%Y-%m-%d %H:%M:%S')
    days_late = (return_date - borrow_date).days 
    return max(0, days_late * rate_per_day)
# Example route for homepage
@app.route('/index')
def index():
    return render_template('index.html')
@app.route('/addBook')
def addbook():
    return render_template('add-book.html')
@app.route('/register')
def register():
    return render_template('register-member.html')
@app.route('/borrow')
def borrow():
    return render_template('borrow-book.html')
@app.route('/return')
def returnbook():
    return render_template('return-book.html')
@app.route('/history')
def history():
    return render_template('view-borrowing-history.html')
@app.route('/status')
def status():
    return render_template('borrowing-stats.html')
@app.route('/signup')
def signup():
    return render_template('signup.html')
@app.route('/')
def login():
    return render_template('login.html')

@app.route('/addsignup', methods=['POST'])
def addsignup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    # Basic validation
    if not name or not email or not password:
        return jsonify({"message": "All fields are required."}), 400

    # # Hash the password
    hashed_password = generate_password_hash(password)
    print(hashed_password)

    conn = get_db_connection()
    cursor = conn.cursor()

    # # Check if the email is already in use
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"message": "Email is already registered."}), 409
    return jsonify({"message": "Email is already registered."}), 409
@app.route('/registeruser', methods=['POST'])

def registeruser():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Get JSON data from the request
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')  # Get the plain password from the JSON data

        # Check if any required field is missing
        if not username or not email or not password:
            return jsonify({"message": "Username, email, and password are required"}), 400

        # Hash the password before storing it
        password_hash = generate_password_hash(password)

        # Insert the user into the database
        cursor.execute('''
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        ''', (username, email, password_hash))
        
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201

    except sqlite3.IntegrityError:
        return jsonify({"message": "Username or email already exists"}), 400
    except Exception as e:
        print(f"Error: {e}")  # Print error to the terminal for debugging
        return jsonify({"message": "Internal server error"}), 500
    finally:
        conn.close()


@app.route('/addbook', methods=['POST'])
def add_book():
    title = request.form.get('bookTitle')
    author = request.form.get('bookAuthor')
    availableCopies = request.form.get('availableCopies')

    # Check if the book already exists in the database by title
    conn = get_db_connection()
    existing_book = conn.execute('SELECT * FROM books WHERE title = ?', (title,)).fetchone()
    if existing_book:
        # If the book already exists, return a 400 error with an appropriate message
        conn.close()
        return jsonify({'error': 'A book with this title already exists.'}), 400

    # Insert the new book into the database if it doesn't exist already
    try:
        conn.execute('INSERT INTO books (title, author, available_copies) VALUES (?, ?, ?)', 
                     (title, author, availableCopies))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Book added successfully'}), 200
    except Exception as e:
        conn.close()
        print(f'Error adding book: {e}')
        return jsonify({'error': 'Error adding book'}), 500
    
# Route to fetch all books
@app.route('/books', methods=['GET'])
def get_books():
    conn = get_db_connection()
    books = conn.execute('SELECT * FROM books').fetchall()
    conn.close()

    # Convert the query result to a list of dictionaries
    books_list = [{'id': book['book_id'], 'title': book['title'], 'author': book['author'], 'availableCopies': book['available_copies']} for book in books]

    return jsonify(books_list), 200

    
# Route to remove a book
@app.route('/removebook/<int:book_id>', methods=['DELETE'])
def remove_book(book_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete the book from the database
        cursor.execute('DELETE FROM books WHERE book_id = ?', (book_id,))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Book removed successfully'}), 200
    except Exception as e:
        print(f'Error removing book: {e}')
        return jsonify({'error': 'Error removing book'}), 500
    
    
# add members  
@app.route('/addmember', methods=['POST'])
def add_member():
    name = request.form.get('memberName')
    email = request.form.get('memberEmail')

    try:
        # Check if the email already exists in the database
        conn = get_db_connection()
        existing_member = conn.execute('SELECT * FROM members WHERE email = ?', (email,)).fetchone()
        
        if existing_member:
            conn.close()
            return jsonify({'error': 'Member with this email already exists'}), 409  # Conflict status
        
        # If email doesn't exist, proceed to add the member
        conn.execute('INSERT INTO members (name, email) VALUES (?, ?)', (name, email))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Member added successfully'}), 201

    except Exception as e:
        print(f'Error adding member: {e}')
        return jsonify({'error': 'Error adding member'}), 500




@app.route('/members', methods=['GET'])
def get_members():
    conn = get_db_connection()
    members = conn.execute('SELECT * FROM members').fetchall()
    conn.close()

    return jsonify([dict(row) for row in members]), 200

@app.route('/removemember/<int:member_id>', methods=['DELETE'])
def remove_member(member_id):
    conn = get_db_connection()
    try:
        conn.execute('DELETE FROM members WHERE member_id = ?', (member_id,))
        conn.commit()
        return jsonify({'message': 'Member removed successfully'}), 200
    except Exception as e:
        print(f'Error removing member: {e}')
        return jsonify({'error': 'Error removing member'}), 500
    finally:
        conn.close()


@app.route('/borrow', methods=['POST'])
def borrow_book():
    conn = get_db_connection()
    cursor = conn.cursor()
    data = request.get_json()
    member_id = data.get('member_id')
    book_id = data.get('book_id')
    borrow_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Check if member exists
    try:
        member = cursor.execute(
            'SELECT * FROM members WHERE member_id = ?', (member_id,)
        ).fetchone()
        if not member:
            return jsonify({"message": "Member ID not found"}), 404
    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({"message": "Invalid Member ID"}), 400

    # Check if book exists and is available (assuming a simple availability check)
    try:
        book = cursor.execute(
            'SELECT * FROM books WHERE book_id = ?', (book_id,)
        ).fetchone()
        if not book:
            return jsonify({"message": "Book ID not found"}), 404

        # Check if book is already borrowed (assuming a 'status' field for availability)
        borrowing_record = cursor.execute(
            'SELECT * FROM borrowing WHERE book_id = ? AND return_date IS NULL', (book_id,)
        ).fetchone()
        if borrowing_record:
            return jsonify({"message": "Book is already borrowed"}), 409

    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({"message": "Invalid Book ID"}), 400

    # Insert borrow record
    cursor.execute(
        "INSERT INTO borrowing (member_id, book_id, borrow_date) VALUES (?, ?, ?)",
        (member_id, book_id, borrow_date)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Book borrowed successfully"}), 201




@app.route('/return', methods=['POST'])
def return_book():
    conn = get_db_connection()
    cursor = conn.cursor()
    data = request.get_json()
    borrow_id = data.get('borrow_id')
    return_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    try:
        # Fetch the borrowing record and check if it's not already returned
        borrowing_record = cursor.execute(
            'SELECT borrow_date FROM borrowing WHERE borrow_id = ? AND return_date IS NULL', (borrow_id,)
        ).fetchone()

        if not borrowing_record:
            return jsonify({"message": "Invalid borrow ID or book already returned"}), 404

        borrow_date = borrowing_record['borrow_date']

        # Update the return date for the borrowing record
        cursor.execute(
            'UPDATE borrowing SET return_date = ? WHERE borrow_id = ?', (return_date, borrow_id)
        )
        conn.commit()

        # Calculate the late fee
        late_fee = calculate_late_fee(borrow_date, return_date)
        if not late_fee==0:
            conn.execute('insert into latefee(borrow_id,date,feeS) values(?,?,?)',(borrow_id,return_date,late_fee))
            conn.commit()
        return jsonify({
            "message": "Book returned successfully",
            "borrow_date": borrow_date,
            "return_date": return_date,
            "late_fee": late_fee
        }), 200

    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({"message": "Error processing return"}), 500

    finally:
        conn.close()
        


        
@app.route('/api/history', methods=['GET'])
def get_borrowing_history():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Query to retrieve borrowing history, including return dates
        cursor.execute('''
            SELECT borrow_id, member_id, book_id, borrow_date, return_date
            FROM borrowing
            ORDER BY borrow_date DESC
        ''')
        
        # Fetch all rows and convert them to a list of dictionaries
        history_records = cursor.fetchall()
        history_data = [dict(row) for row in history_records]

        return jsonify(history_data), 200

    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({"message": "Error retrieving borrowing history"}), 500

    finally:
        conn.close()
# borrowhistory
@app.route('/borrow-history', methods=['GET'])
def borrow_history():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM borrowing")
    borrow_history = cursor.fetchall()
    conn.close()

    return jsonify([dict(borrow) for borrow in borrow_history])
       

     

# Route to get borrowing statistics by month
@app.route('/api/borrowing-stats')
def borrowing_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query to get borrowing statistics by month
    cursor.execute("""
        SELECT strftime('%Y-%m', borrow_date) AS borrow_month, COUNT(*) AS borrow_count 
        FROM borrowing 
        GROUP BY borrow_month 
        ORDER BY borrow_month
    """)
    stats = cursor.fetchall()
    conn.close()

    # Prepare data in JSON format
    data = {
        "months": [row['borrow_month'] for row in stats],
        "counts": [row['borrow_count'] for row in stats]
    }
    return jsonify(data)

# Route to generate the borrowing chart using Matplotlib
@app.route('/generate_chart')
def generate_chart():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query to get borrowing statistics by month
    cursor.execute("""
        SELECT strftime('%Y-%m', borrow_date) AS borrow_month, COUNT(*) AS borrow_count 
        FROM borrowing 
        GROUP BY borrow_month 
        ORDER BY borrow_month
    """)
    stats = cursor.fetchall()
    conn.close()

    # Prepare data for the chart
    months = [row['borrow_month'] for row in stats]
    borrow_counts = [row['borrow_count'] for row in stats]

    # Create a bar chart using Matplotlib
    plt.bar(months, borrow_counts, color='skyblue')
    plt.title('Books Borrowed per Month')
    plt.xlabel('Months')
    plt.ylabel('Number of Books Borrowed')
    plt.xticks(rotation=45)
    plt.tight_layout()

    # Save the plot as an image in the static folder
    chart_path = os.path.join('static', 'charts', 'borrowed_books.png')
    plt.savefig(chart_path)
    plt.close()  # Close the plot to free up memory

    return render_template('history.html', chart_path=chart_path)
@app.route('/api/borrowing-history')
def borrowing_history():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query for borrowing history
    cursor.execute("""
        SELECT borrow_id, member_id, book_id, borrow_date, return_date 
        FROM borrowing 
        ORDER BY borrow_date DESC
    """)
    history = cursor.fetchall()
    conn.close()

    # Return the data in JSON format
    return jsonify(history)

# Route to serve the static chart image
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

# Route to get general stats about the library
@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    stats = {}
    try:
        # Query total books
        cursor.execute("SELECT COUNT(*) AS total_books FROM books")
        stats['total_books'] = cursor.fetchone()['total_books']

        # Query total members
        cursor.execute("SELECT COUNT(*) AS total_members FROM members")
        stats['total_members'] = cursor.fetchone()['total_members']

        # Query borrowed books (not returned)
        cursor.execute("SELECT COUNT(*) AS borrowed_books FROM borrowing WHERE return_date IS NULL")
        stats['borrowed_books'] = cursor.fetchone()['borrowed_books']

        # Query returned books
        cursor.execute("SELECT COUNT(*) AS returned_books FROM borrowing WHERE return_date IS NOT NULL")
        stats['returned_books'] = cursor.fetchone()['returned_books']

        return jsonify(stats), 200
    except Exception as e:
        print("Error fetching stats:", e)
        return jsonify({"error": "Failed to fetch stats"}), 500
    finally:
        conn.close()
        
@app.route('/feehistory', methods=['GET'])
def get_feehistory():
    conn = get_db_connection()
    fees = conn.execute('SELECT * FROM latefee').fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in fees]), 200

@app.route('/removehistory/<int:borrow_id>', methods=['DELETE'])
def remove_history(borrow_id):
    conn = get_db_connection()
    try:
        conn.execute('DELETE FROM latefee WHERE borrow_id = ?', (borrow_id,))
        conn.commit()
        return jsonify({'message': 'History removed successfully'}), 200
    except Exception as e:
        print(f'Error removing History: {e}')
        return jsonify({'error': 'Error removing History'}), 500
    finally:
        conn.close()
        
@app.route('/loginuser', methods=['POST'])
def loginuser():
    conn = get_db_connection()
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    # Basic validation
    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # # Check if the email exists in the database
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if user is None:
        conn.close()
        return jsonify({"message": "Invalid email or password."}), 401

    # # Verify the password
    stored_password_hash = user['password_hash']  # Assuming 'password' is the field storing hashed passwords
    if not check_password_hash(stored_password_hash, password):
        conn.close()
        return jsonify({"message": "Invalid email or password."}), 401

    # conn.close()
    return jsonify({"message": "Login successful."}), 200
if __name__ == '__main__':
    app.run(debug=True)

