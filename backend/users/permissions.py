from rest_framework import permissions
import logging

logger = logging.getLogger(__name__)

class HasRolePermission(permissions.BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        if not hasattr(request, 'auth_user') or not request.auth_user:
            logger.warning("No auth_user set in request")
            return False

        user_role = request.auth_user.get('role', '')
        logger.info(f"Checking permission - User role: {user_role}, Allowed roles: {self.allowed_roles}")
        has_permission = user_role in [role.lower() for role in self.allowed_roles]
        if not has_permission:
            logger.warning(f"Permission denied - User role: {user_role}, Allowed roles: {self.allowed_roles}")
        return has_permission

class IsAdmin(HasRolePermission):
    allowed_roles = ['admin']

class IsAdminOrUser(HasRolePermission):
    allowed_roles = ['admin', 'user']

class CanAccessOwnUserData(permissions.BasePermission):
    def has_permission(self, request, view):
        # Ensure the request is authenticated
        if not hasattr(request, 'auth_user') or not request.auth_user:
            logger.warning("No auth_user set in request - authentication required")
            return False

        # Check if the path is a user detail endpoint (e.g., /api/users/US001/)
        normalized_path = request.path.rstrip('/')
        if normalized_path.startswith('/api/users') and normalized_path != '/api/users':
            # Extract user_id from the URL kwargs (preferred over manual path splitting)
            user_id_from_path = view.kwargs.get('id', '')
            if not user_id_from_path:
                logger.warning("No 'id' found in view.kwargs - check URL configuration")
                return False

            # Compare the user_id from the path with the authenticated user's ID
            authenticated_user_id = request.auth_user.get('_id', '')
            if user_id_from_path != authenticated_user_id:
                role = request.auth_user.get('role', '')
                logger.info(f"Comparing role: {role} with 'admin'")
                if role != 'admin':
                    logger.warning(f"User {authenticated_user_id} attempted to access data of user {user_id_from_path}")
                    return False
                logger.info("User is admin, allowing access to other user's data")
        return True

def can_access_own_data(user_field):
    """
    Factory function that creates a permission class to restrict access to the owner's data.
    Args:
        user_field (str): The name of the field on the model that contains the user ID
                         (e.g., 'UserID' for a ForeignKey, 'user_id' for a CharField).
    Returns:
        A permission class that can be used in permission_classes.
    """
    class CanAccessOwnData(permissions.BasePermission):
        def has_permission(self, request, view):
            if not hasattr(request, 'auth_user') or not request.auth_user:
                logger.warning("No auth_user set in request - authentication required")
                return False
            logger.info(f"Authenticated user: {request.auth_user}")
            return True

        def has_object_permission(self, request, view, obj):
            if not hasattr(request, 'auth_user') or not request.auth_user:
                logger.warning("No auth_user set in request - authentication required")
                return False

            authenticated_user_id = request.auth_user.get('_id', '')
            user_role = request.auth_user.get('role', '')

            logger.info(f"Authenticated user ID: {authenticated_user_id}, Role: {user_role}")

            # Get the user ID from the object using the specified user_field
            object_user_id = getattr(obj, user_field)

            # If the field is a ForeignKey, we need to access its 'id' attribute
            if hasattr(object_user_id, 'id'):
                object_user_id = object_user_id.id

            object_user_id = str(object_user_id)  # Ensure it's a string for comparison
            logger.info(f"Object user ID (field '{user_field}'): {object_user_id}, Type: {type(object_user_id)}")

            if user_role == 'admin':
                logger.info(f"User is admin, allowing access to object")
                return True

            logger.info(f"Comparing object_user_id: {object_user_id} with authenticated_user_id: {authenticated_user_id}")
            if object_user_id != authenticated_user_id:
                logger.warning(f"User {authenticated_user_id} attempted to access object of user {object_user_id}")
                return False

            logger.info("User accessing their own object")
            return True

    return CanAccessOwnData