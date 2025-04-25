from rest_framework import serializers
from .models import User, Roadmap, Bookmark

class BookmarkSerializer(serializers.ModelSerializer):
    UserID = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    RoadmapID = serializers.PrimaryKeyRelatedField(queryset=Roadmap.objects.all())
    saved_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'UserID', 'RoadmapID', 'saved_at']

    def create(self, validated_data):
        return Bookmark.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.UserID = validated_data.get('UserID', instance.UserID)
        instance.RoadmapID = validated_data.get('RoadmapID', instance.RoadmapID)
        instance.save()
        return instance
