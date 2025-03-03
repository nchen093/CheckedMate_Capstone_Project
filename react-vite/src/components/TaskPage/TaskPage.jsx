import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, deleteTask } from "../../redux/tasks";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import { useModal } from "../../context/Modal";
import * as FaIcons from "react-icons/fa";
import TaskForm from "./TaskForm";
import "./TaskPage.css";

const TaskPage = () => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const currentUser = useSelector((state) => state.session.user);
  const tasks = useSelector((state) => state.tasks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      // console.log("Fetching tasks for user:", currentUser.id); // Debugging
      dispatch(fetchTasks())
        .then(() => console.log("Tasks fetched successfully")) // Debugging
        .catch((error) => console.error("Failed to fetch tasks:", error)) // Debugging
        .finally(() => setLoading(false));
    }
  }, [dispatch, currentUser]);

  if (loading) {
    return (
      <div className="loading">
        <FaIcons.FaTruckLoading className="truck-driving" />
      </div>
    );
  }

  // Filter tasks based on the current user
  const userTasks = tasks.filter(
    (task) => task?.owner_id === Number(currentUser.id)
  );

  const today = new Date();

  // Separate upcoming, past, and ongoing tasks
  const upcomingTasks = userTasks.filter(
    (task) => new Date(task.start_time) > today
  );
  const pastTasks = userTasks.filter((task) => {
    const end = task.end_time ? new Date(task.end_time) : null;
    return end && end < today;
  });

  const ongoingTasks = userTasks.filter((task) => {
    const start = new Date(task.start_time);
    const end = task.end_time ? new Date(task.end_time) : null;
    return start <= today && (!end || end >= today);
  });

  const handleDelete = async (taskId) => {
    try {
      const response = await dispatch(deleteTask(taskId));

      // Check if the response exists and contains an error
      if (response?.error) {
        alert(response.error, "error");
      } else {
        alert("Task deleted successfully", "success");

        // After deletion, re-fetch tasks to update the UI
        dispatch(fetchTasks());
      }
    } catch (error) {
      alert("An unexpected error occurred while deleting the task", "error");
    }
  };

  return (
    <div className="event-history-container">
      <h2 className="event-history-title">
        {`${currentUser.username}'s Task History`}
      </h2>
      <OpenModalButton
        buttonText={
          <div className="create-button">
            <FaIcons.FaPlus />
            Add Task
          </div>
        }
        modalComponent={
          <TaskForm formType="Add Task" onModalClose={closeModal} />
        }
      />
      <div>
        <h3 className="section-title">Ongoing Tasks</h3>
        <ul className="event-list">
          {ongoingTasks.length > 0 ? (
            ongoingTasks.map((task) => (
              <li key={task.id} className="event-item">
                <div className="card">
                  <h3 className="event-title">{task.title}</h3>
                  <p className="event-details">
                    <strong>Start Time:</strong>{" "}
                    {new Date(task.start_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>End Time:</strong>{" "}
                    {new Date(task.end_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>Progress:</strong> {Math.round(task.progress)}%
                  </p>
                  <p className="event-details">
                    <strong>Priority:</strong> {task.priority}
                  </p>
                  <p className="event-details">
                    <strong> Category:</strong> {task.category}
                  </p>
                  <div className="button-group">
                    <OpenModalButton
                      buttonText={
                        <div className="edit-button">
                          <FaIcons.FaPen />
                          Edit Task
                        </div>
                      }
                      modalComponent={
                        <TaskForm
                          task={task}
                          formType="Edit Task"
                          onModalClose={closeModal}
                        />
                      }
                    />
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(task.id)}
                    >
                      <FaIcons.FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p className="inactive">No ongoing tasks.</p>
          )}
        </ul>
      </div>

      <div className="upcoming-events">
        <h3 className="section-title">Upcoming Tasks</h3>
        <ul className="event-list">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <li key={task.id} className="event-item">
                <div className="card">
                  <h3 className="event-title">{task.title}</h3>
                  <p className="event-details">
                    <strong>Start Time:</strong>{" "}
                    {new Date(task.start_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>End Time:</strong>{" "}
                    {new Date(task.end_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>Progress:</strong> {Math.round(task.progress)}%
                  </p>
                  <p className="event-details">
                    <strong>Priority:</strong> {task.priority}
                  </p>
                  <p className="event-details">
                    <strong> Category:</strong> {task.category}
                  </p>
                  <div className="button-group">
                    <OpenModalButton
                      buttonText={
                        <div className="edit-button">
                          <FaIcons.FaPen />
                          Edit Task
                        </div>
                      }
                      modalComponent={
                        <TaskForm
                          task={task}
                          formType="Edit Task"
                          onModalClose={closeModal}
                        />
                      }
                    />
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(task.id)}
                    >
                      <FaIcons.FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p className="inactive">No upcoming tasks.</p>
          )}
        </ul>
      </div>

      <div className="past-events">
        <h3 className="section-title">Completed Tasks</h3>
        <ul className="event-list">
          {pastTasks.length > 0 ? (
            pastTasks.map((task) => (
              <li key={task.id} className="event-item">
                <div className="card">
                  <h3 className="event-title">{task.title}</h3>
                  <p className="event-details">
                    <strong>Start Time:</strong>{" "}
                    {new Date(task.start_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>End Time:</strong>{" "}
                    {new Date(task.end_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>Progress:</strong> {Math.round(task.progress)}%
                  </p>
                  <p className="event-details">
                    <strong>Priority:</strong> {task.priority}
                  </p>
                  <p className="event-details">
                    <strong> Category:</strong> {task.category}
                  </p>
                  <div className="button-group">
                    <OpenModalButton
                      buttonText={
                        <div className="edit-button">
                          <FaIcons.FaPen />
                          Edit Task
                        </div>
                      }
                      modalComponent={
                        <TaskForm
                          task={task}
                          formType="Edit Task"
                          onModalClose={closeModal}
                        />
                      }
                    />
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(task.id)}
                    >
                      <FaIcons.FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p className="inactive">No past tasks.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TaskPage;
