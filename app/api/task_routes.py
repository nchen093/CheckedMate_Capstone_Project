from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import db, Task, Participant, Invitation
from datetime import datetime, timedelta, timezone
from sqlalchemy import or_

task_routes = Blueprint("tasks", __name__)


# Helper function to check for time conflicts
def has_time_conflict(
    user_id, start_time, end_time, category,task_id=None, 
):

    # Check for conflicts with the user's own schedule
    user_conflict = (
        db.session.query(Task)
        .join(Participant)
        .filter(
            Participant.user_id == user_id,
            Participant.status == "accepted",
            Task.start_time < end_time,
            Task.end_time > start_time,
            Task.id != task_id,  # Exclude the current task when editing
        )
        .count()
    )
    
    print(f"User conflicts: {user_conflict} (type: {type(user_conflict)})")


    # If the task is Personal, skip checking participant conflicts
    if category== 'Personal':
        participant_conflict = 0
    else:
        participant_conflict = (
            db.session.query(Task)
            .join(Participant)
            .filter(
                Participant.user_id
                != user_id,  # Check for participants other than the user
                Participant.status == "accepted",
                Task.start_time < end_time,
                Task.end_time > start_time,
                Task.id != task_id,
            )
            .count()
        )
        
        print(f"Participant conflicts: {participant_conflict} (type: {type(participant_conflict)})")

    return user_conflict > 0, participant_conflict > 0




# Get tasks for the logged-in user, either as a participant or as a owner
@task_routes.route("/", methods=["GET"])
@login_required
def get_tasks():
    tasks = Task.query.filter(
        or_(Task.owner_id == current_user.id, Task.participants.any(Participant.user_id == current_user.id))).all()
    
    return jsonify([task.to_dict() for task in tasks]), 200


@task_routes.route("/day", methods=["GET"])
@login_required
def get_tasks_for_day():
    date_str = request.args.get("date")
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    # Start of the current day
    start_of_day = datetime(date.year, date.month, date.day, 0, 0, 0)

    # End of the current day
    end_of_day = start_of_day + timedelta(days=1)

    # Query for tasks that start within today or end after today begins
    tasks = (
        db.session.query(Task)
        .join(Participant)
        .filter(
            Participant.user_id == current_user.id,
            Participant.status == "accepted",
            db.or_(
                # Case Tasks that start today and end today
                db.and_(
                    Task.start_time >= start_of_day, Task.start_time < end_of_day
                ),
                # Case 2: Overnight tasks that started before today but end today
                db.and_(
                    Task.start_time < start_of_day, Task.end_time >= start_of_day
                ),
            ),
        )
        .all()
    )

    return jsonify([task.to_dict() for task in tasks]), 200


@task_routes.route("/month", methods=["GET"])
@login_required
def get_tasks_for_month():
    try:
        year = int(request.args.get("year"))
        month = int(request.args.get("month"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid or missing year/month parameters."}), 400

    # Start of the month
    start_date = datetime(year, month, 1)

    # Calculate the end of the month
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    # Fetch tasks between start_date and end_date for the current user
    tasks = (
        db.session.query(Task)
        .join(Participant)
        .filter(
            Participant.user_id == current_user.id,
            Participant.status == "accepted",
            Task.start_time <= end_date,
            Task.start_time < end_date,
        )
        .all()
    )

    return jsonify([task.to_dict() for task in tasks]), 200



@task_routes.route("/add", methods=["POST"])
@login_required
def add_task():
    data = request.json

    title = data.get('title')
    description = data.get('description')
    priority = data.get('priority')
    category = data.get('category')
    progress = data.get('progress', 0)
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    

    # Validate required fields
    required_fields = ['title', 'description', 'category']
    if not all (field in data for field in required_fields):
        return jsonify({"error": "Missing required fields."}), 400

    # Validate start and end times
    try:
        start_time = datetime.fromisoformat(start_time).astimezone(timezone.utc)
        end_time = datetime.fromisoformat(end_time).astimezone(timezone.utc)
    except ValueError:
        return jsonify({"error": "Invalid date format."}), 400

    if start_time >= end_time:
        return jsonify({"error": "Start time must be before end time."}), 400
    
    # Validate priority and category_type
    valid_priorities = {'High', 'Medium', 'Low'}
    valid_categories = {'Work', 'Personal'}

    if priority not in valid_priorities:
        return jsonify({"error": "Invalid priority value."}), 400

    if category not in valid_categories:
        return jsonify({"error": "Invalid category value."}), 400

    # Check for time conflicts
    user_conflict, participant_conflict = has_time_conflict(
        current_user.id, start_time, end_time, category
    )

    if user_conflict:
        return jsonify({"error": "This task conflicts with your own schedule."}), 409

    if category != 'Personal' and participant_conflict:
        return jsonify(
            {"error": "This task conflicts with other participants' schedules."}
        ), 409
    

    # Validate progress value (should be between 0 and 100)
    if not (0 <= progress <= 100):
        return jsonify({"error": "Progress must be between 0 and 100."}), 400

    # Create the new task
    new_task = Task(
        title=title,
        start_time=start_time,
        end_time=end_time,
        description=description,
        priority = priority,
        category=category,
        progress=progress,
        owner_id=current_user.id,
    )

    # Category when user is picking Work and Add the current user as a participant

    if category == 'Work':
        participant = Participant(
            user_id=current_user.id,
            task_id=new_task.id,
            status='accepted'
        )
        db.session.add(participant)

    db.session.add(new_task)
    db.session.commit()
    
    return jsonify({"message": "Task added successfully!", "task": new_task.to_dict()}), 201

  



# Edit an task with conflict and validation checks
@task_routes.route("/edit/<int:task_id>", methods=["PUT"])
@login_required
def edit_task(task_id):
    data = request.json
    task = Task.query.get(task_id)

    if task is None:
        return jsonify({"error": "Task not found."}), 404

    if task.owner_id != current_user.id:
        return jsonify({"error": "Unauthorized."}), 403

    title = data.get("title", task.title)
    start_time = data.get("start_time", task.start_time)
    end_time = data.get("end_time", task.end_time)
    priority = data.get("priority", task.priority)
    category = data.get("category", task.category)
    progress = data.get("progress", task.progress)    


    # Validate start and end times
    try:
        start_time = datetime.fromisoformat(start_time)
        end_time = datetime.fromisoformat(end_time)
    except ValueError:
        return jsonify({"error": "Invalid date format."}), 400

    if start_time >= end_time:
        return jsonify({"error": "Start time must be before end time."}), 400

    # Check for time conflicts
    user_conflict, participant_conflict = has_time_conflict(
        current_user.id, start_time, end_time, category, task_id=task_id
    )

    if user_conflict:
        return jsonify({"error": "This task conflicts with your own schedule."}), 409

    if category != 'Personal' and participant_conflict:
        return jsonify(
            {"error": "This task conflicts with other participants' schedules."}
        ), 409

    # Update the task
    task.title = title
    task.start_time = start_time
    task.end_time = end_time
    task.priority = priority  
    task.category= category
    task.progress = progress  
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify(
        {"message": "Task updated successfully!", "task": task.to_dict()}
    ), 200


# Delete task
@task_routes.route("/delete/<int:task_id>", methods=["DELETE"])
@login_required
def delete_task(task_id):
    task = Task.query.get(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    # Check if the logged-in user is the owner
    if task.owner_id != current_user.id:
        return jsonify(
            {"error": "Unauthorized. Only the task owner can delete the task."}
        ), 403
    
    Participant.query.filter_by(task_id=task_id).delete()
    Invitation.query.filter_by(task_id=task_id).delete()
    

    # Delete the task
    db.session.delete(task)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    return jsonify({"message": "Task deleted successfully!"}), 200


# Remove participant if host
@task_routes.route(
    "/<int:task_id>/remove-participant/<int:participant_id>", methods=["DELETE"]
)
@login_required
def remove_participant(task_id, participant_id):
    task = Task.query.get(task_id)

    if task is None:
        return jsonify({"error": "Task not found"}), 404

    # Ensure the current user is the owner of the task
    if task.owner_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    # Prevent the task owner from removing themselves
    if task.owner_id == participant_id:
        return jsonify(
            {"error": "You cannot remove yourself as the owner of the task."}
        ), 403

    # Find the participant to remove
    participant = Participant.query.filter_by(
        task_id=task_id, user_id=participant_id
    ).first()

    if not participant:
        return jsonify({"error": "Participant not found"}), 404

    # Remove the participant
    db.session.delete(participant)

    # Also remove the corresponding invitation, if it exists
    invitation = Invitation.query.filter_by(
        task_id=task_id, invitee_id=participant_id
    ).first()
    if invitation:
        db.session.delete(invitation)

    db.session.commit()

    return jsonify(
        {"message": "Participant and corresponding invitation removed successfully!"}
    ), 200