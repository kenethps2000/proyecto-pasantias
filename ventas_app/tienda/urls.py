from django.urls import path
from . import views

urlpatterns = [
    path('', views.frontend, name='frontend'),  # Página de inicio
    path('filtros/', views.filtros, name='filtros'),  # Endpoint para filtros
    path('top10/', views.top10, name='top10'),  # Endpoint para top10
    path('sales_by_month/', views.sales_by_month, name='sales_by_month'),  # Endpoint para sales_by_month
    path('utilidad/', views.utilidad, name='utilidad'),  # Endpoint para utilidad
    path('sales_variation/', views.sales_variation, name='sales_variation'), # Endpoint para variacion entre 2017-2018
]
