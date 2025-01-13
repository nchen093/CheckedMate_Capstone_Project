from .db import db, environment, SCHEMA, add_prefix_for_prod, SchemaMixin
from sqlalchemy.orm import relationship
from datetime import datetime,timezone
from sqlalchemy import Enum
import enum

class PriorityEnum(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class CategoryEnum(str, enum.Enum):
    Personal = "Personal"
    Work = "Work"


class Task(db.Model, SchemaMixin):
    __tablename__ = 'tasks'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(
        db.Integer, 
        db.ForeignKey(add_prefix_for_prod('users.id'), ondelete='CASCADE'),
        nullable=False)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.Text, nullable=False)
    progress = db.Column(db.Integer, nullable=False, check=db.CheckConstraint('progress >= 0 and progress <= 100'))
    priority = db.Column(Enum(PriorityEnum), nullable=False) #Low, Medium, High
    category = db.Column(Enum(CategoryEnum), nullable=False) #Personal, Work
    start_time = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    end_time = db.Column(db.DateTime, default=None, nullable=True)


    def to_dict(self):
        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'title': self.title,
            'description': self.description,
            'progress': self.progress,
            'priority': self.priority.value,
            'category': self.category.value,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None
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




