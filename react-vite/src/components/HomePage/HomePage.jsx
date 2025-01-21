import { useSelector } from "react-redux";
import "./HomePage.css";
import LandingPage from "../LandingPage/LandingPage";
import DashboardPage from "../DashBoardPage/DashBoardPage";

export default function HomePage() {
  const user = useSelector((state) => state.session.user);
  return <>{user ? <DashboardPage /> : <LandingPage />}</>;
}
