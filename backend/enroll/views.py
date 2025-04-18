from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Enroll
from .serializers import EnrollSerializer

class EnrollListCreate(APIView):
    def get(self, request):
        enrolls = Enroll.objects.all()
        serializer = EnrollSerializer(enrolls, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EnrollSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnrollDetail(APIView):
    def get(self, request, user_id, roadmap_id):
        try:
            enroll = Enroll.objects.get(UserID=user_id, RoadmapID=roadmap_id)
        except Enroll.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = EnrollSerializer(enroll)
        return Response(serializer.data)

    def put(self, request, user_id, roadmap_id):
        try:
            enroll = Enroll.objects.get(UserID=user_id, RoadmapID=roadmap_id)
        except Enroll.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = EnrollSerializer(enroll, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id, roadmap_id):
        try:
            enroll = Enroll.objects.get(UserID=user_id, RoadmapID=roadmap_id)
        except Enroll.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = EnrollSerializer()
        serializer.delete(enroll)
        return Response(status=status.HTTP_204_NO_CONTENT)
