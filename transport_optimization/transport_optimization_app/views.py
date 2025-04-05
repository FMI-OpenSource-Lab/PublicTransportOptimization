from django.shortcuts import render
from django.http import JsonResponse, HttpResponse


def home_page(request):
    return HttpResponse("Welcome to the home page!")


def shortest_route_view(request):
    start_stop = request.GET.get("start")
    end_stop = request.GET.get("end")

    if not start_stop or not end_stop:
        return JsonResponse({"error": "Start and end parameters need to be passed"}, status=400)

    return JsonResponse({"ok": "ok"})
