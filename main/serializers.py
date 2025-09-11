from .models import WebService, Webstatus
from rest_framework import serializers


class WebServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebService
        fields = (
            "id",
            "webservice_name",
            "webservice_url",
            "is_active",
            "email_alert",
            "monitor_interval",
            "expect_status_code",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        if self.instance:
            if not attrs:
                raise serializers.ValidationError("No data provided to update.")
        else:
            if not attrs.get("webservice_name") or not attrs.get("webservice_url"):
                raise serializers.ValidationError(
                    "Webservice name and URL are required."
                )
        return attrs


class WebstatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webstatus

        fields = (
            "id",
            "ping",
            "status",
            "status_code",
            "date_and_time",
            "created_at",
            "updated_at",
            "webservice_id",
        )

    def validate(self, attrs):
        ping = attrs.get("ping")
        status = attrs.get("status")
        status_code = attrs.get("date_and_time")
        webservice_id = attrs.get("webservice_id")
        if not ping and not status and not status_code and not webservice_id:
            raise serializers.ValidationError("web status information not provided")
        return attrs
