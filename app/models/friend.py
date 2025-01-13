from .db import db, environment, SCHEMA, add_prefix_for_prod, SchemaMixin
from sqlalchemy.orm import relationship

class Friend(db.Model, SchemaMixin):
    __tablename__ = 'friends'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey(add_prefix_for_prod('users.id'), ondelete='CASCADE'),
        nullable=False)
    friend_id = db.Column(
        db.Integer, 
        db.ForeignKey(add_prefix_for_prod('users.id'), ondelete='CASCADE'),
        nullable=False)
    is_accepted = db.Column(db.Boolean, default=False)

    user = db.relationship('User', foreign_keys=[user_id], back_populates='friends')
    friend = db.relationship('User', foreign_keys=[user_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'friend_id': self.friend_id,
            'is_accepted': self.is_accepted,
        }