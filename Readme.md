# PDF-based AI Q&A System

This project allows users to upload PDF documents and ask questions about the content of the uploaded document. The system utilizes AI to generate answers based on the content of the PDF. The frontend is built with React, and the backend is developed using FastAPI.

## Project Structure

### **Frontend (React)**

The frontend is responsible for providing an interactive UI where users can upload PDFs, ask questions, and view responses. It is built using React and the following components:

- **`App.js`**: The main entry point of the application where the `Router` and `Routes` are defined. It includes the layout and routing to the chat component.
  
- **`Layout.js`**: The main layout component wrapping the Navbar, Footer, and main content area. It contains the structure for the entire page, including toast notifications via `react-toastify`.

- **`Navbar.js`**: The top navigation bar, which includes the logic for uploading PDFs. It triggers file selection and calls the backend to upload the file.

- **`Chat.js`**: The chat interface where users interact with the system. It displays the conversation history, handles user input, and sends questions to the backend. It also shows the answers based on the uploaded PDF content.

- **`Button.js`**: A reusable button component that shows different states (e.g., "Send", "Uploading", etc.) and includes loading animations for specific actions (like submitting questions or uploading files).

- **`ToastContainer`**: Toast notifications are integrated into the layout for user feedback during interactions, including success and error messages.

### **Backend (FastAPI)**

The backend is responsible for processing PDF uploads, extracting text from the PDF, cleaning the text, and using AI models to answer questions based on the content of the uploaded PDF. It is built using FastAPI and performs the following tasks:

1. **File Upload** (`/upload` endpoint)
    - **PDF Upload**: When a user uploads a PDF through the `Navbar` component, the file is sent to the `/upload` endpoint in the FastAPI backend.

    - **Text Extraction**:
        - `PyMuPDF` (or other PDF extraction libraries) is used to extract the raw text from the uploaded PDF. The system reads each page of the PDF and extracts its content, including headers, body text, and footers.
        - The extracted text is stored temporarily in the backend for further processing. If the PDF contains complex formatting (e.g., tables, graphs), the system attempts to clean and organize the text accordingly.

2. **Text Cleaning and Preprocessing**:
    - **Text Normalization**: The raw extracted text is often noisy and includes extraneous elements such as page numbers, headers, footers, or footnotes. The text is cleaned using the following steps:
        - Removing non-textual elements: The text is processed to remove page numbers, table of contents, header/footer, and any other non-relevant sections.
        - Whitespace & Punctuation Handling: Extra spaces, line breaks, and non-essential punctuation marks are removed to ensure that the text is clean and properly formatted for further analysis.
    - **Text Segmentation**: The cleaned text is divided into manageable chunks or segments for more efficient indexing and querying. Each chunk typically corresponds to a section or a group of paragraphs in the document.

3. **Document Indexing & Embeddings**:
    - **Text Embedding**:
        - After cleaning the text, the system generates embeddings for the text using an AI model. The text is transformed into dense vector representations that can be efficiently searched for relevant information.
        - `sentence-transformers/all-MiniLM-L6-v2` is used as the model for generating embeddings. This model is a lightweight transformer-based model pre-trained on a variety of sentence-level tasks and is effective for tasks like document retrieval.
        - The text is split into small chunks (e.g., paragraphs or sections), and each chunk is embedded using this model to produce a vector representation. These embeddings are stored in the backend for quick search during the question-answering phase.
    - **Vector Storage**: The generated embeddings are indexed and stored in a storage solution (e.g., FAISS or a database), which allows fast retrieval of relevant sections of the PDF when a question is asked.

4. **Question-Answering (`/ask` endpoint)**:
    - **Question Parsing**:
        - When a user asks a question through the `Chat` component, the question is sent to the `/ask` endpoint along with the file name of the uploaded PDF.
        - The question is tokenized using a pre-trained tokenizer to convert it into a format that the models can process effectively.
    - **Model Selection for QA**:
        - For the question-answering process, a pre-trained BERT model, such as `bert-large-uncased-whole-word-masking-finetuned-squad`, is used. This model has been fine-tuned on the SQuAD (Stanford Question Answering Dataset) and is specifically designed for answering questions based on a provided context.
    - **Context Retrieval**:
        - The question is compared with the previously indexed document embeddings to find the most relevant chunks of text (context) that could contain the answer.
        - The model uses cosine similarity or another distance metric to rank the text chunks based on their relevance to the question.
    - **Answer Generation**:
        - Once the most relevant context is identified, the BERT-based QA model processes the question along with the retrieved context.
        - The model generates an answer by selecting the most probable span of text within the context that answers the user's question.
        - The answer is returned to the frontend and displayed in the `Chat` component.

5. **AI Models in Action**:
    - **Embedding Model (`sentence-transformers/all-MiniLM-L6-v2`)**:
        - This model is used to convert the cleaned document text into dense vector embeddings. These embeddings are stored in a vector database and allow for efficient similarity search when a user asks a question. By comparing the user's question with the document embeddings, the backend can retrieve the most relevant sections of the document.
    - **Question Answering Model (`bert-large-uncased-whole-word-masking-finetuned-squad`)**:
        - This BERT-based model is used for question answering. It is fine-tuned on the SQuAD dataset, making it capable of answering questions based on a provided context (in this case, the relevant sections of the PDF).
        - The model processes the question and context, selecting a span of text that provides the most accurate and relevant answer.

6. **Response Handling & Feedback**:
    - **Answer Formatting**:
        - The answer returned by the AI model is often in the form of a text span extracted from the document. This span is cleaned (e.g., trimmed, formatted) before being sent back to the frontend.

### **File Structure**

```
/project-root
├── /backend (FastAPI)
│   ├── /app
│   │   ├── main.py # Main FastAPI application with API Routes, Processing Code
│   │   ├── config.py #Configuration details like Uploads directory, Index directory, models
│   └── requirements.txt # Python dependencies
├── /frontend (React)
│   ├── /src
│   │   ├── /components
│   │   │   ├── Button.js # Reusable button component
│   │   │   ├── Chat.js # Chat interface component
│   │   │   ├── Navbar.js # Navbar with file upload functionality
│   │   ├── App.js # Main entry point of the React app
│   │   ├── Layout.js # Layout wrapping the main content
│   │   └── index.js # ReactDOM rendering
│   └── package.json # Frontend dependencies
└── README.md # Project documentation (this file)
```



## Key Components & Their Roles

### **Frontend**

1. **Navbar Component (`Navbar.js`)**:
   - Allows the user to upload a PDF file.
   - Triggers the file input and calls the backend to upload the file.
   - Displays the PDF file name after a successful upload.

2. **Chat Component (`Chat.js`)**:
   - Provides the interface for users to ask questions.
   - Displays the user’s question and the system’s response in a chat format.
   - Sends the question to the backend and receives the answer.
   - Handles input validation and button states for submitting questions.

3. **Button Component (`Button.js`)**:
   - A reusable button component used for submitting questions and uploading PDFs.
   - Handles different states (e.g., "Uploading", "Sending", etc.), with visual feedback like loading spinners.

4. **Layout Component (`Layout.js`)**:
   - Contains the main structure of the page, including the `Navbar`, `Footer`, and a container for the dynamic content.
   - Includes toast notifications for feedback (success, error, etc.).

### **Backend**

1. **Main FastAPI Application (`main.py`)**:
   - Initializes the FastAPI app and defines the application’s routes.
   
2. **API Endpoints**:
   - **`/upload`**: Receives and processes PDF uploads.
   - **`/ask`**: Receives a question from the frontend and returns the system’s answer based on the PDF content.
   
3. **Configuration (`config.py`)**:
   - The `config.py` file centralizes the configuration for the FastAPI app, including the following:
     - **Upload Directories**: Defines paths (`UPLOAD_DIR` and `INDEX_DIR`) for storing uploaded files and indexing data.
     - **AI Models**:
       - The embedding model (`embed_model`) is set to `sentence-transformers/all-MiniLM-L6-v2` for document indexing.
       - The question-answering pipeline (`qa_pipeline`) is configured using a pre-trained BERT model fine-tuned on the SQuAD dataset.
     - **Tokenizer**: BERT's tokenizer is set up to process queries and documents.
   - These settings are used in the backend routes and processing, ensuring that the upload, document indexing, and AI model interactions are streamlined.

### **Models Used**

1. **Embedding Model**
    - Model: `sentence-transformers/all-MiniLM-L6-v2`
    - Purpose: This model is used for transforming the content of PDFs into embeddings (numerical representations) that are used for document indexing and retrieval. The model is efficient and suitable for handling semantic similarities between chunks of text in large documents.

2. **Question-Answering Model**:
    - Model: `bert-large-uncased-whole-word-masking-finetuned-squad`
    - Purpose: This pre-trained BERT model fine-tuned on the SQuAD dataset is used to answer user queries by extracting relevant information from the uploaded PDF. The model is capable of reading the PDF content and providing precise answers to specific questions.


### **Interaction Flow**

1. **File Upload**:
   - The user selects a PDF file via the `Navbar` component.
   - The file is uploaded to the backend via the `/upload` endpoint.
   - The backend processes the file and stores it temporarily for answering user queries.

2. **Question Asking**:
   - After the PDF is uploaded and indexed, the user can ask questions in the Chat component.
   - The question, along with the filename, is sent to the backend via the /ask endpoint.
   - The backend uses the question-answering model (qa_pipeline) to extract relevant information from the indexed content of the uploaded PDF.
   - The backend returns the generated answer based on the content of the PDF to the frontend.

3. **Answer Generation**:

    - The backend uses the embedding model (embed_model) to match the user's question with the most relevant text chunks in the PDF.
    - The question-answering model is then used to generate an accurate answer based on the matched content.

4. **System Feedback**:
   - Throughout the interaction, the system provides feedback to the user:
        - `Uploading`: While the file is being uploaded.
        - `Sending`: When the question is being processed.
        - `Success/Failure Messages`: After the file is successfully uploaded or a question is answered, the system displays relevant notifications using `ToastContainer`.
        - `Loading Indicators`: The `Button.js` component shows the state of the action, such as "Uploading", "Sending", or "File uploaded successfully".
## Setup and Installation

### **Frontend (React)**

1. Clone the repository and navigate to the `frontend` directory:
   ```
   git clone https://github.com/shivain2393/pdf-qna
   cd frontend
    ```

2. Install dependencies:
    ```
    npm install
    ```
3. Start the development server:
    ```
    npm run dev
    ```
    The app should now be accessible at `http://localhost:5173.`

### **Backend (FastAPI)**
1. Navigate to the backend directory:
    ```
    cd backend
    ```
2. Create a virtual environment and install dependencies:
    ```
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```
3. Start the FastAPI server:
    ```
    uvicorn app.main:app --reload
    ```
    The backend API should now be running at `http://localhost:8000.`

### **Conclusion**
This project demonstrates an AI-powered system for interacting with PDF content using a conversational interface. It leverages FastAPI for handling the backend logic and React for a dynamic and user-friendly frontend. Users can upload PDF files, ask questions about the content, and receive AI-generated answers in real-time.