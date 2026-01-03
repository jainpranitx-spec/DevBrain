from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create default user for development'

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username='default_user',
            defaults={
                'email': 'default@devbrain.com',
                'first_name': 'Default',
                'last_name': 'User',
                'is_active': True,
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created default user: {user.username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Default user already exists: {user.username}')
            )