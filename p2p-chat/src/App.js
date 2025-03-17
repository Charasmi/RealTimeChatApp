import React from "react";
import Room from "./Room";
import Chat from "./Chat";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";

function App() {
  return (
   <Router>
    <Routes>
      <Route path="/" element = {<Room/>}/>
      <Route path = "/chat/:roomId" element = {<Chat/>}/>
    </Routes>
   </Router>
  );
}

export default App;
