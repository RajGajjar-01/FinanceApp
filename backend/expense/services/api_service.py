from groq import Groq
import base64
import json
from PIL import Image
import io

def scan_receipt_with_groq(image_path, api_key):

    """Scan receipt using Groq API and return structured data"""
    try:
        client = Groq(api_key=api_key)
        
        
        with Image.open(image_path) as img:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
            
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=85)
            base64_image = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

        completion = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{
                "role": "user",
                "content": [{
                    "type": "text",
                    "text": """
                    Extract receipt data as JSON. Categories must be one of: FOOD, GROCERIES, TRANSPORT, FUEL, BILLS, RENT, INSURANCE, HEALTHCARE, SHOPPING, CLOTHING, ENTERTAINMENT, EDUCATION, TRAVEL, FITNESS, PERSONAL_CARE, SUBSCRIPTIONS, HOME_IMPROVEMENT, MAINTENANCE, OTHER.

                    Return only this JSON structure and noting else:
                    {
                        "amount": "numeric total only",
                        "description": "vendor name + purchase type",
                        "category": "exact category from list above",
                        "date": "YYYY-MM-DD format",
                        "vendor": "store name",
                        "type": "EXPENSE"
                    }
                    """
                }, {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                }]
            }],
            temperature=0.1,
            max_completion_tokens=512,
        )

        response_content = completion.choices[0].message.content
        if response_content.startswith('```'):
            response_content = response_content.replace('```', '').strip()
       
        parsed_data = json.loads(response_content)
        required_fields = ['amount', 'description', 'category', 'date']
        for field in required_fields:
            print(field)
            if field not in parsed_data:
                raise ValueError(f"Missing field: {field}")
        
        parsed_data['type'] = 'EXPENSE'
        print(parsed_data)
        return parsed_data, None
        
    except Exception as e:
        
        print("gerer")
        return None, f"Processing error: {str(e)}"
