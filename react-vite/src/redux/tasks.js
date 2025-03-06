// Actions
const SET_TASKS = "tasks/SET_TASKS";
const ADD_TASK = "tasks/ADD_TASK";
const EDIT_TASK = "tasks/EDIT_TASK";
const DELETE_TASK = "tasks/DELETE_TASK";
const SET_DAY_TASKS = "tasks/SET_DAY_TASKS";

// Action Creators
const setTasks = (tasks) => ({
  type: SET_TASKS,
  tasks,
});
const setDayTasks = (tasks) => ({
  type: SET_DAY_TASKS,
  tasks,
});
const addTask = (task) => ({
  type: ADD_TASK,
  task,
});

const editTaskAction = (task) => ({
  type: EDIT_TASK,
  task,
});

const deleteTaskAction = (taskId) => ({
  type: DELETE_TASK,
  taskId,
});

// Thunk: Fetch Tasks
export const fetchTasks = () => async (dispatch) => {
  const response = await fetch("/api/tasks/", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const data = await response.json();
    // console.log("API Response:", data); // Debugging
    dispatch(setTasks(data));
  } else {
    const errorData = await response.json();
    // console.error("API Error:", errorData); // Debugging
    return { error: errorData.error || "Failed to fetch tasks" };
  }
};

// Thunk: Fetch Tasks for a Specific day
export const fetchTasksForDay = (date) => async (dispatch) => {
  try {
    const response = await fetch(`/api/tasks/task/day?date=${date}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch tasks for the day");
    }

    const data = await response.json();
    dispatch(setDayTasks(data)); // Dispatch the tasks for the selected day
  } catch (error) {
    console.error("Error fetching tasks for the day:", error);
  }
};
// Thunk: Fetch Tasks for a Specific Month
export const fetchTasksForMonth = (year, month) => async (dispatch) => {
  try {
    const response = await fetch(
      `/api/tasks/task/month?year=${year}&month=${month}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("Response Status:", response.status); // Log the status code for debugging

    if (response.status === 304) {
      // console.log("Data not modified. Using cached data.");
      return; // Exit early, no need to parse the response body
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Safely parse the error
      throw new Error(
        errorData.error || "Failed to fetch tasks for the selected month"
      );
    }

    const data = await response.json();
    // console.log("Data received:", data); // Log the received data

    // Check if the data is in the expected format
    if (!data || !Array.isArray(data.tasks)) {
      throw new Error("Invalid tasks data received");
    }

    dispatch(setTasks(data)); // Dispatch the tasks for the selected month
  } catch (error) {
    console.error("Error fetching tasks for the month:", error); // Log the error
  }
};

// Thunk: Create Task
export const createTask = (newTask) => async (dispatch) => {
  const response = await fetch("/api/tasks/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTask),
  });

  const data = await response.json();

  if (response.ok) {
    dispatch(addTask(data.task));
    return { task: data.task };
  } else if (response.status === 409) {
    return { error: data.error || "This task conflicts with another task" };
  } else {
    return { error: data.error || "Failed to create task" };
  }
};

// Thunk: Edit Task
export const editTask = (taskId, updatedTask) => async (dispatch) => {
  const response = await fetch(`/api/tasks/edit/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedTask),
  });

  const data = await response.json();

  if (response.ok) {
    dispatch(editTaskAction(data.task));
    return { task: data.task };
  } else if (response.status === 409) {
    return { error: data.error || "This task conflicts with another task" };
  } else {
    return { error: data.error || "Failed to edit task" };
  }
};

// Thunk: Delete Task
export const deleteTask = (taskId) => async (dispatch) => {
  const response = await fetch(`/api/tasks/delete/${taskId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(deleteTaskAction(taskId));
  } else {
    const errorData = await response.json();
    return { error: errorData.error || "Failed to delete task" };
  }
};

// Initial State
const initialState = [];

// Reducer
export default function tasksReducer(state = initialState, action) {
  switch (action.type) {
    case SET_TASKS:
      // console.log("Setting tasks:", action.tasks); // Debugging
      return action.tasks || [];
    case SET_DAY_TASKS:
      // console.log("Setting day tasks:", action.tasks); // Debugging
      return action.tasks || []; // Replace or merge with existing tasks based on your needs
    case ADD_TASK:
      return [...state, action.task];
    case EDIT_TASK:
      return state.map((task) =>
        task.id === action.task.id ? action.task : task
      );
    case DELETE_TASK:
      return state.filter((task) => task.id !== action.taskId);

    default:
      return state;
  }
}
