from .db import db, environment, SCHEMA, add_prefix_for_prod
from sqlalchemy.orm import relationship
from datetime import datetime,timezone
from sqlalchemy import CheckConstraint
from sqlalchemy.sql import func





class Task(db.Model):
    __tablename__ = 'tasks'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA},
        CheckConstraint('progress >= 0 AND progress <= 100', name='check_progress_range'),  # Add progress check constraint
    else: 
        __table_args__ = (
            CheckConstraint('progress >= 0 AND progress <= 100', name='check_progress_range'),  # Add progress check constraint
     )

    

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(
        db.Integer, 
        db.ForeignKey(add_prefix_for_prod('users.id'), ondelete='CASCADE'),
        nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    progress = db.Column(db.Integer, nullable=False)
    priority = db.Column(db.String(10), nullable=False) #Low, Medium, High
    category = db.Column(db.String(10), nullable=False) #Personal, Work
    start_time = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    end_time = db.Column(db.DateTime, default=None, nullable=True)

    owner = db.relationship('User', back_populates='tasks')


    def to_dict(self):
        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'title': self.title,
            'description': self.description,
            'progress': self.progress,
            'priority': self.priority,
            'category': self.category,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,

        }
    
    def update_progress(self, progress):
        """update prgress and making sure the progress is between 0 and 100"""

        if progress < 0 or progress > 100:
            raise ValueError('Progress must be between 0 and 100.')
        self.progress = progress

    def complete_task(self):
       """avoding to have to record the task that already been done """

       if self.progress == 100:
           raise ValueError('Task has been complete already')
       self.progress = 100
       self.end_time=datetime.now(timezone.utc)




