from .db import db, environment, SCHEMA, add_prefix_for_prod
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from sqlalchemy.sql import func

class Message(db.Model):
    __tablename__ = "messages"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}
    
    id = db.Column(db.Integer, primary_key=True)
    receiver_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    sender_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    text_message = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    
    receiver = db.relationship(
        "User", foreign_keys=[receiver_id], back_populates="messages_received"
    )
    sender = db.relationship(
        "User", foreign_keys=[sender_id], back_populates="messages_sent"
    )

    def to_dict(self):
        return {
            'id': self.id,
            'receiver_id': self.receiver_id,
            'sender_id': self.sender_id,
            'text_message': self.text_message,
            'sent_at': self.sent_at.isoformat()
        }
