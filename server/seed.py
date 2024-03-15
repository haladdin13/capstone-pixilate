#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc
import random

# Remote library imports
from faker import Faker
from werkzeug.security import generate_password_hash

# Local imports
from app import app
from models import db, User, Palette, Color, ColorAssociation

def generate_hex_color():
    return f"#{''.join([rc('0123456789ABCDEF') for _ in range(6)])}"

def seed_data():
    print("Starting seed...")
    # Clear existing data
    db.session.query(ColorAssociation).delete()
    db.session.query(Color).delete()
    db.session.query(Palette).delete()
    db.session.query(User).delete()

    # First, create and commit colors independently to reuse them across palettes
    all_colors = []
    for _ in range(10):  # num_colors = 10
        color = Color(hex_code=generate_hex_color(), usage_frequency=randint(1, 10))
        db.session.add(color)
        all_colors.append(color)
    db.session.commit()

    num_users = 5
    palettes_per_user = 2
    colors_per_palette = 3

    for _ in range(num_users):
        user = User(username=fake.user_name(), email=fake.email())
        user.password_hash = 'plaintext_password'
        db.session.add(user)
        db.session.flush()  # Make sure user IDs are generated

        for _ in range(palettes_per_user):
            palette = Palette(title=fake.word().capitalize() + " Palette", description=fake.sentence(), tags=','.join(fake.words(nb=3)), likes=fake.random_int(min=0, max=100), public=fake.boolean(), user_id=user.id)
            db.session.add(palette)
            db.session.flush()  # Make sure palette IDs are generated

            selected_colors = random.sample(all_colors, colors_per_palette)
            for color in selected_colors:
                combined_scores = (palette.likes + 1) * color.usage_frequency
                color_association = ColorAssociation(palette_id=palette.id, color_id=color.id, combined_scores=combined_scores)
                db.session.add(color_association)

    db.session.commit()
    print("Database seeded!")

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        seed_data()
