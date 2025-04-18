from django.db import models

class AutoIDModel(models.Model):
    id = models.CharField(primary_key=True, editable=False, max_length=10)

    PREFIX = ''  # override in subclasses
    ID_PADDING = 3  # e.g: RM001

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.id:
            last = self.__class__.objects.order_by('-id').first()
            if last and last.id.startswith(self.PREFIX):
                num = int(last.id[len(self.PREFIX):]) + 1
            else:
                num = 1
            self.id = f"{self.PREFIX}{str(num).zfill(self.ID_PADDING)}"
        super().save(*args, **kwargs)

