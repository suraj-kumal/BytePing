from urllib import response
import uuid
from django.conf import settings
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from authentication.serializers import (
    ForgotPasswordSerializer,
    LoginSerializer,
    SignupSerializer,
    UserSerializer,
)
from .models import User
from django.core.mail import send_mail
from django.utils.html import escape
from django.utils.safestring import mark_safe
from decouple import config

# Create your views here.


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        backend_url = settings.BACKEND_URL
        verification_url = f"{backend_url}/api/auth/email/verify/{user.id}/{user.email_verification_token}/"

        send_mail(
            subject="Verify your email",
            message=f"Please click the link to verify your email: {verification_url}",
            from_email=f"byteping {settings.DEFAULT_FROM_EMAIL}",
            recipient_list=[user.email],
            fail_silently=False,
        )
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "success": True,
                "Message": "Account created successfully. Please check your email to verify your account.",
                "user": UserSerializer(user).data,
                "token": {"refresh": str(refresh), "access": str(refresh.access_token)},
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "success": True,
                "Message": "Login Successful",
                "user": UserSerializer(user).data,
                "token": {"refresh": str(refresh), "access": str(refresh.access_token)},
            },
            status=status.HTTP_200_OK,
        )
    return Response(
        {"success": False, "error": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
            user.password_reset_token = uuid.uuid4()
            user.save()

            frontend_url = settings.FRONTEND_URL
            # Send password reset email
            reset_url = f"{frontend_url}/resetpassword?token={user.password_reset_token}&email={user.email}"
            send_mail(
                subject="Reset your password",
                message=f"Please click the link to reset your password: {reset_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response(
                {"success": True, "message": "Reset link sent to your email"},
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {"message": "Account does not exist"}, status=status.HTTP_404_NOT_FOUND
            )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password using token and email"""
    token = request.data.get("token")
    email = request.data.get("email")
    password = request.data.get("password")
    password_confirmation = request.data.get("password_confirmation")

    if not all([token, email, password, password_confirmation]):
        return Response(
            {
                "message": "Token, email, password and password_confirmation are required"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if password != password_confirmation:
        return Response(
            {"message": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 8:
        return Response(
            {"message": "Password must be at least 8 characters long"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email, password_reset_token=token)
        user.set_password(password)
        user.password_reset_token = None
        user.save()

        return Response(
            {"message": "Password reset successful"}, status=status.HTTP_200_OK
        )

    except User.DoesNotExist:
        return Response(
            {"message": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def verify_email(request, id, hash):
    """Verify email using id and hash token, return HTML response with countdown"""
    try:
        user = User.objects.get(id=id)

        if not user:
            return html_response(
                "User Not Found",
                "This tab will close in <span id='countdown'>10</span> seconds.",
                404,
            )

        if user.is_email_verified:
            return html_response(
                "Email Already Verified",
                "This tab will close in <span id='countdown'>10</span> seconds.",
                200,
            )
        expected_hash = user.email_verification_token
        if hash != expected_hash:
            return html_response(
                "Invalid Verification Link",
                "This tab will close in <span id='countdown'>10</span> seconds.",
                403,
            )

        # Mark email as verified
        user.is_email_verified = True
        user.email_verification_token = None
        user.save()

        return html_response(
            "Email Verified",
            "Thank you! Your email has been verified. This tab will close in <span id='countdown'>10</span> seconds.",
            200,
        )

    except User.DoesNotExist:
        return html_response(
            "Invalid Link",
            "User not found or already verified. This tab will close in <span id='countdown'>10</span> seconds.",
            404,
        )

    except Exception as e:
        import logging

        logging.error(f"Email verification error: {str(e)}")
        return html_response(
            "Verification Failed",
            "An error occurred. This tab will close in <span id='countdown'>10</span> seconds.",
            500,
        )


def html_response(title, message, status_code=200):
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>{escape(title)}</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                text-align: center;
                padding: 100px;
            }}
            h1 {{
                color: #2c3e50;
            }}
            p {{
                font-size: 18px;
                color: #555;
            }}
        </style>
        <script>
            let seconds = 10;
            function updateCountdown() {{
                const countdownEl = document.getElementById('countdown');
                if (seconds <= 0) {{
                    window.close();
                }} else {{
                    countdownEl.textContent = seconds;
                    seconds--;
                    setTimeout(updateCountdown, 1000);
                }}
            }}
            window.onload = updateCountdown;
        </script>
    </head>
    <body>
        <h1>{escape(title)}</h1>
        <p>{mark_safe(message)}</p>
    </body>
    </html>
    """
    return HttpResponse(html_content, content_type="text/html", status=status_code)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def resend_verification(request):
    """Resend email verification notification"""
    user = request.user

    if user.is_email_verified:
        return Response(
            {"message": "Email is already verified"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Generate new token if needed
    if not user.email_verification_token:
        user.email_verification_token = uuid.uuid4()
        user.save()

    backend_url = config(backend_url)
    # Send verification email
    verification_url = f"{backend_url}/api/auth/email/verify/{user.id}/{user.email_verification_token}/"
    send_mail(
        subject="Verify your email",
        message=f"Please click the link to verify your email: {verification_url}",
        from_email=f"byteping {settings.DEFAULT_FROM_EMAIL}",
        recipient_list=[user.email],
        fail_silently=False,
    )

    return Response(
        {"message": "Verification email sent successfully"}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user(request):
    """Get authenticated user data"""
    return Response(
        {"user": UserSerializer(request.user).data}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user and blacklist refresh token"""
    try:
        refresh_token = request.data.get("refresh_token")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"message": "Logout successful"},  # Always return success for security
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get user profile"""
    return Response(
        {"user": UserSerializer(request.user).data}, status=status.HTTP_200_OK
    )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Profile updated successfully", "user": serializer.data},
            status=status.HTTP_200_OK,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
