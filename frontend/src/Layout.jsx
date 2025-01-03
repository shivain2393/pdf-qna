import Navbar from "./components/Navbar"; // Import the Navbar component, which will be displayed at the top of the layout
import { ToastContainer } from 'react-toastify'; // Import ToastContainer to show toast notifications in the app

// The Layout component serves as the main wrapper for the entire app's page structure
const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navbar will be displayed at the top of the page */}
            <Navbar />
            
            {/* Main content area, which will contain the page's children components */}
            <main className="flex-grow">
                {children}  {/* Render the content passed as children (e.g., Chat component) */}
            </main>

            {/* ToastContainer is where toast notifications will be displayed */}
            <ToastContainer
                position="top-right" // Position of the toast on the screen
                theme="light" // Theme for the toast notifications
                autoClose={5000} // Time duration for the toast to automatically close
            />
            
        </div>
    )
}

export default Layout; // Export the Layout component so it can be used in other parts of the app
