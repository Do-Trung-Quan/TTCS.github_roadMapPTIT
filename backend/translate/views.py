from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from google.cloud import translate_v2 as translate

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
            # Khởi tạo client translate
            client = translate.Client()

            # Kiểm tra nếu text là một chuỗi, chuyển thành mảng
            if isinstance(text, str):
                text = [text]
            elif not isinstance(text, list):
                return Response({
                    'message': 'Lỗi khi dịch.',
                    'error': 'text phải là một chuỗi hoặc danh sách các chuỗi.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Kiểm tra độ dài của từng chuỗi
            for t in text:
                if not isinstance(t, str) or len(t) > 5000:
                    return Response({
                        'message': 'Lỗi khi dịch.',
                        'error': f'"{t}" --> text phải là chuỗi hợp lệ với tối đa 5000 ký tự.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Dịch từng chuỗi trong danh sách
            translated = []
            for t in text:
                result = client.translate(t, target_language=target_lang)
                translated.append(result['translatedText'])

            return Response({
                'message': 'Dịch thành công.',
                'translated': translated
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'message': 'Lỗi khi dịch.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)