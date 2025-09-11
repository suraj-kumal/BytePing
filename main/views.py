from django.shortcuts import render
from .serializers import WebServiceSerializer, WebstatusSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import WebService, Webstatus
from django.utils.timezone import now
from django.db.models import Count, Q, Avg
from datetime import timedelta


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add(request):
    serializer = WebServiceSerializer(data=request.data)
    if serializer.is_valid():
        webservice = serializer.save(user=request.user)
        return Response(
            {
                "success": True,
                "message": "added successfully",
                "webservice": WebServiceSerializer(webservice).data,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(
        {"success": False, "error": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all(request):
    try:
        webservices = WebService.objects.filter(user=request.user)
        serializer = WebServiceSerializer(webservices, many=True)
        return Response(
            {"success": True, "webservices": serializer.data},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"success": False, "error": "An unexpected error occurred."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get(request, id):
    try:
        webservice = WebService.objects.get(id=id, user=request.user)
        serializer = WebServiceSerializer(webservice)
        return Response(
            {"success": True, "webservice": serializer.data}, status=status.HTTP_200_OK
        )
    except WebService.DoesNotExist:
        return Response(
            {"success": False, "error": "WebService not found for this user."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return Response(
            {"success": False, "error": "An unexpected error occurred."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update(request, id):
    try:
        webservice = WebService.objects.get(id=id, user=request.user)
    except WebService.DoesNotExist:
        return Response(
            {"success": False, "error": "WebService not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = WebServiceSerializer(
        instance=webservice, data=request.data, partial=True
    )

    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "success": True,
                "message": "updated successfully",
                "webservice": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    else:
        print(serializer.errors)
        return Response(
            {"success": False, "error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete(request, id):
    try:
        webservice = WebService.objects.get(id=id, user=request.user)
        webservice.delete()
        return Response(
            {
                "success": True,
                "message": "webservice removed",
            },
            status=status.HTTP_200_OK,
        )
    except WebService.DoesNotExist:
        return Response(
            {"success": False, "error": "WebService not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return Response(
            {"success": False, "error": "An unexpected error occurred."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


#


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_webstatus_by_service(request, service_id):
    """
    Get all webstatus entries for a specific webservice
    """
    try:
        # First check if the webservice belongs to the user
        webservice = WebService.objects.get(id=service_id, user=request.user)

        webstatus_list = Webstatus.objects.filter(webservice=webservice).order_by(
            "-date_and_time"
        )

        serializer = WebstatusSerializer(webstatus_list, many=True)
        return Response(
            {
                "success": True,
                "webstatus": serializer.data,
                "webservice": WebServiceSerializer(webservice).data,
                "count": webstatus_list.count(),
            },
            status=status.HTTP_200_OK,
        )
    except WebService.DoesNotExist:
        return Response(
            {"success": False, "error": "WebService not found for this user."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        print(e)
        return Response(
            {"success": False, "error": "An unexpected error occurred."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def get_webstatus(request, id):
#     """
#     Get a specific webstatus entry with insights for its associated webservice
#     """
#     try:
#         webstatus = Webstatus.objects.get(id=id, webservice__user=request.user)
#     except Webstatus.DoesNotExist:
#         return Response(
#             {"success": False, "error": "Webstatus does not exist."},
#             status=status.HTTP_404_NOT_FOUND,
#         )

#     # Get all Webstatus entries for THIS specific webservice only
#     service_statuses = Webstatus.objects.filter(webservice=webstatus.webservice)

#     # Total checks for this service
#     total_checks = service_statuses.count()

#     # Uptime percentage for this service
#     uptime_checks = service_statuses.filter(status=True).count()
#     uptime_percentage = (uptime_checks / total_checks) * 100 if total_checks else 0

#     # Average ping for this service
#     avg_ping = service_statuses.aggregate(Avg("ping"))["ping__avg"]

#     # Last downtime for this service
#     last_downtime_entry = (
#         service_statuses.filter(status=False).order_by("-date_and_time").first()
#     )
#     last_downtime = last_downtime_entry.date_and_time if last_downtime_entry else None

#     # Downtime count for this service
#     downtime_count = service_statuses.filter(status=False).count()

#     # Recent 7-day uptime percentage for this service
#     seven_days_ago = now() - timedelta(days=7)
#     recent_statuses = service_statuses.filter(date_and_time__gte=seven_days_ago)
#     total_recent = recent_statuses.count()
#     recent_uptime = recent_statuses.filter(status=True).count()
#     recent_uptime_percentage = (
#         (recent_uptime / total_recent) * 100 if total_recent else 0
#     )

#     # Serialize the individual webstatus requested
#     serializer = WebstatusSerializer(webstatus)

#     # Build response
#     return Response(
#         {
#             "success": True,
#             "webstatus": serializer.data,
#             "webservice_insights": {  # Changed name to be more clear
#                 "webservice_id": webstatus.webservice.id,
#                 "uptime_percentage": round(uptime_percentage, 2),
#                 "average_ping": round(avg_ping, 2) if avg_ping is not None else None,
#                 "last_downtime": last_downtime,
#                 "downtime_count": downtime_count,
#                 "recent_7d_uptime_percentage": round(recent_uptime_percentage, 2),
#                 "total_checks": total_checks,
#             },
#         },
#         status=status.HTTP_200_OK,
#     )


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def get_all_webstatus(request):
#     """
#     Get all webstatus entries for all webservices owned by the current user
#     """
#     try:
#         webstatus_list = Webstatus.objects.filter(
#             webservice__user=request.user
#         ).order_by("-date_and_time")

#         if not webstatus_list.exists():
#             return Response(
#                 {
#                     "success": True,
#                     "webstatus": [],
#                     "message": "No webstatus entries found.",
#                 },
#                 status=status.HTTP_200_OK,
#             )

#         serializer = WebstatusSerializer(webstatus_list, many=True)
#         return Response(
#             {
#                 "success": True,
#                 "webstatus": serializer.data,
#                 "count": webstatus_list.count(),
#             },
#             status=status.HTTP_200_OK,
#         )
#     except Exception as e:
#         return Response(
#             {"success": False, "error": "An unexpected error occurred."},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         )
