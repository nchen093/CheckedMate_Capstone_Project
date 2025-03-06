import { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { thunkLogout } from "../../redux/session";
import { useDispatch } from "react-redux";
import "./DashBoardPage.css";
import TaskPage from "../TaskPage/TaskPage";

export default function DashboardPage() {
  const [sidebar, setSidebar] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showSidebar = () => setSidebar(!sidebar); // Toggle the sidebar

  const logout = (e) => {
    e.preventDefault();
    dispatch(thunkLogout());
    navigate("/");
  };

  return (
    <>
      <div className="navbar">
        <Link to="#" className="menu-bars">
          <FaIcons.FaBars onClick={showSidebar} />
        </Link>
      </div>

      {/* Sidebar */}
      <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
        <ul className="nav-menu-items" onClick={showSidebar}>
          <li className="navbar-toggle">
            <Link to="#" className="menu-bars">
              <AiIcons.AiOutlineClose />
            </Link>
          </li>

          {/* Sidebar Links */}
          <li className="nav-item">
            <Link to="/dashborad" className="nav-links">
              <FaIcons.FaHome />
              DashBoard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/friends" className="nav-links">
              <FaIcons.FaUserFriends />
              Friends
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/calendar" className="nav-links">
              <FaIcons.FaCalendarDay /> Schedule
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/messages" className="nav-links">
              <FaIcons.FaEnvelope />
              Messages
            </Link>
          </li>

          {/* Logout Link */}
          <li className="nav-item" onClick={logout}>
            <Link to="#" className="nav-links">
              <FaIcons.FaSignOutAlt />
              Logout
            </Link>
          </li>
        </ul>
      </nav>
      <TaskPage />
    </>
  );
}
