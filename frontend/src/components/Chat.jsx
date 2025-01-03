import { useState, useRef, useEffect } from 'react'; // Importing React hooks
import { CiPaperplane } from "react-icons/ci"; // Importing the send message icon
import Button from './Button'; // Importing Button component
import { usePdfStore } from '../hooks/usePdfStore'; // Importing custom hook for managing the PDF state
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Importing the loading spinner icon

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const Chat = () => {
    const { pdf } = usePdfStore(); // Accessing the PDF filename from the global store
    const [messages, setMessages] = useState([]); // State for managing messages in the chat
    const [input, setInput] = useState(''); // State for managing the user input
    const [disableBtn, setDisableBtn] = useState(true); // State for disabling the send button
    const [sending, setSending] = useState(false); // State for managing sending status (loading)
    const messagesEndRef = useRef(null); // Ref to scroll to the latest message in the chat

    // Function to handle sending a message
    const handleSend = async () => {
        if (input.trim()) { // Check if the input is not empty
            try {
                setSending(true); // Set sending status to true (show loading)
                // Send the user question to the backend API
                const response = await fetch(`${backendUrl}/ask/?filename=${pdf}&question=${encodeURIComponent(input)}`, {
                    method: 'POST' // POST request to send the question
                });

                if (response.ok) { // If the response is successful
                    const data = await response.json(); // Parse the response data (AI's answer)
                    // Update the messages state to add both the user message and the AI response
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: input, sender: 'user' }, // Add user message
                        { text: data.answer, sender: 'system' }, // Add system (AI) response
                    ]);
                    setInput(''); // Clear the input field
                }
                setSending(false); // Set sending status to false after the message is sent
            } catch (error) {
                console.log('Error:', error); // Log any error if the request fails
                setSending(false); // Set sending status to false in case of an error
            }
        }
    };

    // Effect hook to automatically scroll to the bottom of the chat when a new message is added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); // Scroll smoothly to the latest message
    }, [messages]); // The effect runs whenever the messages state is updated

    // Effect hook to display an initial message when the PDF is uploaded
    useEffect(() => {
        if (pdf) { // Check if a PDF is uploaded
            setMessages([
                { text: `Your PDF has been uploaded. Ask any questions in regards to the PDF ${pdf}`, sender: 'system' }, // System message
            ]);
        }
    }, [pdf]); // Runs whenever the PDF state changes

    // Effect hook to manage the state of the send button (enable or disable)
    useEffect(() => {
        if (pdf && !sending && input.trim()) { // Enable the button if there's a PDF, no active sending process, and the input is not empty
            setDisableBtn(false);
        } else {
            setDisableBtn(true); // Otherwise, disable the button
        }
    }, [pdf, sending, input]); // Runs when PDF, sending state, or input changes

    // Automatically send a welcome message when the component mounts
    useEffect(() => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: 'Welcome to QNA Chat by AIPlanet. This assignment was made by Shivain Sagar. Upload a PDF to get started.', sender: 'system' }, // Welcome message
        ]);
    }, []); // This effect only runs once on mount

    return (
        <div className="flex flex-col mx-auto border border-gray-300 rounded-lg overflow-hidden max-w-5xl w-full mt-4 h-[80vh]">
            <div className="flex-1 p-4 overflow-y-auto space-y-4"> {/* Message container */}
                {messages.map((message, index) => (
                    <div
                        key={index} // Set a unique key for each message
                        className={`p-3 my-2 rounded-lg max-w-xs ${
                            message.sender === 'user' ? 'ml-auto text-justify bg-blue-200' : // User message style
                            message.sender === 'system' ? 'text-gray-500 text-justify bg-gray-100' : // System message style
                            'mr-auto bg-gray-300 border border-gray-300'
                        }`}
                    >
                        {message.text} {/* Render the message text */}
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* Scroll-to-bottom reference */}
            </div>
            <div className="flex p-4 border-t border-gray-300"> {/* Input area */}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)} // Update input state on text change
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !disableBtn && !sending) { // Send message when Enter is pressed
                            handleSend();
                        }
                    }}
                    placeholder="Ask a question..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Button 
                    disabled={disableBtn} // Disable button when conditions are not met
                    icon={sending ? AiOutlineLoading3Quarters : CiPaperplane} // Show loading spinner or send icon
                    text={sending ? "Sending" : "Send"} // Change button text based on sending state
                    onClick={() => handleSend()} // Trigger handleSend on button click
                    uploading={sending} // Pass sending state to Button component
                />
            </div>
        </div>
    );
};

export default Chat;
