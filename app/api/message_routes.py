from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Message, User, Friend
from datetime import datetime

messages_routes = Blueprint("messages", __name__)


# Route to send a message
@messages_routes.route("/", methods=["POST"])
@login_required
def send_message():
    data = request.get_json()
    text_message = data.get("message")
    friend_id = data.get("receiver_id")  # This is the friend's id, not just any user

    # Validation: Ensure content and recipient_id are provided
    if not text_message or not friend_id:
        return jsonify({"error": "Content and receiver_id are required."}), 400

    # Check if the friend relationship exists in either direction
    friend_relationship = Friend.query.filter(
        (
            (Friend.user_id == current_user.id)
            & (Friend.friend_id == friend_id)
            & (Friend.is_accepted == True)
        )
        | (
            (Friend.user_id == friend_id)
            & (Friend.friend_id == current_user.id)
            & (Friend.is_accepted == True)
        )
    ).first()

    if not friend_relationship:
        return jsonify({"error": "Receiver is not your friend."}), 403

    # Create and store the message
    new_message = Message(
        text_message=text_message,
        sender_id=current_user.id,
        receiver_id=friend_id,
        sent_at=datetime.utcnow(),
    )

    db.session.add(new_message)
    db.session.commit()

    return jsonify(new_message.to_dict()), 201


# Route to clear all messages between the current user and a friend
@messages_routes.route("/clear/<int:friend_id>", methods=["DELETE"])
@login_required
def clear_chat_history(friend_id):
    # Check if the friend relationship exists
    friend_relationship = Friend.query.filter(
        (
            (Friend.user_id == current_user.id)
            & (Friend.friend_id == friend_id)
            & (Friend.is_accepted == True)
        )
        | (
            (Friend.user_id == friend_id)
            & (Friend.friend_id == current_user.id)
            & (Friend.is_accepted == True)
        )
    ).first()

    if not friend_relationship:
        return jsonify({"error": "No friendship found."}), 403

    # Delete all messages between the current user and the friend
    Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == friend_id))
        | ((Message.sender_id == friend_id) & (Message.receiver_id == current_user.id))
    ).delete()

    db.session.commit()

    return jsonify({"message": "Chat history cleared successfully"}), 200


# Route to delete a single message
@messages_routes.route("/<int:message_id>", methods=["DELETE"])
@login_required
def delete_message(message_id):
    # Query the message by ID
    message = Message.query.get(message_id)

    # Check if the message exists and is either sent or received by the current user
    if not message or (
        message.sender_id != current_user.id and message.receiver_id != current_user.id
    ):
        return jsonify({"error": "Message not found or unauthorized"}), 404

    # Delete the message
    db.session.delete(message)
    db.session.commit()

    return jsonify({"message": "Message deleted successfully"}), 200


# Route to retrieve all messages between the current user and a friend
@messages_routes.route("/<int:friend_id>", methods=["GET"])
@login_required
def get_messages(friend_id):
    # Check if the friend relationship exists
    friend_relationship = Friend.query.filter(
        (
            (Friend.user_id == current_user.id)
            & (Friend.friend_id == friend_id)
            & (Friend.is_accepted == True)
        )
        | (
            (Friend.user_id == friend_id)
            & (Friend.friend_id == current_user.id)
            & (Friend.is_accepted == True)
        )
    ).first()
    if not friend_relationship:
        return jsonify({"error": "No friendship found."}), 403

    # Query the messages between the current user and the friend
    messages = (
        Message.query.filter(
            (
                (Message.sender_id == current_user.id)
                & (Message.receiver_id == friend_id)
            )
            | (
                (Message.sender_id == friend_id)
                & (Message.receiver_id == current_user.id)
            )
        )
        .order_by(Message.sent_at.asc())
        .all()
    )

    # Return the messages in JSON format
    return jsonify([message.to_dict() for message in messages]), 200