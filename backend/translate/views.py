# translate/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from deep_translator import GoogleTranslator

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

class TranslateAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        text = request.data.get('text')
        target_lang = request.data.get('target_lang')  # 'vi' hoặc 'en'

        if not text or not target_lang:
            return Response({
                'message': 'Vui lòng cung cấp text và target_lang.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if target_lang not in ['vi', 'en']:
            return Response({
                'message': 'Ngôn ngữ không được hỗ trợ. Chỉ hỗ trợ "vi" hoặc "en".'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            translated = GoogleTranslator(source='auto', target=target_lang).translate(text)
            return Response({
                'message': 'Dịch thành công.',
                'translated_text': translated
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'message': 'Lỗi khi dịch.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)