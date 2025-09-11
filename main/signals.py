from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django_q.tasks import async_task
from .models import WebService
from django_q.models import Schedule


@receiver(post_save, sender=WebService)
def webservice_saved(sender, instance, created, **kwargs):
    """
    Automatically update monitoring when WebService is saved
    """
    async_task("main.tasks.schedule_webservice_monitoring", instance.id)
    if created:
        print(f"BytePing: New service '{instance.webservice_name}' added to monitoring")
    else:
        print(f"BytePing: Updated monitoring for '{instance.webservice_name}'")


@receiver(post_delete, sender=WebService)
def webservice_deleted(sender, instance, **kwargs):
    """
    Remove monitoring schedule when WebService is deleted
    """

    task_name = f"byteping_monitor_{instance.id}"
    Schedule.objects.filter(name=task_name).delete()
    print(
        f"BytePing: Removed monitoring for deleted service '{instance.webservice_name}'"
    )
