from flask import Blueprint, request, jsonify
from app.models import User, db
from app.forms import LoginForm, SignUpForm
from flask_login import current_user, login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash

auth_routes = Blueprint('auth', __name__)


@auth_routes.route('/')
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {'errors': {'message': 'Unauthorized'}}, 401


@auth_routes.route('/login', methods=['POST'])
def login():
    """
    Logs a user in
    """
    form = LoginForm()
    # Get the csrf_token from the request cookie and put it into the
    # form manually to validate_on_submit can be used
    form['csrf_token'].data = request.cookies['csrf_token']

    if not form.validate_on_submit():
        return form.errors, 401

    # Add the user to the session, we are logged in!
    user = User.query.filter(User.email == form.data["email"]).first()
    login_user(user)
    return user.to_dict()
    
@auth_routes.route('/logout')
def logout():
    """
    Logs a user out
    """
    logout_user()
    return {'message': 'User logged out'}


@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """
    Creates a new user and logs them in
    """
    form = SignUpForm()
    form['csrf_token'].data = request.cookies.get('csrf_token')

    if form.validate_on_submit():        
        user = User(
            username=form.data['username'],
            email=form.data['email'],
            password=form.data['password'],
        )

        # Hash the password before saving (if not already done in the form)
        user.password = generate_password_hash(user.password)

        # Save the user to the database
        db.session.add(user)
        db.session.commit()

        # Log the user in
        login_user(user)
        return user.to_dict()

    # Return form errors if validation fails
    return jsonify(form.errors), 401



@auth_routes.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json()
    user = current_user
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)

    db.session.commit()
    return jsonify(user.to_dict())

@auth_routes.route('/change-password', methods=['POST'])
@login_required
def changed_password():
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')

    if new_password != confirm_password:
        return jsonify({'error': "Password does not match!, Please try again!"}), 400
    
    if not check_password_hash(current_user.hashed_password, old_password):
        return jsonify({'error': 'Wrong passwrod. Try again!'}), 400
    
    current_user.hashed_password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({'message': 'Password updated successfully.'}), 200


@auth_routes.route('/unauthorized')
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    return {'errors': {'message': 'Unauthorized'}}, 401