import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/Modal";
import { createTask, editTask } from "../../redux/tasks";
import "./TaskForm.css";

const TaskForm = ({ task, formType, onModalClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [start_time, setStart_time] = useState("");
  const [end_time, setEnd_time] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  const [errors, setError] = useState({});

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setProgress(task.progress || "");
      setStart_time(task.start_time || "");
      setEnd_time(task.end_time || "");
      setCategory(task.category || "");
      setPriority(task.priority || "");
    }
  }, [task]);

  const validateForm = () => {
    let error = {};

    if (!title) error.title = "Title is required";
    if (!description) error.description = "Description is required";
    if (!start_time) error.start_time = "Start Time is required";
    if (!end_time) error.end_time = "End Time is required";
    if (!category) error.category = "Category is required";
    if (!priority) error.priority = "Priority is required";
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (formErrors && Object.values(formErrors).length > 0) {
      setError(formErrors);
      return;
    }

    setError({});

    const newTask = {
      ...task,
      title,
      description,
      progress,
      start_time,
      end_time,
      category,
      priority,
    };

    let response;
    if (formType === "Edit Task") {
      response = await dispatch(editTask(task.id, newTask));
    } else if (formType === "Add Task") {
      response = await dispatch(createTask(newTask));
    }

    onModalClose();
    closeModal();

    if (response) {
      navigate("/dashboard"); // Navigate to tasks list page after successful task creation or editing
    }
  };

  return (
    <div className="task-container">
      <h2 className="task-title">{formType}</h2>
      <form className="task-form" onSubmit={handleSubmit}>
        <label className="label-name">
          Title:
          <input
            className="task-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {errors.title && <span className="error">{errors.title}</span>}
        </label>
        <label className="label-name">
          Description:
          <textarea
            className="task-input"
            value={description}
            placeholder="Leave your description here..."
            onChange={(e) => setDescription(e.target.value)}
            style={{ minWidth: "200px", minHeight: "200px" }}
            required
          />
          {errors.description && (
            <span className="error">{errors.description}</span>
          )}
        </label>
        <label className="label-name">
          Progress:
          <input
            className="task-input"
            type="number"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            min="0"
            max="100"
            step="1"
            required
          />
          %
        </label>
        <label className="label-name">
          Start Time:
          <input
            className="task-input"
            type="datetime-local"
            value={start_time}
            onChange={(e) => setStart_time(e.target.value)}
            required
          />
          {errors.start_time && (
            <span className="error">{errors.start_time}</span>
          )}
        </label>
        <label className="label-name">
          End Time:
          <input
            className="task-input"
            type="datetime-local"
            value={end_time}
            onChange={(e) => setEnd_time(e.target.value)}
            required
          />
          {errors.end_time && <span className="error">{errors.end_time}</span>}
        </label>
        <label className="label-name">
          Category:
          <select
            className="task-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a Category</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
          </select>
          {errors.category && <span className="error">{errors.category}</span>}
        </label>
        <label className="label-name">
          Priority:
          <select
            className="task-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          {errors.priority && <span className="error">{errors.priority}</span>}
        </label>
        <button className="edit-button" type="submit">
          {formType} Task
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
