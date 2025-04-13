from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CityViewSet, StopViewSet, RouteOptimizationInputView, CityListView

router = DefaultRouter()
router.register(r'cities', CityViewSet)
router.register(r'stops', StopViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/optimize/', RouteOptimizationInputView.as_view(), name='route-optimization-input'),
    path('api/cities/', CityListView.as_view(), name='cities-list'),
]