from app.models import db, Task, Participant, Friend, environment, SCHEMA
from sqlalchemy.sql import text

# Add task
def seed_tasks():
