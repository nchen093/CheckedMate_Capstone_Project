from app.models import db, Message, environment, SCHEMA
from datetime import datetime
from sqlalchemy.sql import text

def seed_messages():
    # Example: Messages between friends
    message1 = Message(
        text_message="Hey, are you free this weekend? Let's study code together!",
        sent_at=datetime.now(),
        sender_id=1,
        receiver_id=2,

    )
    message2 = Message(
        text_message="Great!, let's meet up on Zoom on weekend",
        sent_at=datetime.now(),
        sender_id=2,
        receiver_id=1,
 
    )
    message3 = Message(
        text_message="Sound Good",
        sent_at=datetime.now(),
        sender_id=1,
        receiver_id=2,

    )

    # Add the messages to the session
    db.session.add_all([message1, message2, message3])
    db.session.commit()


def undo_messages():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.messages RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM messages"))

    db.session.commit()