from app.models import db, Task, Participant, Friend, environment, SCHEMA
from datetime import datetime, timedelta
from sqlalchemy.sql import text


def seed_tasks():
    # Create the events
    task1 = Task(
        title="Finish Backend",
        description = 'Finish all routes',
        progress = 70,
        priority = 'High',
        category = 'Work',
        start_time=datetime.utcnow(),
        end_time=datetime.utcnow() + timedelta(weeks=4) + timedelta(hours=3),
        owner_id=1,  
    )
    task2 = Task(
        title="Finish FrontEnd",
        description = 'Make sure all features are working at the production',
        progress = 70,
        priority = 'High',
        category = 'Work',
        start_time=datetime.utcnow() + timedelta(weeks=4),
        end_time=datetime.utcnow() + timedelta(weeks=4) + timedelta(hours=3),
        owner_id=1, 
    )

    # Add events to the session
    db.session.add_all([task1, task2])
    db.session.commit()


def add_participants(event_id, participant_ids, creator_id):
    # Check if participant_ids is an integer, and convert it to a list
    if isinstance(participant_ids, int):
        participant_ids = [participant_ids]

    for participant_id in participant_ids:
        if are_friends_with_someone_in_event(creator_id, participant_id):
            new_participant = Participant(
                task_id=event_id, user_id=participant_id, status="pending"
            )
            db.session.add(new_participant)
        else:
            print(f"User {participant_id} is not allowed to join the task.")


def are_friends_with_someone_in_event(user_id, friend_id):
    # Make sure user_id and friend_id are single values
    if isinstance(user_id, list):
        user_id = user_id[0]
    if isinstance(friend_id, list):
        friend_id = friend_id[0]

    friendship = Friend.query.filter(
        (Friend.user_id == user_id) & (Friend.friend_id == friend_id)
        | (Friend.user_id == friend_id) & (Friend.friend_id == user_id),
        Friend.accepted == True,
    ).first()

    return friendship is not None


def undo_tasks():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.events RESTART IDENTITY CASCADE;")
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.participants RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM tasks"))
        db.session.execute(text("DELETE FROM participants"))
    db.session.commit()