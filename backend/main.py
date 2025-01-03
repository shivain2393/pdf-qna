from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import pymupdf
from llama_index.core import VectorStoreIndex, Document
from llama_index.core import StorageContext, load_index_from_storage
from llama_index.core.text_splitter import TokenTextSplitter
from config import UPLOAD_DIR, INDEX_DIR, max_tokens, embed_model, qa_pipeline, tokenizer
import os

# Initialize FastAPI application
app = FastAPI()
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

# CORS Middleware allows communication between frontend and backend (for local development in this case)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],  # Frontend origin that is allowed to access the API
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Clean text by replacing new lines and excessive spaces
def clean_text(text: str) -> str:
    text = text.replace("\n", " ").strip()  # Remove new lines and extra spaces
    text = ' '.join(text.split())  # Normalize spaces to a single space
    return text

# Extract text from a PDF file using pymupdf
def extract_text_from_pdf(file_path: Path) -> str:
    text = ""
    doc = pymupdf.open(file_path)  # Open the PDF document

    # Loop through each page and extract text
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)  # Load each page
        text += page.get_text("text")  # Append the extracted text from the page
    
    return text

# Sanitize the filename by replacing spaces with hyphens
def sanitize_filename(filename: str) -> str:
    """Replace spaces in the filename with hyphens."""
    return filename.replace(" ", "-")

# Endpoint to upload a PDF file, process it, and create an index
@app.post("/upload/")  
async def upload_file(file: UploadFile = File(...)):
    # Check if the uploaded file is a PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Sanitize the filename to avoid issues with spaces
    sanitized_filename = sanitize_filename(file.filename)
    file_path = UPLOAD_DIR / sanitized_filename

    # Save the uploaded file to the server
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract and clean the text from the uploaded PDF
    text = extract_text_from_pdf(file_path)
    cleaned_text = clean_text(text)

    # Create a document object with the cleaned text
    document = Document(text=cleaned_text)

    # Split the text into chunks for easier indexing
    splitter = TokenTextSplitter(chunk_size=500, chunk_overlap=50)
    index = VectorStoreIndex.from_documents([document], splitter=splitter)
    
    # Save the generated index to disk
    index_path = INDEX_DIR / f"{file_path.stem}_index"
    index.storage_context.persist(persist_dir=str(index_path))

    return JSONResponse(content={"message": "File processed successfully"})

# Endpoint to ask a question about a previously uploaded PDF
@app.post("/ask/")  
async def ask_question(filename: str, question: str):
    # Sanitize the filename to match the index file naming convention
    sanitized_filename = sanitize_filename(filename)
    index_path = INDEX_DIR / f"{Path(sanitized_filename).stem}_index"
    
    # Check if the index file for the document exists
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Load the index from storage
    storage_context = StorageContext.from_defaults(persist_dir=str(index_path))
    index = load_index_from_storage(storage_context)
    
    # Retrieve relevant information from the index
    retriever = index.as_retriever(similarity_top_k=10)  # Retrieve top 10 most relevant nodes
    nodes = retriever.retrieve(question)
    
    # If relevant information is found, process it
    if nodes:
        context = " ".join([node.text for node in nodes])  # Combine the retrieved text fragments
        
        # Tokenize the context and split it into chunks that fit the model's max token limit
        tokens = tokenizer.tokenize(context)
        chunks = []
        
        # Split the tokens into chunks based on the max token limit
        while len(tokens) > max_tokens:
            chunk = tokens[:max_tokens]
            chunks.append(tokenizer.convert_tokens_to_string(chunk))
            tokens = tokens[max_tokens:]
        
        # Add any remaining tokens as the last chunk
        if tokens:
            chunks.append(tokenizer.convert_tokens_to_string(tokens))
        
        # Collect answers for each chunk
        answers = []
        for chunk in chunks:
            answer = qa_pipeline(question=question, context=chunk)
            answers.append(answer["answer"])
        
        # Combine all the answers into one response
        combined_answer = " ".join(answers)
        
        # Limit the length of the combined answer if it's too long
        if len(combined_answer) > 200:
            combined_answer = combined_answer[:200]
        
        return JSONResponse(content={"answer": combined_answer})
    
    # If no relevant information was found
    return JSONResponse(content={"answer": "No relevant information found."})
