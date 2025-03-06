import { createBrowserRouter } from "react-router-dom";
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import HomePage from "../components/HomePage/HomePage";
import DashboardPage from "../components/DashBoardPage/DashBoardPage";
import Layout from "./Layout";
import ProfilePage from "../components/ProfilePage/ProfilePage";
import CalendarPage from "../components/CalendarPage/CalendarPage";
import MessagesPage from "../components/MessagePage/MessagesPage";
import FriendPage from "../components/FriendPage/FriendsPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginFormPage />,
      },
      {
        path: "signup",
        element: <SignupFormPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "calendar",
        element: <CalendarPage />,
      },

      {
        path: "friends",
        element: <FriendPage />,
      },

      {
        path: "messages",
        element: <MessagesPage />,
      },
    ],
  },
]);
