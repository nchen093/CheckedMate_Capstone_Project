import TaskForm from "./TaskForm";

const AddTaskForm = () => {
  const task = {};

  return <TaskForm task={task} formType="Add Task" />;
};

export default AddTaskForm;
