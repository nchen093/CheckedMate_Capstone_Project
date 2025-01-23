import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkFetchProfile,
  thunkUpdateProfile,
  changePasswordThunk,
} from "../../redux/session";
import "./ProfilePage.css";

export default function ProfilePage() {
  const user = useSelector((state) => state.session.user);
  const dispatch = useDispatch();

  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    dispatch(thunkFetchProfile());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset success and error messages before processing the form
    setPasswordError("");
    setPasswordSuccess("");

    // Handle username update
    if (username !== user.username) {
      await dispatch(thunkUpdateProfile({ username }));
    }

    // Handle password change if applicable
    if (currentPassword && newPassword && confirmNewPassword) {
      // Validate password fields
      if (newPassword !== confirmNewPassword) {
        setPasswordError("New password and confirmation do not match.");
        return; // Prevent further processing if there's an error
      }

      // Dispatch change password action
      const result = await dispatch(
        changePasswordThunk(currentPassword, newPassword)
      );

      if (result === "Password changed successfully.") {
        setPasswordSuccess(result);
        setPasswordError("");
      } else {
        setPasswordError(result || "Error changing password.");
        setPasswordSuccess("");
      }
    }

    // Exit edit mode only if there are no errors
    if (!passwordError && !passwordSuccess) {
      setEditMode(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      {editMode ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirmNewPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          {passwordError && <p className="error">{passwordError}</p>}
          {passwordSuccess && <p className="success">{passwordSuccess}</p>}

          <button type="submit">Save Changes</button>
        </form>
      ) : (
        <div>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
}
