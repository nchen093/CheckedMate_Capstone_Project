import { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkSignup } from "../../redux/session";
import "./SignupForm.css";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password and Confirm Password match check
    if (password !== confirmPassword) {
      return setErrors({
        confirmPassword:
          "Confirm Password field must be the same as the Password field",
      });
    }

    // Clear any existing errors before submitting
    setErrors({});

    const serverResponse = await dispatch(
      thunkSignup({
        email,
        username,
        password,
      })
    );

    if (serverResponse) {
      // Check if serverResponse is an error object and set the errors
      if (serverResponse.errors) {
        setErrors(serverResponse.errors);
      }
    } else {
      // If signup is successful, close modal
      closeModal();
    }
  };

  return (
    <>
      <div className="centered-container">
        <div className="signup-container">
          <h1 className="greeting">Sign Up</h1>
          {errors.server && <p>{errors.server}</p>}
          <form onSubmit={handleSubmit} className="signup-form">
            <input
              type="text"
              value={email}
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="signup-input"
            />
            {errors.email && <p>{errors.email}</p>}

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              className="signup-input"
            />
            {errors.username && <p>{errors.username}</p>}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
              className="signup-input"
            />
            {errors.password && <p>{errors.password}</p>}
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="confirm password"
              required
              className="signup-input"
            />

            {errors.confirmPassword && <p>{errors.confirmPassword}</p>}

            <button className="signup-button" type="submit">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignupFormModal;
