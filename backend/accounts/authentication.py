from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication that doesn't enforce CSRF checks.
    Use this for API endpoints that handle authentication via other means.
    """
    def enforce_csrf(self, request):
        return  # Skip CSRF check