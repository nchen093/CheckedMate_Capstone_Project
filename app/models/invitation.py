from .db import db, SCHEMA, environment, add_prefix_for_prod
from sqlalchemy.orm import relationship
from .task import Task
from .participant import Participant
from datetime import datetime


class Invitation(db.Model):
    __tablename__ = "invitations"

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}
    
    id = db.Column(db.Integer, primary_key=True)
    inviter_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    invitee_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('tasks.id')), nullable=False)
    status = db.Column(db.String(50), default='pending')

    task = db.relationship('Task', back_populates='invitations')
    inviter = db.relationship('User', foreign_keys=[inviter_id])
    invitee = db.relationship('User', foreign_keys=[invitee_id])


    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'task_title': self.task.title,
            'task_start_time': self.task.start_time.isoformat() if self.task.start_time else None,
            'task_end_time': self.task.end_time.isoformat() if self.task.end_time else None,
            'task_progress': self.task.progress,
            'task_category': self.task.category.value,
            'status': self.status,
            'inviter_id': self.inviter_id,
            'invitee_id': self.invitee_id,
            'inviter_name': self.inviter.username if self.inviter else None,
            'invitee_name': self.invitee.username if self.invitee else None,
        }
    @classmethod
    def check_time_conflict_for_invitee(cls, invitee_id, start_time, end_time):
        conflicts = (db.session.query(Task)
                     .join(Participant)
                     .filter(Participant.user_id == invitee_id,
                             Participant.status == 'accepted',
                             Task.start_time < end_time,
                             Task.end_time > start_time,).count())
        return conflicts > 0
