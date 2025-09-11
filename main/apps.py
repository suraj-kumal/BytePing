from django.apps import AppConfig


class MainConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "main"

    def ready(self):

        import main.signals

        import os

        if os.environ.get("RUN_MAIN", None) != "true":
            self.initialize_monitoring()

    def initialize_monitoring(self):
        """
        Initialize BytePing monitoring on server startup
        """
        try:
            from django_q.tasks import async_task
            from django.db import connection

            connection.ensure_connection()

            async_task("main.tasks.initialize_all_monitoring")
            print("BytePing: Server started - monitoring initialization queued")

        except Exception as e:
            print(f"BytePing: Could not initialize monitoring on startup - {e}")
