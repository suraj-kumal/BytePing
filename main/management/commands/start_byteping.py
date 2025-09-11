from django.core.management.base import BaseCommand
from main.tasks import initialize_all_monitoring


class Command(BaseCommand):
    help = "Manually start BytePing monitoring for all active services"

    def handle(self, *args, **options):
        result = initialize_all_monitoring()
        self.stdout.write(self.style.SUCCESS(f"BytePing: {result}"))
