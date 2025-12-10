from django.shortcuts import render
from django.http import JsonResponse
import re

def index(request):
    return render(request, 'calculator_app/index.html')

def calculate(request):
    if request.method == 'POST':
        expression = request.POST.get('expression', '')
        # Handle 'x' for multiplication from UI
        expression = expression.replace('x', '*') 

        # Sanitize and Validate
        if not re.match(r'^[\d\+\-\*\/\.\s]+$', expression):
             return JsonResponse({'result': 'Error'})

        try:
            result = eval(expression, {"__builtins__": None}, {})
            
            # Format result: remove decimal if integer
            if isinstance(result, float) and result.is_integer():
                result = int(result)
            
            return JsonResponse({'result': str(result)})
        except Exception:
            return JsonResponse({'result': 'Error'})

    return JsonResponse({'result': 'Error'})
