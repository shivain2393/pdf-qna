import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import the routing components from react-router-dom
import Layout from './Layout'; // Import the Layout component that serves as the wrapper for the app structure (header, footer, etc.)
import Chat from './components/Chat'; // Import the Chat component, which is the main content for the app

// Main App component where the routing and layout of the app are configured
const App = () => {
  return (
    // The Router component provides routing functionality for the app
    <Router>
      {/* The Layout component wraps all routes and provides consistent structure (e.g., header, footer) across pages */}
      <Layout>
        {/* The Routes component is where all route definitions are placed */}
        <Routes>
          {/* Define the route for the root URL ('/') and render the Chat component when this path is accessed */}
          <Route path="/" element={<Chat />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App; // Export the App component so it can be used in other parts of the app
