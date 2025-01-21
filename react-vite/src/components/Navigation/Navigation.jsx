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
          <NavLink className="logo" to="/">
            <img src="/checkmate.ico" alt="logo of a checkmate" /> CheckMate
          </NavLink>
          <ul className="navbar-links">
            <li>
              <NavLink activeClassName="active" to="/">
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="active" to="/today">
                {"Today's Calendar"}
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="active" to="/invitations">
                Invitations
              </NavLink>
            </li>
            <li>
              <NavLink activeClassName="active" to="/friends">
                Friends
              </NavLink>
            </li>
            <li>
              <NavLink to="/messages" activeClassName="active">
                Live Chat
              </NavLink>
            </li>
          </ul>
          <div>
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
            <li>
              <ProfileButton />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Navigation;
