# copy from notebok
# from langchain.document_loaders import PyPDFLoader, DirectoryLoader
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from typing import List
# from langchain.schema import Document
from langchain.embeddings import HuggingFaceEmbeddings

def download_embedding():
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    embeddings = HuggingFaceEmbeddings(model_name=model_name)
    return embeddings


# def load_medicalpdf(data): 
#     loader = DirectoryLoader(
#         data,
#         glob="*.pdf",
#         loader_cls=PyPDFLoader
#     )

#     documents = loader.load()
#     return documents



# def extract_important_content(docs: List[Document]) -> List[Document]: 
    
#     minimal_docs: List[Document] = []
#     for doc in docs:
#         src = doc.metadata.get("source")
#         minimal_docs.append(
#             Document(
#                 page_content = doc.page_content,
#                 metadata = {"source":src}
#             )
#         )
#     return minimal_docs

# split documents into smaller chunks
# def document_chunking(min_docs):
#     text_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=1000,
#         chunk_overlap=100
#     )
#     text_chunk = text_splitter.split_documents(min_docs)
#     return text_chunk

