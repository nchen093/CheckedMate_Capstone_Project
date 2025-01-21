import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import ProfileButton from "./ProfileButton";
import ThemeButton from "../ThemeButton/ThemeButton";
import "./Navigation.css";

function Navigation() {
  const sessionUser = useSelector((state) => state.session.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionUser) {
      navigate("/dashboard");
    }
  }, [sessionUser, navigate]);

  return (
    <div>
      {sessionUser ? (
        <nav className="nav-bar">
          <NavLink className="logo" to="/">
            <img src="/checkmate.ico" alt="logo of a checkmate" /> CheckMate
          </NavLink>
          <ul className="navbar-links">
            <li>
              <NavLink
                activeClassName="active"
                className="links"
                to="/dashboard"
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="active" className="links" to="/today">
                {"Today's Calendar"}
              </NavLink>
            </li>
            <li>
              <NavLink
                activeClassName="active"
                className="links"
                to="/invitations"
              >
                Invitations
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="active" className="links" to="/friends">
                Friends
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/messages"
                activeClassName="active"
                className="links"
              >
                Live Chat
              </NavLink>
            </li>
          </ul>
          <div className="profile-btn">
            <ProfileButton />
          </div>
          <div>
            <ThemeButton className="profile-btn" />
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
            <li>
              <ThemeButton className="profile-btn" />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Navigation;
