from .db import db, SCHEMA, environment, add_prefix_for_prod
from sqlalchemy.orm import relationship
from sqlalchemy import Enum
import enum

class StatusEnum(str, enum.Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    DECLINED = 'Declined'

class Participant(db.Model):
    __tablename__ = "participants"

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('tasks.id')))
    status= db.Column(Enum(StatusEnum), nullable=False)

    task = db.relationship('Task', back_populates='participants')
    user = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username
            if self.user
            else None,
            'task_id': self.task_id,
            'status': self.status
        }