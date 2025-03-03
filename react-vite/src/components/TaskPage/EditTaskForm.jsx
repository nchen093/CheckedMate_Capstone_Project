import TaskForm from "./TaskForm";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchTasks } from "../../redux/tasks";

const EditTaskForm = () => {
  const { taskId } = useParams();
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.task[taskId]);

  console.log("what is the tasks:", tasks);

  //collect the history data that you create a spot
  useEffect(() => {
    if (taskId) {
      dispatch(fetchTasks(taskId));
    }
  }, [dispatch, taskId]);

  return <TaskForm task={tasks} formType="Edit Task" />;
};

export default EditTaskForm;
