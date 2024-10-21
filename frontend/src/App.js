import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/Login'; // Import Login from the pages folder

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Add more routes here for other pages like Home, Dashboard, etc. */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
