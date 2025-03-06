import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

function Navigation() {
  const sessionUser = useSelector((state) => state.session.user);
  return (
    <div>
      {sessionUser ? (
        <nav className="nav-bar">
          <NavLink className="logo" to="/dashboard">
            <img src="/checkmate.ico" alt="logo of a checkmate" /> CheckMate
          </NavLink>
          <ul className="navbar-links">
            <li>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="/calendar">{"Today's Calendar"}</NavLink>
            </li>

            <li>
              <NavLink to="/friends">Friends</NavLink>
            </li>
            <li>
              <NavLink to="/messages">Live Chat</NavLink>
            </li>
          </ul>
          <div className="profile-btn">
            <ProfileButton />
          </div>
        </nav>
      ) : (
        <div className="logged-out-theme-button">
          <img className="logo" src="/checkmate.ico" alt="Checkmate logo" />
          CheckMate
          <ul className="profile-btn">
            <li>
              <ProfileButton />
            </li>
            <li></li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Navigation;
