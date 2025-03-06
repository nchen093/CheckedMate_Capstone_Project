import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as FaIcons from "react-icons/fa";
import TaskForm from "../TaskPage/TaskForm";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import { fetchTasks, deleteTask } from "../../redux/tasks";
import "./CalendarPage.css";

const TaskList = ({
  selectedDay,
  tasksForDay,
  handleEditTask,
  handleDeleteTask,
}) => (
  <div className="task-list">
    <h3>Tasks for {selectedDay}</h3>
    {tasksForDay.length === 0 ? (
      <div>No tasks for this day</div>
    ) : (
      tasksForDay.map((task) => (
        <div key={task.id} className="task-item">
          <div className="task-title">{task.title}</div>
          <div className="task-actions">
            <OpenModalButton
              buttonText={
                <>
                  <FaIcons.FaPen />
                  Edit
                </>
              }
              modalComponent={
                <TaskForm
                  task={task}
                  formType="Edit Task"
                  onModalClose={() => handleEditTask(null)}
                />
              }
              className="edit-button"
            />
            <button
              className="delete-button"
              onClick={() => handleDeleteTask(task.id)}
            >
              <FaIcons.FaTrash />
              Delete
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);

const CalendarPage = () => {
  const dispatch = useDispatch();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthsOfYear = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalKey, setModalKey] = useState(0);

  const tasks = useSelector((state) => state.tasks);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const normalizeDate = (dateString) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Month navigation functions
  const preMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
  };

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleDayClick = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await dispatch(deleteTask(taskId));
      dispatch(fetchTasks());
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setModalKey((prev) => prev + 1);
  };

  const closeModal = () => {
    setSelectedTask(null);
    dispatch(fetchTasks());
  };

  const tasksForSelectedDay = tasks.filter(
    (task) =>
      normalizeDate(task.start_time).getTime() ===
      normalizeDate(selectedDate).getTime()
  );

  return (
    <div className="calendar-app">
      <div className="calendar">
        <h1 className="heading">Calendar</h1>
        <div className="navigate-date">
          <h2 className="month">{monthsOfYear[currentMonth]},</h2>
          <h2 className="year">{currentYear}</h2>
          <div className="buttons">
            <FaIcons.FaArrowAltCircleLeft
              onClick={preMonth}
              className="arrow-left"
            />
            <FaIcons.FaArrowAltCircleRight
              onClick={nextMonth}
              className="arrow-right"
            />
          </div>
        </div>

        <div className="weekdays">
          {daysOfWeek.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="days">
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <span key={`empty-${i}`} />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const dayNumber = i + 1;
            const dayDate = new Date(currentYear, currentMonth, dayNumber);
            const isToday =
              dayDate.toDateString() === new Date().toDateString();
            const dailyTasks = tasks.filter(
              (task) =>
                normalizeDate(task.start_time).getTime() ===
                normalizeDate(dayDate).getTime()
            );

            return (
              <span
                key={dayNumber}
                className={`day-cell ${isToday ? "current-day" : ""}`}
                onClick={() => handleDayClick(dayNumber)}
              >
                {dayNumber}
                {dailyTasks.length > 0 && (
                  <div className="task-indicator">{dailyTasks.length}</div>
                )}
              </span>
            );
          })}
        </div>
      </div>

      <div className="task-sidebar">
        <TaskList
          selectedDay={selectedDate.toDateString()}
          tasksForDay={tasksForSelectedDay}
          handleEditTask={handleEditTask}
          handleDeleteTask={handleDeleteTask}
        />
        <div className="add-button">
          <OpenModalButton
            key={`modal-${modalKey}`}
            modalComponent={
              <TaskForm
                formType={selectedTask ? "Edit Task" : "Add Task"}
                onModalClose={closeModal}
                task={
                  selectedTask || {
                    start_time: selectedDate.toISOString(),
                    due_date: selectedDate.toISOString(),
                  }
                }
              />
            }
            buttonText={selectedTask ? "Edit Task" : "Add Task"}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
