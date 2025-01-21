import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { AiOutlineMenu } from "react-icons/ai";
import { thunkLogout } from "../../redux/session";
import OpenModalMenuItem from "./OpenModalMenuItem";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import "./ProfileButton.css";

function ProfileButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const user = useSelector((store) => store.session.user);
  const ulRef = useRef();

  if (!user) null;

  const toggleMenu = (e) => {
    e.stopPropagation(); // Keep from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(thunkLogout());
    closeMenu();
    navigate("/");
  };

  return (
    <>
      <div className="profile-button-wrapper">
        <button className="profile-button" onClick={toggleMenu}>
          <FaUserCircle />
          <AiOutlineMenu />
        </button>
        {showMenu && (
          <ul className={"profile-dropdown"} ref={ulRef}>
            {user ? (
              <>
                <li className="dropdown-item">Hello, {user.firstname} 🏁</li>
                <li className="dropdown-item">Username: {user.username}</li>
                <li className="dropdown-item">Email: {user.email}</li>
                <li
                  className="dropdown-item"
                  onClick={() => navigate("/profile")}
                >
                  Profile
                </li>
                <li className="dropdown-item">
                  <button className="logout-button" onClick={logout}>
                    <CiLogout /> Log Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <OpenModalMenuItem
                  itemText="Log In"
                  onItemClick={closeMenu}
                  modalComponent={<LoginFormModal />}
                />
                <OpenModalMenuItem
                  itemText="Sign Up"
                  onItemClick={closeMenu}
                  modalComponent={<SignupFormModal />}
                />
              </>
            )}
          </ul>
        )}
      </div>
    </>
  );
}

export default ProfileButton;
