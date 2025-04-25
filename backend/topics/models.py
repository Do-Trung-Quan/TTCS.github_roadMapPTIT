from django.db import models
from core.models import AutoIDModel

class Topic(AutoIDModel):
    PREFIX = 'TP'
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title
    
    class Meta:
        db_table = 'Topic'
        managed = False