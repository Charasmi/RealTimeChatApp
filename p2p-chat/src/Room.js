import { useState } from "react";
import {useNavigate} from "react-router-dom";
import "./Room.css";

const Room = () =>{
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");

    const handleCreateRoom = () => {
        const newRoomId = Math.random().toString(36).substring(2, 10);
        navigate(`/chat/${newRoomId}`);
      };
    
      const handleJoinRoom = () => {
        if (roomId.trim() !== "") {
          navigate(`/chat/${roomId}`);
        } else {
          alert("Please enter a valid Room ID.");
        }
      };

      return (
        <div className="home-container">
          <h1 className="title">Peer-to-Peer Chat</h1>
          <div className="room-actions">
            <button className="btn create-btn" onClick={handleCreateRoom}>
              Create Room
            </button>
            <input
              type="text"
              className="room-input"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button className="btn join-btn" onClick={handleJoinRoom}>
              Join Room
            </button>
          </div>
        </div>
      );
};

export default Room;

