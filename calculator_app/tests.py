from django.test import TestCase, Client
import json

class CalculatorTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_index_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'calc')
        self.assertContains(response, 'calc_history')

    def test_calculate_addition(self):
        response = self.client.post('/calculate', {'expression': '7+8'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['result'], '15')

    def test_calculate_multiplication_x(self):
        response = self.client.post('/calculate', {'expression': '3x4'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['result'], '12')
        
    def test_calculate_float(self):
        response = self.client.post('/calculate', {'expression': '10/4'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['result'], '2.5')

    def test_invalid_input(self):
        response = self.client.post('/calculate', {'expression': 'import os'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['result'], 'Error')
    
    def test_multiplication_example(self):
        """Test example from screenshots: 9 x 9"""
        response = self.client.post('/calculate', {'expression': '9x9'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['result'], '81')
    
    def test_another_multiplication(self):
        """Test example from screenshots: 5 x 5"""
        response = self.client.post('/calculate', {'expression': '5x5'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['result'], '25')
