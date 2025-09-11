from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.signup, name="signup"),
    path("login/", views.login, name="login"),
    path("user/", views.user, name="user"),
    path("logout/", views.logout, name="logout"),
    path(
        "email/verification-notification/",
        views.resend_verification,
        name="resend_verification",
    ),
    path("email/verify/<int:id>/<uuid:hash>/", views.verify_email, name="verify_email"),
    
    path("forgot-password/", views.forgot_password, name="forgot_password"),
    path("reset-password/", views.reset_password, name="reset_password"),

    
    path("profile/", views.profile, name="profile"),
    path("profile/update/", views.update_profile, name="update_profile"),
]
