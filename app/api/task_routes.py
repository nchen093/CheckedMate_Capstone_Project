from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import db, Task
from datetime import datetime, timedelta, timezone
from sqlalchemy import or_, and_

task_routes = Blueprint("tasks", __name__)


# Helper function to check for time conflicts
def has_time_conflict(user_id, start_time, end_time, task_id=None):
    # Check for conflicts with the user's own schedule
    query = db.session.query(Task).filter(
        Task.owner_id == user_id,
        Task.start_time < end_time,
        Task.end_time > start_time,
    )
    if task_id is not None:
        query = query.filter(Task.id != task_id)
    user_conflict = query.count()
    return user_conflict > 0


# Get tasks for the logged-in user
@task_routes.route("/", methods=["GET"])
@login_required
def get_tasks():
    tasks = Task.query.filter(Task.owner_id == current_user.id).all()
    return jsonify([task.to_dict() for task in tasks]), 200


@task_routes.route("/day", methods=["GET"])
@login_required
def get_tasks_for_day():
    date_str = request.args.get("date")
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    start_of_day = datetime(date.year, date.month, date.day, 0, 0, 0)
    end_of_day = start_of_day + timedelta(days=1)

    tasks = (
        db.session.query(Task)
        .filter(
            Task.owner_id == current_user.id,
            or_(
                and_(
                    Task.start_time >= start_of_day,
                    Task.start_time < end_of_day,
                ),
                and_(
                    Task.start_time < start_of_day,
                    Task.end_time >= start_of_day,
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

    start_date = datetime(year, month, 1)
    end_date = (
        datetime(year + 1, 1, 1)
        if month == 12
        else datetime(year, month + 1, 1)
    )

    tasks = (
        db.session.query(Task)
        .filter(
            Task.owner_id == current_user.id,
            Task.start_time < end_date,
            Task.end_time > start_date,
        )
        .all()
    )

    return jsonify([task.to_dict() for task in tasks]), 200


@task_routes.route("/add", methods=["POST"])
@login_required
def add_task():
    data = request.json

    required_fields = ['title', 'description', 'category']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields."}), 400

    try:
        start_time = datetime.fromisoformat(data['start_time']).astimezone(timezone.utc)
        end_time = datetime.fromisoformat(data['end_time']).astimezone(timezone.utc)
    except KeyError:
        return jsonify({"error": "Missing start_time or end_time."}), 400
    except ValueError:
        return jsonify({"error": "Invalid date format."}), 400

    if start_time >= end_time:
        return jsonify({"error": "Start time must be before end time."}), 400

    valid_priorities = {'High', 'Medium', 'Low'}
    valid_categories = {'Work', 'Personal'}

    priority = data.get('priority', 'Medium')
    category = data['category']
    progress = data.get('progress', 0)

    if priority not in valid_priorities:
        return jsonify({"error": "Invalid priority value."}), 400
    if category not in valid_categories:
        return jsonify({"error": "Invalid category value."}), 400
    if not (0 <= progress <= 100):
        return jsonify({"error": "Progress must be between 0 and 100."}), 400

    if has_time_conflict(current_user.id, start_time, end_time):
        return jsonify({"error": "This task conflicts with your schedule."}), 409

    new_task = Task(
        title=data['title'],
        description=data['description'],
        priority=priority,
        category=category,
        progress=progress,
        start_time=start_time,
        end_time=end_time,
        owner_id=current_user.id,
    )

    db.session.add(new_task)
    db.session.commit()
    return jsonify({"message": "Task added!", "task": new_task.to_dict()}), 201


@task_routes.route("/edit/<int:task_id>", methods=["PUT"])
@login_required
def edit_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found."}), 404
    if task.owner_id != current_user.id:
        return jsonify({"error": "Unauthorized."}), 403

    data = request.json

    # Parse start_time and end_time if provided
    start_time = task.start_time
    if 'start_time' in data:
        try:
            start_time = datetime.fromisoformat(data['start_time']).astimezone(timezone.utc)
        except ValueError:
            return jsonify({"error": "Invalid start_time format."}), 400

    end_time = task.end_time
    if 'end_time' in data:
        try:
            end_time = datetime.fromisoformat(data['end_time']).astimezone(timezone.utc)
        except ValueError:
            return jsonify({"error": "Invalid end_time format."}), 400

    if start_time >= end_time:
        return jsonify({"error": "Start time must be before end time."}), 400

    # Check for conflicts
    if has_time_conflict(current_user.id, start_time, end_time, task_id=task_id):
        return jsonify({"error": "This task conflicts with your schedule."}), 409

    # Update task details
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.priority = data.get('priority', task.priority)
    task.category = data.get('category', task.category)
    task.progress = data.get('progress', task.progress)
    task.start_time = start_time
    task.end_time = end_time

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Task updated!", "task": task.to_dict()}), 200


@task_routes.route("/delete/<int:task_id>", methods=["DELETE"])
@login_required
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    if task.owner_id != current_user.id:
        return jsonify({"error": "Unauthorized."}), 403

    db.session.delete(task)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    return jsonify({"message": "Task deleted!"}), 200