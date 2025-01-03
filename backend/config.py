from pathlib import Path
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import Settings
from transformers import pipeline, BertTokenizer

# Directories for file uploads and index storage
UPLOAD_DIR = Path('uploads')
INDEX_DIR = Path('indexes')

# Create the necessary directories if they do not exist
UPLOAD_DIR.mkdir(exist_ok=True)
INDEX_DIR.mkdir(exist_ok=True)

# Token limit for chunking the content
max_tokens = 512

# Initialize the embedding model for document indexing
embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Initialize the question-answering pipeline using a pre-trained BERT model fine-tuned on SQuAD
qa_pipeline = pipeline("question-answering", model="bert-large-uncased-whole-word-masking-finetuned-squad")

# Set the embedding model for the llama_index settings
Settings.embed_model = embed_model

# Initialize the BERT tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-large-uncased-whole-word-masking-finetuned-squad")
