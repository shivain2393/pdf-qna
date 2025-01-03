import React from 'react';

// Button component: Displays a button with optional icon, text, and onClick handler.
// It can also handle disabled and uploading states.
const Button = ({ icon: Icon, text, onClick, disabled=false, uploading=false }) => {
    return (
        // Button element with conditional styling based on the disabled or uploading state
        <button 
            // Button is disabled when 'uploading' is true, otherwise when 'disabled' prop is passed
            disabled={uploading ? true : disabled} 
            onClick={onClick} // Trigger the onClick handler when the button is clicked
            // Tailwind CSS classes to style the button, including hover and disabled states
            className="flex items-center bg-accent text-white py-2 px-4 rounded-lg font-bold hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {/* Display the button text, hidden on small screens */}
            <span className="hidden sm:inline mr-2">{text}</span> 
            
            {/* Conditionally render the icon if the 'Icon' prop is passed */}
            {Icon && 
                // If 'uploading' is true, apply a spinning animation to the icon, else show it normally
                <Icon className={uploading ? "text-inherit inline-block h-5 w-5 animate-spin" : "text-inherit inline-block h-5 w-5"} />
            } 
        </button>
    );
}

export default Button;
