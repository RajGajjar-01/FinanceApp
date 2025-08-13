import random
from datetime import date

from django.core.management.base import BaseCommand
from django.utils import timezone

from user.models import Book  # Replace 'myapp' with your actual app name


class Command(BaseCommand):
    help = 'Add 10 sample books to the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing books before adding new ones',
        )

    def handle(self, *args, **options):
        if options['clear']:
            Book.objects.all().delete()
            self.stdout.write(
                self.style.WARNING('All existing books have been deleted.')
            )

        books_data = [
            {
                'title': 'To Kill a Mockingbird',
                'author': 'Harper Lee',
                'description': 'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.',
                'isbn': '9780061120084',
                'published_date': date(1960, 7, 11),
            },
            {
                'title': '1984',
                'author': 'George Orwell',
                'description': 'A dystopian social science fiction novel that explores the dangers of totalitarian government.',
                'isbn': '9780452284234',
                'published_date': date(1949, 6, 8),
            },
            {
                'title': 'Pride and Prejudice',
                'author': 'Jane Austen',
                'description': 'A romantic novel of manners that follows the character development of Elizabeth Bennet.',
                'isbn': '9780141439518',
                'published_date': date(1813, 1, 28),
            },
            {
                'title': 'The Great Gatsby',
                'author': 'F. Scott Fitzgerald',
                'description': 'A classic American novel depicting the decadence and excess of the Jazz Age.',
                'isbn': '9780743273565',
                'published_date': date(1925, 4, 10),
            },
            {
                'title': 'The Catcher in the Rye',
                'author': 'J.D. Salinger',
                'description': 'A coming-of-age story about teenage rebellion and angst in post-war America.',
                'isbn': '9780316769174',
                'published_date': date(1951, 7, 16),
            },
            {
                'title': 'Lord of the Flies',
                'author': 'William Golding',
                'description': 'A novel about a group of British boys stranded on an uninhabited island.',
                'isbn': '9780571056866',
                'published_date': date(1954, 9, 17),
            },
            {
                'title': 'The Hobbit',
                'author': 'J.R.R. Tolkien',
                'description': 'A fantasy adventure about Bilbo Baggins journey to reclaim treasure guarded by a dragon.',
                'isbn': '9780547928227',
                'published_date': date(1937, 9, 21),
            },
            {
                'title': 'Harry Potter and the Philosopher\'s Stone',
                'author': 'J.K. Rowling',
                'description': 'The first book in the Harry Potter series about a young wizard\'s journey.',
                'isbn': '9780747532699',
                'published_date': date(1997, 6, 26),
            },
            {
                'title': 'The Alchemist',
                'author': 'Paulo Coelho',
                'description': 'A philosophical novel about a young shepherd\'s journey to find treasure.',
                'isbn': '9780062315007',
                'published_date': date(1988, 4, 25),
            },
            {
                'title': 'Brave New World',
                'author': 'Aldous Huxley',
                'description': 'A dystopian novel set in a futuristic World State of genetically modified citizens.',
                'isbn': '9780060850524',
                'published_date': date(1932, 8, 30),
            },
        ]

        created_count = 0
        skipped_count = 0

        for book_data in books_data:
            try:
                book, created = Book.objects.get_or_create(
                    isbn=book_data['isbn'],
                    defaults=book_data
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Created: "{book.title}" by {book.author}')
                    )
                else:
                    skipped_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'⚠ Skipped: "{book.title}" (already exists)')
                    )
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error creating book "{book_data["title"]}": {str(e)}')
                )

        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} books')
        )
        if skipped_count > 0:
            self.stdout.write(
                self.style.WARNING(f'Skipped {skipped_count} books (already exist)')
            )
        self.stdout.write('='*50)