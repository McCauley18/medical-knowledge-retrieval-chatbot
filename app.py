from flask import Flask, render_template, request, jsonify
import json
import datetime
from src.rag import rag_chain
 
 

app = Flask(__name__)

# In-memory storage for conversations (replace with database in production)
conversations = {}


# @app.route("/get", methods=["POST"])
# def chatsupply():
#     msg = request.form["msg"]
#     response = rag_chain.invoke({"input": msg})
#     return response["answer"]


# Medical knowledge base (simplified - in production, use proper medical API)
MEDICAL_KB = {
    "symptoms": {
        "headache": "Headaches can have many causes. If severe or persistent, consult a doctor. Rest and hydration may help.",
        "fever": "Fever is often a sign of infection. Rest, stay hydrated, and monitor temperature. Seek help if above 103°F.",
        "cough": "Stay hydrated and rest. If accompanied by difficulty breathing, seek immediate medical attention.",
        "fatigue": "Ensure adequate sleep and nutrition. Persistent fatigue may require medical evaluation.",
        "nausea": "Sip clear fluids and eat bland foods. If severe or with vomiting, consult a doctor."
    },
    "advice": {
        "emergency": "For emergencies like chest pain, difficulty breathing, or severe injury, call emergency services immediately.",
        "general": "Maintain a healthy lifestyle with balanced diet, regular exercise, and adequate sleep.",
        "prevention": "Wash hands regularly, stay up-to-date with vaccinations, and have regular check-ups."
    }
}

def get_bot_response(user_input, conversation_id):
    """Process user input and return bot response"""
    user_input = user_input.lower().strip()
    
    # Check for emergency keywords
    emergency_keywords = ['emergency', 'urgent', '10177', 'help', 'chest pain', 'difficulty breathing', 'bleeding', 'unconscious']
    if any(keyword in user_input for keyword in emergency_keywords):
        return {
            "text": " **EMERGENCY ALERT** \n\nYour message contains keywords suggesting a medical emergency. Please call emergency services (10177 or your local emergency number) immediately or go to the nearest emergency room.",
            "type": "emergency",
            "timestamp": datetime.datetime.now().strftime("%H:%M")
        }
    
    # Check for symptoms
    for symptom, advice in MEDICAL_KB['symptoms'].items():
        if symptom in user_input:
            return {
                "text": f"Regarding **{symptom}**:\n\n{advice}\n\n*Note: This is general information only. For personal medical advice, consult a healthcare professional.*",
                "type": "symptom",
                "timestamp": datetime.datetime.now().strftime("%H:%M")
            }
    
    # Check for general advice
    for topic, advice in MEDICAL_KB['advice'].items():
        if topic in user_input:
            return {
                "text": f"{advice}",
                "type": "advice",
                "timestamp": datetime.datetime.now().strftime("%H:%M")
            }
    
    # Default response
    default_responses = [
        "I'm here to provide general health information. Can you tell me more about your symptoms or concerns?",
        "For accurate medical advice, please consult with a healthcare professional. How can I assist you with general health information?",
        "I can provide information on common symptoms and general health advice. What would you like to know?"
    ]
    
    return {
        "text": "I understand you're mentioning: '" + user_input + "'. " + default_responses[len(user_input) % len(default_responses)],
        "type": "general",
        "timestamp": datetime.datetime.now().strftime("%H:%M")
    }

@app.route('/')
def home():
    return render_template('chatui.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.json
    user_input = data.get('message', '')
    conversation_id = data.get('conversation_id', 'default')

    # Emergency check FIRST
    emergency_keywords = [
        'emergency', 'urgent', '10177', 'help',
        'chest pain', 'difficulty breathing',
        'bleeding', 'unconscious'
    ]

    if any(k in user_input.lower() for k in emergency_keywords):
        return jsonify({
            "success": True,
            "response": {
                "text": "**EMERGENCY ALERT** \n\nPlease contact emergency services (10177) immediately.",
                "type": "emergency",
                "timestamp": datetime.datetime.now().strftime("%H:%M")
            }
        })

    # RAG QUERY (THIS IS THE KEY)
    if is_medical_question(user_input):
        result = rag_chain.invoke({"input": user_input})
        answer = result["answer"]
    else:
        answer = "Hello! I’m here to help with medical questions. Ask me about a disease, symptom, or condition."


    return jsonify({
        "success": True,
        "response": { 
            "text": answer,
            "type": "rag",
            "timestamp": datetime.datetime.now().strftime("%H:%M")
        },
        "conversation_id": conversation_id
    })

def is_medical_question(text: str) -> bool:
    medical_keywords = [
        "what is", "define", "symptoms", "treatment",
        "cause", "disease", "condition", "infection",
        "diagnosis", "medicine", "cholera", "diabetes",
        "hypertension", "cancer", "syndrome"
    ]

    text = text.lower()
    return any(k in text for k in medical_keywords)



@app.route('/clear_chat', methods=['POST'])
def clear_chat():
    data = request.json
    conversation_id = data.get('conversation_id', 'default')
    
    if conversation_id in conversations:
        conversations[conversation_id] = []
    
    return jsonify({"success": True})

@app.route('/get_disclaimer', methods=['GET'])
def get_disclaimer():
    disclaimer = {
        "text": "**IMPORTANT DISCLAIMER**\n\nThis chatbot provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.",
        "type": "disclaimer"
    }
    return jsonify(disclaimer)





if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8082)
