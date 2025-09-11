from django.urls import path
from . import views

urlpatterns = [
    # WebService endpoints
    path("webservice/add/", views.add, name="add"),
    path("webservice/all/", views.get_all, name="get_all"),
    path("webservice/<int:id>/", views.get, name="get"),
    path("webservice/<int:id>/update/", views.update, name="update"),
    path("webservice/<int:id>/delete/", views.delete, name="delete"),
    # WebStatus endpoints
  
    path(
        "webservice/<int:service_id>/webstatus/",
        views.get_webstatus_by_service,
        name="get_webstatus_by_service",
    ),
]
  # path("webstatus/all/", views.get_all_webstatus, name="get_all_webstatus"),
    # path("webstatus/<int:id>/", views.get_webstatus, name="get_webstatus"),