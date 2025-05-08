from rest_framework import serializers
from .models import Enroll, User, Roadmap

class EnrollSerializer(serializers.ModelSerializer):
    UserID = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    RoadmapID = serializers.PrimaryKeyRelatedField(queryset=Roadmap.objects.all())

    class Meta:
        model = Enroll
        fields = ['id', 'UserID', 'RoadmapID', 'start_at', 'completed_at']

    def validate_UserID(self, value):
        if not User.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Người dùng không tồn tại.")
        return value

    def validate_RoadmapID(self, value):
        if not Roadmap.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Roadmap không tồn tại.")
        return value

    def create(self, validated_data):
        # Automatically handle the ForeignKey relation
        user = validated_data.pop('UserID')  
        roadmap = validated_data.pop('RoadmapID')
        # Create Enroll object using foreign key relationships
        return Enroll.objects.create(UserID=user, RoadmapID=roadmap, **validated_data)

    def update(self, instance, validated_data):
        instance.UserID = validated_data.get('UserID', instance.UserID)
        instance.RoadmapID = validated_data.get('RoadmapID', instance.RoadmapID)
        instance.start_at = validated_data.get('start_at', instance.start_at)
        instance.completed_at = validated_data.get('completed_at', instance.completed_at)
        instance.save()
        return instance

    def delete(self, instance):
        instance.delete()
