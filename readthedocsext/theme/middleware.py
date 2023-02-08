from django.contrib.auth.middleware import AuthenticationMiddleware
from django.contrib.auth.models import AnonymousUser


class BetaAuthenticationMiddleware(AuthenticationMiddleware):
    def process_request(self, request):
        """
        Require special permissions for beta access.

        Require staff flag, but could be feature flag too.
        """
        super().process_request(request)
        if request.user and not request.user.is_staff:
            request.user = AnonymousUser()
