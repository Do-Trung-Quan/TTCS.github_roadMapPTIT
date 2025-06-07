import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from django.conf import settings

# Tùy chỉnh Authentication để bỏ qua CSRF
class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

# View để xử lý yêu cầu Chatbot
class ChatbotView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = [AllowAny]

    def post(self, request):
        # Lấy tin nhắn từ dữ liệu request
        message = request.data.get('message', '').strip()

        # Kiểm tra nếu tin nhắn trống
        if not message:
            return Response({"error": "Message content not specified."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Lấy API Key từ settings.py
            api_key = settings.GEMINI_API_KEY

            # Kiểm tra nếu API Key không tồn tại
            if not api_key:
                return Response(
                    {"error": "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": message}
                        ]
                    }
                ]
            }

            # Gửi yêu cầu POST đến Gemini API
            response = requests.post(api_url, headers=headers, json=payload)
            response.raise_for_status()  

            data = response.json()

            # Trích xuất nội dung phản hồi từ chatbot
            if 'candidates' in data and len(data['candidates']) > 0 and \
               'content' in data['candidates'][0] and 'parts' in data['candidates'][0]['content'] and \
               len(data['candidates'][0]['content']['parts']) > 0 and 'text' in data['candidates'][0]['content']['parts'][0]:
                response_text = data['candidates'][0]['content']['parts'][0]['text']
                # Format lại phản hồi thành JSON có cấu trúc
                formatted_response = self.format_response(response_text)
                return Response({"response": formatted_response})
            else:
                return Response(
                    {"error": "Invalid response format from Gemini API", "full_response": data},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except requests.exceptions.HTTPError as e:
            error_message = str(e)
            error_detail = {}
            try:
                error_detail = e.response.json()
                error_message += f" - Detail: {error_detail}"
            except:
                pass
            return Response(
                {"error": f"Failed to connect to Gemini API: {error_message}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except requests.exceptions.ConnectionError:
            return Response(
                {"error": "Network connection error. Please check your internet connection."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except requests.exceptions.Timeout:
            return Response(
                {"error": "Request to Gemini API timed out. Please try again."},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def format_response(self, text):
        # Tách phản hồi thành các phần có cấu trúc
        sections = []
        current_section = None
        current_items = []
        current_subsection = None
        current_subitems = []

        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Kiểm tra các tiêu đề chính
            if line.startswith('**') and line.endswith('**'):
                if current_section:
                    # Lưu section trước đó
                    if current_subitems:
                        current_items.append({"subsection": current_subsection, "items": current_subitems})
                        current_subitems = []
                    sections.append({"title": current_section, "items": current_items})
                current_section = line.replace('**', '')
                current_items = []
                current_subsection = None
            # Kiểm tra các tiêu đề phụ
            elif line.startswith('* **') and line.endswith(':**'):
                if current_subitems:
                    current_items.append({"subsection": current_subsection, "items": current_subitems})
                current_subsection = line.replace('* **', '').replace(':**', '')
                current_subitems = []
            # Kiểm tra các mục con
            elif line.startswith('* '):
                current_subitems.append(line.replace('* ', ''))
            else:
                current_items.append({"text": line})

        # Lưu section cuối cùng
        if current_section:
            if current_subitems:
                current_items.append({"subsection": current_subsection, "items": current_subitems})
            sections.append({"title": current_section, "items": current_items})

        return sections