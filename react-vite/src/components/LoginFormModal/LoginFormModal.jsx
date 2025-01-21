import { useState } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";
import SignUpFormModal from "../SignupFormModal";
import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { closeModal } = useModal();

  const openModal = () => {
    setIsModalOpen(true);
  };

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
            <input
              type="text"
              value={email}
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />

            {errors.email && <p className="error-message">{errors.email}</p>}

            <input
              type="password"
              value={password}
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />

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
                className="demo-button"
              >
                Demo User 1
              </button>

              <button
                onClick={() => {
                  setEmail("marnie@aa.io");
                  setPassword("password");
                }}
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
              onItemClick={() => {
                openModal;
              }}
              modalComponent={<SignUpFormModal closeModal={closeModal} />}
            />
          </div>
        </div>
      </div>
      {isModalOpen && <SignUpFormModal closeModal={closeModal} />}
    </>
  );
}

export default LoginFormModal;
