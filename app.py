from flask import Flask, render_template, request, redirect, url_for, flash
from flask_graphql import GraphQLView
from backend.schema import schema
# from .schema import schema
app = Flask(__name__)

app.secret_key = 'your_secret_key'  # Replace with a strong secret key

# Replace this with your actual user authentication logic
def authenticate(username, password):
    if username == 'your_username' and password == 'your_password':
        return True
    return False

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    if authenticate(username, password):
        flash('Login successful!', 'success')
        return redirect(url_for('dashboard'))
    else:
        flash('Login failed. Please check your credentials.', 'danger')
        return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    return 'Welcome to the Dashboard'

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True  # This enables the in-browser IDE. Set to False if you don't want this.
    )
)

if __name__ == '__main__':
    app.run(debug=True)