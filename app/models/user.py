from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime,timezone
from .friend import Friend
from .message import Message



class User(db.Model, UserMixin):
    __tablename__ = 'users'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    hashed_password = db.Column(db.String(255), nullable=False)
    registered_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))


    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    

    friends = db.relationship('Friend', foreign_keys=[Friend.user_id], 
                              back_populates='user', cascade="all, delete-orphan",)
    
    friend_requests = db.relationship('Friend', foreign_keys=[Friend.friend_id], back_populates='friend', cascade="all, delete-orphan")
   
    messages_received = db.relationship('Message', foreign_keys=[Message.receiver_id], 
                                       back_populates='receiver',  cascade="all, delete-orphan",)
    
    messages_sent = db.relationship('Message', foreign_keys=[Message.sender_id], 
                                    back_populates= 'sender', cascade="all, delete-orphan", )
    
    tasks = db.relationship('Task', back_populates='owner', cascade='all, delete-orphan')
    
    

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'registered_at': self.registered_at,
    
        }
    


    
    

