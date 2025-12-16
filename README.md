# medical-knowledge-retrieval-chatbot

Medical Knowledge Retrieval Chatbot (RAG-Based)

A Retrieval-Augmented Generation (RAG) medical chatbot that enables users to query medical knowledge from uploaded PDF documents. The system uses FAISS for efficient vector search, Hugging Face embeddings & LLMs, and a Flask web interface to deliver accurate, context-aware health information.

Disclaimer: This application provides general medical information only and is not a substitute for professional medical advice, diagnosis, or treatment.

Features

- Load and process medical PDF documents
- Intelligent document chunking
- Semantic search using FAISS vector database
- RAG pipeline with Hugging Face (FLAN-T5)
- Flask-based web interface (chat UI)
- Fast local inference (no paid APIs)
- Fully offline after initial model download

Architecture Overview
PDFs → Chunking → Embeddings → FAISS Vector Store
                                  ↓
                              Retriever
                                  ↓
                          HuggingFace LLM
                                  ↓
                             Flask API
                                  ↓
                              Web UI

Tech Stack
    Component	        Technology
    Backend	Python,     Flask
    Vector Store	    FAISS
    Embeddings	        sentence-transformers (MiniLM)
    LLM	                google/flan-t5-base
    RAG Framework	    LangChain
    Frontend	        HTML, CSS, JavaScript
    Deployment	        Render / Local

📁 Project Structure
medical-knowledge-retrieval-chatbot/
│
├── app.py                # Flask application
├── store_index.py        # Builds & saves FAISS index
├── requirements.txt
│
├── src/
│   ├── helper.py         # PDF loading, chunking, embeddings
│   ├── rag.py            # RAG pipeline (retriever + LLM)
│   ├── prompt.py         # System prompt
│
├── data/                 # Medical PDF documents
                          # The-Gale-Encyclopedia-of-Medicine-3rd-Edition
│
├── faiss_index/          # Saved FAISS vector store
│   ├── index.faiss
│   └── index.pkl
│
├── templates/
│   └── chatui.html       # Web UI
│
└── README.md

Installation & Setup

1️. Create Virtual Environment
conda create -n healthbot python=3.10
conda activate healthbot

2. Install Dependencies
pip install -r requirements.txt

Preparing the Knowledge Base

Place your medical PDFs inside the data/ folder

Build the FAISS index:

python src/store_index.py


This will generate:

faiss_index/
 ├── index.faiss
 └── index.pkl

Running the Application
python app.py


Then open your browser:

http://127.0.0.1:8082