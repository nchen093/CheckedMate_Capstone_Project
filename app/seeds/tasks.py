from app.models import db, User,Task, Participant, Friend, PriorityEnum, CategoryEnum, environment, SCHEMA
from sqlalchemy.sql import text
from datetime import datetime, timedelta

# Add task
def seed_tasks():
    users = User.query.all()
    
    if not users:
        print("No users available to assign tasks. Please seed users first.")
        return
    
    task1 = Task(
        title = 'Complete Back End',
        description = 'Develop the back end and successfully deploy on Render',
        progress = 70,
        priority=PriorityEnum.High,
        category=CategoryEnum.Work,
        start_time=datetime.now() + timedelta(weeks=4),
        end_time= datetime.now() + timedelta(weeks=4) + timedelta(hours=5),
        owner_id=users[0].id,
    )

    task2 = Task(
        title = 'Complete Capstone Project',
        description = 'Develop a 2 full CRUDS and 2 partially CRUDS',
        progress = 30,
        priority=PriorityEnum.High,
        category=CategoryEnum.Work,
        start_time=datetime.now() + timedelta(weeks=4) + timedelta(days=1),
        end_time=datetime.now() + timedelta(weeks=4) + timedelta(days=1, hours=3),
        owner_id=users[1].id
    )

    db.session.add_all([task1, task2])
    db.session.commit()

def add_participants(task_id, participants_id, owner_id):
    if isinstance(participants_id, int):
        participants_id = [participants_id]

    for participant_id in participants_id:
        if are_friends_with_someone_in_task(owner_id, participant_id):
            new_participant = Participant(task_id=task_id, user_id=participant_id, status='pending')
            db.session.add(new_participant)
        else:
         print(f"User {participant_id} is not allowed to join the task.")
    
def are_friends_with_someone_in_task(user_id, friend_id):
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
        db.session.execute(f"TRUNCATE table {SCHEMA}.tasks RESTART IDENTITY CASCADE;")
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.participants RESTART IDENTITY CASCADE;"
        )
        
    else:
        db.session.execute(text("DELETE FROM tasks"))
        db.session.execute(text("DELETE FROM participants"))
    db.session.commit()
