from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import db, Task, Participant, Invitation,CategoryEnum,PriorityEnum
from datetime import datetime, timedelta

task_routes = Blueprint("tasks", __name__)


# Helper function to check for time conflicts
def has_time_conflict(
    user_id, start_time, end_time, task_id=None, CategoryEnum=CategoryEnum
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
            Task.id != task_id,  # Exclude the current event when editing
        )
        .count()
    )

    # If the task is Personal, skip checking participant conflicts
    if CategoryEnum == CategoryEnum.Personal:
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

    return user_conflict > 0, participant_conflict > 0


# Get tasks for the logged-in user, either as a participant or as a owner
@task_routes.route("/", methods=["GET"])
@login_required
def get_tasks():
    tasks = (
        db.session.query(Task)
        .join(Participant)
        .filter(
            Participant.user_id == current_user.id, Participant.status == "accepted"
        )
        .all()
    )

    # Print statements for debugging
    print(f"User ID: {current_user.id}")
    print(f"Tasks for User: {[task.title for task in tasks]}")

    return jsonify([task.to_dict() for task in tasks]), 200


@task_routes.route("/tasks/day", methods=["GET"])
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
                # Case 1: Events that start today and end today
                db.and_(
                    Task.start_time >= start_of_day, Task.start_time < end_of_day
                ),
                # Case 2: Overnight events that started before today but end today
                db.and_(
                    Task.start_time < start_of_day, Task.end_time >= start_of_day
                ),
            ),
        )
        .all()
    )

    return jsonify([task.to_dict() for task in tasks]), 200


@task_routes.route("/tasks/month", methods=["GET"])
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
            Task.start_time >= start_date,
            Task.start_time < end_date,
        )
        .all()
    )

    return jsonify([event.to_dict() for event in tasks]), 200


# Add an tasks with conflict and CategoryEnum checks
@task_routes.route("/add", methods=["POST"])
@login_required
def add_event():
    data = request.json

    title = data.get("title")
    priority = data.get('priority')
    description=data.get('description')
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    progress = data.get("progress", 0)
    category_type= data.get("category")

    # Validate required fields
    if not title or not start_time or not end_time:
        return jsonify(
            {"error": "Title, start time, and end time are required fields."}
        ), 400

    # Validate start and end times
    try:
        start_time = datetime.fromisoformat(start_time)
        end_time = datetime.fromisoformat(end_time)
    except ValueError:
        return jsonify({"error": "Invalid date format."}), 400

    if start_time >= end_time:
        return jsonify({"error": "Start time must be before end time."}), 400
    
        # Validate priority and category_type
    if priority not in [e.value for e in PriorityEnum]:
        return jsonify({"error": "Invalid priority value."}), 400

    if category_type not in [e.value for e in CategoryEnum]:
        return jsonify({"error": "Invalid category value."}), 400

    # Check for time conflicts
    user_conflict, participant_conflict = has_time_conflict(
        current_user.id, start_time, end_time, category_type=category_type.value
    )

    if user_conflict:
        return jsonify({"error": "This event conflicts with your own schedule."}), 409

    if category_type == category_type.Personal and participant_conflict:
        return jsonify(
            {"error": "This task conflicts with other participants' schedules."}
        ), 409
    

    # Validate progress value (should be between 0 and 100)
    if not (0 <= progress <= 100):
        return jsonify({"error": "Progress must be between 0 and 100."}), 400

    # Create the new event
    new_task = Task(
        title=title,
        start_time=start_time,
        end_time=end_time,
        description=description,
        priority = PriorityEnum[priority],
        category_type=CategoryEnum[category_type],
        progress=progress,
        owner_id=current_user.id,
    )

    db.session.add(new_task)
    db.session.commit()

    # Add the current user as a participant
    participant = Participant(
        user_id=current_user.id, task_id=new_task.id, status="accepted"
    )
    db.session.add(participant)
    db.session.commit()

    return jsonify(
        {"message": "Task added successfully!", "event": new_task.to_dict()}
    ), 201


# Edit an event with conflict and validation checks
@task_routes.route("/edit/<int:task_id>", methods=["PUT"])
@login_required
def edit_event(task_id):
    data = request.json
    task = Task.query.get(task_id)

    if task is None:
        return jsonify({"error": "Task not found."}), 404

    if task.owner_id != current_user.id:
        return jsonify({"error": "Unauthorized."}), 403

    title = data.get("title", task.title)
    start_time = data.get("start_time", task.start_time)
    end_time = data.get("end_time", task.end_time)
    priority = data.get("priority", task.priority.value)
    category_type = data.get("category", task.category.value)
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
        current_user.id, start_time, end_time, task_id, category_type=category_type
    )

    if user_conflict:
        return jsonify({"error": "This task conflicts with your own schedule."}), 409

    if category_type == category_type.Personal and participant_conflict:
        return jsonify(
            {"error": "This task conflicts with other participants' schedules."}
        ), 409

    # Update the task
    task.title = title
    task.start_time = start_time
    task.end_time = end_time
    task.priority = PriorityEnum[priority]  # Update with Enum value
    task.category = CategoryEnum[category_type]  # Update with Enum value
    task.progress = progress  
    
    db.session.commit()

    return jsonify(
        {"message": "Task updated successfully!", "task": task.to_dict()}
    ), 200


# Delete event
@task_routes.route("/delete/<int:task_id>", methods=["DELETE"])
@login_required
def delete_event(task_id):
    task = Task.query.get(task_id)

    if task is None:
        return jsonify({"error": "Task not found"}), 404

    # Check if the logged-in user is the creator
    if task.owner_id != current_user.id:
        return jsonify(
            {"error": "Unauthorized. Only the task owner can delete the task."}
        ), 403

    # Delete the event
    db.session.delete(task)
    db.session.commit()

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

    # Ensure the current user is the creator of the event
    if task.owner_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    # Prevent the event creator from removing themselves
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