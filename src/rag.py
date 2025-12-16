from langchain_community.vectorstores import FAISS
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.llms import HuggingFacePipeline
from transformers import pipeline
from src.helper import download_embedding
from src.prompt import system_prompt

# Load embeddings
embedding = download_embedding()

# Load FAISS index
docsearch = FAISS.load_local(
    "faiss_index",
    embedding,
    allow_dangerous_deserialization=True
)

# Retriever
retriever = docsearch.as_retriever(search_kwargs={"k": 3})

# LLM (Flan-T5 Base)
hf_pipeline = pipeline(
    task="text2text-generation",
    model="google/flan-t5-base",
    max_new_tokens=256,
    temperature=0.1,
    do_sample=False
)

chatModel = HuggingFacePipeline(pipeline=hf_pipeline)

# Prompt
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}")
    ]
)

# Chains
question_answer_chain = create_stuff_documents_chain(chatModel, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)
