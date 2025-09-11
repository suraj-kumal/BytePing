import requests
import time
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django_q.tasks import schedule
from .models import WebService, Webstatus
from django_q.models import Schedule


def monitor_webservice(webservice_id):
    """
    Monitor a single web service and save the status
    """
    try:
        webservice = WebService.objects.get(id=webservice_id, is_active=True)
    except WebService.DoesNotExist:
        return f"WebService {webservice_id} not found or inactive"

    start_time = time.time()

    try:
        response = requests.get(
            webservice.webservice_url, timeout=30, allow_redirects=True
        )

        ping_time = int((time.time() - start_time) * 1000)
        status_ok = response.status_code == webservice.expect_status_code

        webstatus = Webstatus.objects.create(
            webservice=webservice,
            ping=ping_time,
            status=status_ok,
            status_code=response.status_code,
            date_and_time=timezone.now(),
        )

        if not status_ok and webservice.email_alert:
            send_alert_email(webservice, webstatus)

        return (
            f"BytePing: {webservice.webservice_name} - {'UP' if status_ok else 'DOWN'}"
        )

    except requests.exceptions.RequestException as e:
        ping_time = int((time.time() - start_time) * 1000)

        webstatus = Webstatus.objects.create(
            webservice=webservice,
            ping=ping_time,
            status=False,
            status_code=0,
            date_and_time=timezone.now(),
        )

        if webservice.email_alert:
            send_alert_email(webservice, webstatus, error=str(e))

        return f"BytePing: {webservice.webservice_name} - ERROR: {str(e)}"


def send_alert_email(webservice, webstatus, error=None):
    """
    Send BytePing email alert when web service is down
    """
    subject = f"🚨 BytePing Alert: {webservice.webservice_name} is DOWN"

    if error:
        message = f"""
BytePing Monitoring Alert

Service: {webservice.webservice_name}
URL: {webservice.webservice_url}
Status: DOWN (Connection Error)
Error: {error}
Time: {webstatus.date_and_time}
Response Time: {webstatus.ping}ms

Your service appears to be unreachable. Please check immediately.

---
BytePing Monitoring Service
        """
    else:
        message = f"""
BytePing Monitoring Alert

Service: {webservice.webservice_name}
URL: {webservice.webservice_url}
Status: DOWN
Expected Status: {webservice.expect_status_code}
Actual Status: {webstatus.status_code}
Time: {webstatus.date_and_time}
Response Time: {webstatus.ping}ms

Your service returned an unexpected status code. Please investigate.

---
BytePing Monitoring Service
        """

    try:
        send_mail(
            subject,
            message,
            f"byteping {settings.DEFAULT_FROM_EMAIL}",
            [webservice.user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"BytePing: Failed to send email alert - {e}")


def schedule_webservice_monitoring(webservice_id):
    """
    Schedule monitoring for a specific web service
    """
    try:
        webservice = WebService.objects.get(id=webservice_id)
        task_name = f"byteping_monitor_{webservice.id}"
        Schedule.objects.filter(name=task_name).delete()

        if webservice.is_active:
            schedule(
                "main.tasks.monitor_webservice",
                webservice_id,
                name=task_name,
                schedule_type="I",
                minutes=webservice.monitor_interval,
                repeats=-1,
            )
            print(f"BytePing: Scheduled monitoring for {webservice.webservice_name}")
            return f"Scheduled: {webservice.webservice_name}"
        else:
            print(
                f"BytePing: Removed schedule for inactive service {webservice.webservice_name}"
            )
            return f"Removed: {webservice.webservice_name}"

    except WebService.DoesNotExist:
        return f"WebService {webservice_id} not found"


def initialize_all_monitoring():
    """
    Initialize monitoring for all active web services
    Called when server starts
    """
    try:
        active_services = WebService.objects.filter(is_active=True)

        print(
            f"BytePing: Initializing monitoring for {active_services.count()} active services..."
        )

        for service in active_services:
            schedule_webservice_monitoring(service.id)

        print("BytePing: All monitoring tasks initialized successfully!")
        return f"Initialized monitoring for {active_services.count()} services"

    except Exception as e:
        print(f"BytePing: Error initializing monitoring - {e}")
        return f"Error: {e}"
