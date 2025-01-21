import { useState } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import SignUpFormModal from "../SignUpFormModal";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";
import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal, openModal } = useModal(); // Use the context closeModal

  const handleSubmit = async (e) => {
    e.preventDefault();

    const serverResponse = await dispatch(
      thunkLogin({
        email,
        password,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      closeModal();
    }
  };

  return (
    <>
      <div className="centered-container">
        <div className="login-container">
          <h1 className="greeting">Welcome Back!</h1>
          <form onSubmit={handleSubmit} className="login-form">
            <label>
              Email
              <input
                type="text"
                value={email}
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
            </label>
            {errors.email && <p className="error-message">{errors.email}</p>}
            <label>
              Password
              <input
                type="password"
                value={password}
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </label>
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
            <button type="submit" className="login-button">
              Log In
            </button>

            <div className="login-demo-buttons">
              <button
                onClick={() => {
                  setEmail("demo@aa.io");
                  setPassword("password");
                }}
                type="submit"
                className="demo-button"
              >
                Demo User 1
              </button>

              <button
                onClick={() => {
                  setEmail("marnie@aa.io");
                  setPassword("password");
                }}
                type="submit"
                className="demo-button"
              >
                Demo User 2
              </button>
            </div>
          </form>

          <div className="signup-link">
            {"Don't have an account? "}
            <OpenModalMenuItem
              itemText="Sign Up"
              onItemClick={() => openModal("Sign Up")}
              modalComponent={<SignUpFormModal closeModal={closeModal} />}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginFormModal;
