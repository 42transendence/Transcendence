from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import LimitOffsetPagination
from users.models import User
from .models import Friend, FriendRequest
from .serializers import FriendSerializer, FriendRequestSerializer, UsernameSerializer

class FriendsListPagination(LimitOffsetPagination):
    default_limit = 6  # 기본 한 페이지에 6개 항목
    max_limit = 10  # 최대 한 페이지에 10개 항목

class FriendsListAPIView(APIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)
    pagination_class = FriendsListPagination

    @swagger_auto_schema(
        operation_description="Get a list of friends",
        responses={
            200: openapi.Response(
                description="Successful response",
            ),
            400: openapi.Response(
                description="Bad request",
            )
        }
    )
    def get(self, request): #친구 리스트 불러오기
        try:
            user = request.user
            friends = Friend.objects.filter(user=user)
            total = friends.count()
            paginator = self.pagination_class()
            paginated_friends = paginator.paginate_queryset(friends, request, view=self)
            serializer = FriendSerializer(paginated_friends, many=True)
            response_data = {
                'total': total,
                'friends': serializer.data
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Delete a friend",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'friend_name': openapi.Schema(type=openapi.TYPE_STRING, description='Name of the friend to delete')
            },
            required=['friend_name']
        ),
        responses={
            200: openapi.Response(
                description="Friend successfully deleted",
            ),
            400: openapi.Response(
                description="Bad request",
            )
        }
    )
    def patch(self, request): #친구 삭제
        try:
            user = request.user
            Friend.delete_friend(user, request.data['friend_name'])
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class WaitingListAPIView(APIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)

    @swagger_auto_schema(
        operation_description="Get the list of friend requests",
        responses={
            200: openapi.Response(
                description="Successful response",
            ),
            400: openapi.Response(
                description="Bad request",
            )
        }
    )
    def get(self, request):
        try:
            user = request.user
            friend_requests = FriendRequest.objects.filter(user=user)
            serializer = FriendRequestSerializer(friend_requests, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Process a friend request",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'friend_name': openapi.Schema(type=openapi.TYPE_STRING, description='Name of the friend'),
                'request_patch': openapi.Schema(type=openapi.TYPE_INTEGER, description='Friend request action (1 for accept, 0 for reject)')
            },
            required=['friend_name', 'request_patch']
        ),
        responses={
            200: openapi.Response(
                description="Request processed successfully"
            ),
            400: openapi.Response(
                description="Bad request",
            )
        }
    )

    def patch(self, request):
        user = request.user
        friend_name = request.data['friend_name']
        request_patch = request.data['request_patch'] #친구 수락 1, 친구 거부 0
        if not friend_name or not request_patch:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        friend_request = FriendRequest.objects.filter(user=user, friend_name=friend_name)
        if not friend_request:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        friend_request.delete_request(user=user, friend_name=friend_name)
        if request_patch:
            Friend.create_friend(user, friend_name)
        return Response(status=status.HTTP_200_OK)


class AddListAPIView(APIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)

    @swagger_auto_schema(
        operation_description="Get users with search_name",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'search_name': openapi.Schema(type=openapi.TYPE_STRING, description='Search term for username')
            },
            required=['search_name']
        ),
        responses={
            200: openapi.Response(
                description="Successful response",
            ),
            400: openapi.Response(
                description="Bad request",
            )
        }
    )
    def get(self, request): #search_name을 포함하는 모든 user 반환
        try:
            user = request.user
            search_name = request.data['search_name']
            serializer = UsernameSerializer(User.objects.filter(username__contain=search_name), many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Send a friend request",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'friend_name': openapi.Schema(type=openapi.TYPE_STRING, description='Username of the friend to send request')
            },
            required=['friend_name']
        ),
        responses={
            200: openapi.Response(
                description="Friend request sent successfully"
            ),
            400: openapi.Response(
                description="Bad request",
            )
        }
    )
    def patch(self, request):
        user = request.user
        friend_name = request.data['friend_name']
        if not friend_name:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        send_user = User.objects.filter(username=friend_name)
        if not send_user:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        FriendRequest.create_friend(user=send_user, friend_name=user.username)
        return Response(status=status.HTTP_200_OK)