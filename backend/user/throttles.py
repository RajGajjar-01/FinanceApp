from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class RegistrationThrottle(AnonRateThrottle):
    scope = 'registration'
    
    def get_rate(self):
        return '5/hour'

class LoginThrottle(AnonRateThrottle):
    scope = 'login'
    
    def get_rate(self):
        return '10/hour'

class PasswordResetThrottle(AnonRateThrottle):
    scope = 'password_reset'
    
    def get_rate(self):
        return '3/hour'