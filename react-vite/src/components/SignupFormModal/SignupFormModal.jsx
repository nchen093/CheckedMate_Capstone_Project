import { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkSignup } from "../../redux/session";
import "./SignupForm.css";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setErrors({
        confirmPassword:
          "Confirm Password field must be the same as the Password field",
      });
    }

    const serverResponse = await dispatch(
      thunkSignup({
        email,
        username,
        firstname,
        lastname,
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
        <div className="signup-container">
          <h1 className="greeting">Sign Up</h1>
          {errors.server && <p>{errors.server}</p>}
          <form onSubmit={handleSubmit} className="signup-form">
            <label>
              Email
              <input
                type="text"
                value={email}
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="signup-input"
              />
            </label>
            {errors.email && <p>{errors.email}</p>}
            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
                className="signup-input"
              />
            </label>
            {errors.username && <p>{errors.username}</p>}
            <label>
              FirstName
              <input
                type="text"
                value={firstname}
                placeholder="firstname"
                onChange={(e) => setFirstname(e.target.value)}
                required
                className="signup-input"
              />
            </label>
            {errors.firstname && <p>{errors.firstname}</p>}
            <label>
              LastName
              <input
                type="text"
                value={lastname}
                placeholder="lastname"
                onChange={(e) => setLastname(e.target.value)}
                required
                className="signup-input"
              />
            </label>
            {errors.lastname && <p>{errors.lastname}</p>}
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
                className="signup-input"
              />
            </label>
            {errors.password && <p>{errors.password}</p>}
            <label>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="enter your password again..."
                required
                className="signup-input"
              />
            </label>
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
