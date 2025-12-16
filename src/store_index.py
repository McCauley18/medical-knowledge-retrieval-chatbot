# from langchain_community.vectorstores import FAISS
# from src.helper import load_medicalpdf, extract_important_content, download_embedding, document_chunking

# Load & process data
# extracted_data = load_medicalpdf("../data/")
# filter_data = extract_important_content(extracted_data)
# text_chunks = document_chunking(filter_data)

# Embeddings
# embeddings = download_embedding()

# Create FAISS index
# docsearch = FAISS.from_documents(
#     documents=text_chunks,
#     embedding=embeddings
# )

# Save locally
# docsearch.save_local("faiss_index")

# print("FAISS index created and saved")
