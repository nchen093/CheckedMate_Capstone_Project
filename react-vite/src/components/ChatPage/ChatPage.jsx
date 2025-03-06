import "./ChatPage.css";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import {
  fetchMessages,
  sendMessage,
  clearChatHistory,
} from "../../redux/message";

function ChatPage({ currentUser, friend }) {
  const dispatch = useDispatch();
  const chatHistory = useSelector((state) => state.messages.messages);

  // State for the chat room, messages, socket, and other UI-related functionality
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const chatHistoryRef = useRef(null);

  // Listen for incoming messages from Socket.IO
  useEffect(() => {
    if (currentUser) {
      const newSocket = io(
        "https://checkedmate-capstone-project.onrender.com",
        {
          transports: ["websocket", "polling"],
        }
      );
      setSocket(newSocket);
      newSocket.emit("join", { user_id: currentUser.id });

      // Clean up socket when component unmounts
      return () => {
        newSocket.emit("leave", { user_id: currentUser.id });
        newSocket.disconnect();
      };
    }
  }, [currentUser]);

  // Fetch messages whenever a friend is selected
  useEffect(() => {
    if (friend?.id) {
      dispatch(fetchMessages(friend.id));
    }
  }, [dispatch, friend?.id]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (socket && friend?.id) {
      socket.on("new_message", (data) => {
        if (data.sender_id === friend.id || data.receiver_id === friend.id) {
          dispatch(fetchMessages(friend.id));
        }
      });

      return () => {
        socket.off("new_message");
      };
    }
  }, [socket, friend?.id, dispatch]);

  // Scroll chat history to the bottom whenever new messages arrive
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Send message handler
  const handleSendMessage = () => {
    if (message.trim() && friend && socket) {
      const messageData = {
        sender_id: currentUser.id,
        receiver_id: friend.id,
        message,
      };

      dispatch(sendMessage(messageData))
        .then(() => {
          socket.emit("private_message", messageData); // Emit to the receiver via socket
          setMessage(""); // Clear the input field after sending the message
        })
        .catch((error) => {
          console.error("Failed to send message:", error);
        });
    }
  };

  // Handle clearing chat history
  const handleClearChatHistory = () => {
    dispatch(clearChatHistory(friend.id));
  };

  return (
    <div className="App">
      <h1>Join A Chat</h1>
      <input
        type="text"
        placeholder="Room Number..."
        onChange={(event) => setRoom(event.target.value)}
      />
      <button onClick={() => socket && socket.emit("join_room", room)}>
        Join Room
      </button>

      <input
        type="text"
        placeholder="Message..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button onClick={handleSendMessage}>Send Message</button>

      <h1>Message:</h1>
      <div className="chat-modal">
        <div className="chat-box-container">
          {friend ? (
            <>
              <div className="chat-header">
                <h3 className="chat-heading">
                  Chat with{" "}
                  {friend.username[0].toUpperCase() + friend.username.slice(1)}
                </h3>
                <button
                  onClick={handleClearChatHistory}
                  className="clear-chat-button"
                >
                  Clear Chat History
                </button>
              </div>
              <div className="chat-history" ref={chatHistoryRef}>
                {chatHistory.length === 0 ? (
                  <p>No messages yet</p>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div key={index} className="message-item">
                      <span>
                        {msg.sender_id === currentUser.id
                          ? "You"
                          : friend.username}
                        :{" "}
                      </span>
                      {msg.text_message}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p>Select a friend to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
