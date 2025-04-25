import logging
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User

logger = logging.getLogger(__name__)

class AuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.allow_any_paths = [
            '/api/register/',
            '/api/social-register/',
            '/api/login/',
            '/api/social-login/',
            '/api/password/reset-email/',
            '/api/password/reset/',
        ]
        self.allow_any_prefixes = [
            '/api/roadmaps/',
            '/api/topics/',
            '/api/topic-roadmap/',
            '/api/resource_types/',
            '/api/resources/',
            '/api/exercises/',
            '/api/quizquestions/',
            '/api/quizanswers/',
        ]

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        logger.info(f"Processing request: {request.method} {request.path}")

        if request.path in self.allow_any_paths:
            logger.info(f"Skipping authentication for path: {request.path}")
            return None

        if request.method == 'GET' and any(request.path.startswith(prefix) for prefix in self.allow_any_prefixes):
            logger.info(f"Skipping authentication for GET request on path: {request.path}")
            return None

        logger.info(f"Requiring authentication for {request.method} request on path: {request.path}")

        auth_header = request.headers.get('Authorization')
        if not auth_header:
            logger.warning("No token provided in Authorization header")
            return JsonResponse(
                {'success': False, 'message': 'No token provided'},
                status=401
            )

        if not auth_header.startswith('Bearer '):
            logger.warning("Invalid token format in Authorization header")
            return JsonResponse(
                {'success': False, 'message': 'Invalid token format'},
                status=401
            )

        token = auth_header.split(' ')[1]
        if not token:
            logger.warning("Token is empty in Authorization header")
            return JsonResponse(
                {'success': False, 'message': 'Token is empty'},
                status=401
            )

        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            role = access_token['role'].strip().lower()
            logger.info(f"Decoded user_id: {user_id} (type: {type(user_id)}), role: {role} (type: {type(role)})")

            user = User.objects.get(id=user_id)
            if not user:
                raise ValueError("User not found")

            request.user = user
            request.auth_user = {
                '_id': user_id,
                'role': role
            }
            logger.info(f"Authenticated user: {request.auth_user}")

            normalized_path = request.path.rstrip('/')
            logger.info(f"Normalized path: {normalized_path!r}, Condition: {normalized_path != '/api/users'!r}")
            if normalized_path.startswith('/api/users') and normalized_path != '/api/users':
                user_id_from_path = view_kwargs.get('id', '')
                if not user_id_from_path:
                    path_parts = normalized_path.split('/api/users')[1].split('/')
                    user_id_from_path = path_parts[1] if len(path_parts) > 1 else ''
                logger.info(f"User ID from path: {user_id_from_path}")
                if user_id_from_path and user_id_from_path != request.auth_user['_id']:
                    logger.info(f"Comparing role: {role} with 'admin'")
                    if role != 'admin':
                        logger.warning(f"User {request.auth_user['_id']} attempted to access data of user {user_id_from_path}")
                        return JsonResponse(
                            {'success': False, 'message': 'You can only access your own data'},
                            status=403
                        )
                    else:
                        logger.info("User is admin, allowing access to other user's data")

        except TokenError as e:
            logger.error(f"Invalid or expired token: {str(e)}")
            return JsonResponse(
                {'success': False, 'message': 'Invalid or expired token', 'error': str(e)},
                status=401
            )
        except User.DoesNotExist:
            logger.error(f"User with id {user_id} not found")
            return JsonResponse(
                {'success': False, 'message': 'User not found'},
                status=401
            )
        except KeyError as e:
            logger.error(f"Token missing required field: {str(e)}")
            return JsonResponse(
                {'success': False, 'message': f'Token missing required field: {str(e)}'},
                status=401
            )
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return JsonResponse(
                {'success': False, 'message': 'Authentication failed', 'error': str(e)},
                status=500
            )

        logger.info("Middleware processing complete, passing to view")
        return None