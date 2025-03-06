import { useState } from "react";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";
import LoginFormModal from "../LoginFormModal";
import "./LandingPage.css";

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <div className="landingpage-img">
        <img src="/Images/LandingPage.png" alt="to-do-list image" />
        <div className="content">
          <h1>Manage all your task in one place!</h1>
          <div className="modal">
            <OpenModalMenuItem
              itemText="Get Started"
              onItemClick={openModal}
              modalComponent={<LoginFormModal closeModal={closeModal} />}
            />
          </div>
        </div>
      </div>
      {isModalOpen && <LoginFormModal closeModal={closeModal} />}
    </>
  );
}
