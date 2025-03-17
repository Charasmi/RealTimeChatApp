import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "./Chat.css";

const socket = io("http://localhost:3000");

const Chat = () => {
  const { roomId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Set user name
    const user = prompt("Enter your name:");
    setUsername(user);
    socket.emit("joinRoom", { roomId, username: user });

    // Listen for messages
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Typing indicator
    socket.on("typing", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(null), 2000);
    });

    // User join/leave notifications
    socket.on("updateUsers", (usersList) => {
      setUsers(usersList);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("updateUsers");
    };
  }, [roomId]);

  // Send message
  const sendMessage = () => {
    if (message.trim()) {
      const msgData = {
        roomId,
        text: message,
        sender: username,
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit("sendMessage", msgData);
      setMessage("");
    }
  };

  // Notify typing
  const handleTyping = () => {
    socket.emit("typing", { roomId, username });
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
            <h2>Room: {roomId}</h2>
            <p><strong>Name:</strong> {username}</p>

            <div className="users-list">
                <h4>Online Users:</h4>
                <ul>
                {users.map((user, index) => (
                    <li key={index}>{user}</li>
                ))}
                </ul>
            </div>

            <div className="messages">
                {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === username ? "own" : ""}`}>
                    <strong>{msg.sender === username ? "You" : msg.sender}: </strong> {msg.text}
                    <span className="timestamp">{msg.timestamp}</span>
                </div>
                ))}
                {typingUser && <p className="typing">{typingUser} is typing...</p>}
                <div ref={messagesEndRef}></div>
            </div>

            {/* ✅ Ensure input-container is inside chat-container */}
            <div className="input-container">
                <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                    handleTyping();
                    if (e.key === "Enter") sendMessage();
                }}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
</div>
  );
};

export default Chat;
