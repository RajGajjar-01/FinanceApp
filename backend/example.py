from groq import Groq
import base64
import json

client = Groq(api_key="sdfasd")

# Function to encode image to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Load your local image
image_path = "receipt.jpg"  # Replace with your image path
base64_image = encode_image('/home/rajgajjar_04/Languages/FinanceApp/backend/img.webp')

completion = client.chat.completions.create(
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """
                    Analyze this receipt image and extract the total amount in JSON format:
                    
                    {
                        "vendor": "store name",
                        "total": "final amount (numbers only)",
                        "currency": "currency symbol",
                        "date": "transaction date",
                        "expense_category": "groceries/restaurant/shopping/travel/other"
                    }
                    """
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ],
    temperature=0.1,
    max_completion_tokens=1024,
)

print(completion.choices[0].message.content)
