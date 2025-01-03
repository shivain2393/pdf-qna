import { useRef, useState, useEffect } from 'react'; // Importing React hooks
import { usePdfStore } from '../hooks/usePdfStore'; // Importing custom hook for managing PDF state
import { toast } from 'react-toastify'; // Importing toast notifications for user feedback
import { CiCirclePlus } from "react-icons/ci"; // Importing icons for the button
import { FaRegFilePdf } from "react-icons/fa6"; // Importing PDF icon
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Importing loading spinner icon
import Button from './Button'; // Importing Button component

const Navbar = () => {

    const inputFileRef = useRef(null); // Reference to the file input element
    const { pdf, setPdf } = usePdfStore(); // Accessing the current PDF state and setter from the custom hook
    const [file, setFile] = useState(null); // Local state for storing the uploaded file
    const [uploading, setUploading] = useState(false); // Local state for tracking the uploading process

    // Function to handle the file upload process
    const handleFileUpload = async () => {
        // Check if the file is selected and is of type 'application/pdf'
        if (file && file.type === 'application/pdf') {
            const formData = new FormData(); // Create a FormData object to send the file as multipart/form-data
            formData.append("file", file); // Append the file to FormData

            try {
                setUploading(true); // Set uploading state to true while the file is being uploaded
                const response = await fetch("http://localhost:8000/upload/", { // Send the file to the backend API
                    method: "POST", // POST method to upload the file
                    body: formData, // The FormData with the file to be uploaded
                });

                // Check if the response from the server is not ok
                if (!response.ok) {
                    toast.error('Failed to upload file'); // Display error notification if upload failed
                    console.error('Upload error:', response);
                    return;
                }

                const data = await response.json(); // Parse the response from the server
                toast.success('File uploaded successfully'); // Display success notification
                setPdf(file.name); // Set the uploaded file name in the global state using the custom hook
                setUploading(false); // Set uploading state to false once the upload is complete
            } catch (error) {
                console.error("Upload failed:", error); // Log any errors during the upload process
                toast.error('An error occurred during file upload'); // Display error notification if an error occurred
            }
        } else {
            toast.warning('Please upload a PDF file'); // Warn the user if the file is not a PDF
            setUploading(false); // Reset uploading state
        }
    };

    // Effect hook to trigger the file upload process when the file state changes
    useEffect(() => {
        if (file) {
            handleFileUpload(); // Call the file upload function
        }
    }, [file]); // Dependency array ensures that the effect runs when the 'file' state changes

    return (
        <header className="flex items-center bg-background p-4"> {/* Navbar container with background and padding */}
            <nav className='max-w-5xl w-full flex mx-auto'> {/* Navbar content with max width and centered */}
                <div className="flex-shrink-0">
                    <img src="https://framerusercontent.com/images/pFpeWgK03UT38AQl5d988Epcsc.svg" alt="Logo" className="h-10" /> {/* Logo */}
                </div>
                <div className="flex items-center ml-auto"> {/* Flex container for PDF info and the button */}
                    {pdf && ( // Display the uploaded PDF name if a PDF has been uploaded
                        <div className="flex flex-wrap items-center mr-4 text-white border border-white py-2 px-4 rounded-lg">
                            <FaRegFilePdf className='h-5 w-5 mr-1' /> {/* PDF Icon */}
                            <span className="hidden sm:inline">{pdf}</span> {/* Display PDF name */}
                        </div>
                    )}
                    <Button icon={uploading ? AiOutlineLoading3Quarters : CiCirclePlus} text={uploading ? "Uploading" : pdf ? "Upload another PDF" : "Upload PDF"} onClick={() => inputFileRef.current.click()} uploading={uploading}/> {/* Button to trigger file input */}
                    <input
                        ref={inputFileRef} // Reference to the hidden file input element
                        onChange={(e) => setFile(e.target.files[0])} // Handle file selection
                        type="file"
                        accept="application/pdf" // Only accept PDF files
                        className="hidden" // Hide the input element
                    />
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
