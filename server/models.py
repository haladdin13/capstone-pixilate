from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates

from config import db, bcrypt

# Models go here!


class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String)
    user_avatar = db.Column(db.String)
    
    #RELATIONSHIPS

    palettes = db.relationship('Palette', back_populates='user')

    #SERIALIZATION RULES

    serialize_rules = ('-_password_hash', '-palettes.user')

    #PROPERTIES

    @hybrid_property
    def password_hash(self):
        raise Exception("Password hashes may not be viewed.")
    

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))


    def __repr__(self):
        return f'User: {self.username}, Email: {self.email}, Avatar: {self.user_avatar}'
    
    #VALIDATION

    @validates('username')
    def validate_username(self, key, value):
        if not isinstance(value, str) and len(value) == 0:
            raise ValueError('Username must be a non-empty string.')
        elif User.query.filter_by(username=value).first() is not None:
            raise ValueError('Username is taken.')
        return value
    
    @validates('email')
    def validate_email(self, key, value):
        if not isinstance(value, str):
            raise ValueError('Email must be a string.')
        elif len(value) == 0 or '@' not in value:
            raise ValueError('Email must be a valid email address.')
        elif User.query.filter_by(email=value).first() is not None:
            raise ValueError('Email is taken.')
        return value
    
    @validates('password')
    def validate_password(self, key, value):
        if not isinstance(value, str) and len(value) == 0:
            raise ValueError('Password must be a non-empty string.')
        return value
    

class Palette(db.Model, SerializerMixin):
    __tablename__ = 'palettes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    title = db.Column(db.String)
    description = db.Column(db.String)
    tags = db.Column(db.String)
    likes = db.Column(db.Integer)
    public = db.Column(db.Boolean)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    #RELATIONSHIPS

    user = db.relationship('User', back_populates='palettes')
    color_associations = db.relationship('ColorAssociation', back_populates='palette')

    #SERIALIZATION RULES

    serialize_rules = ('-user.palettes', '-color_associations.palette', '-color_associations.color.palettes')

    def __repr__(self):
        return f'Palette: {self.title}, Description: {self.description}, Tags: {self.tags}, Likes: {self.likes}, Public: {self.public}'

    #VALIDATION

    @validates('title')
    def validate_title(self, key, value):
        if not isinstance(value, str) and len(value) == 0:
            raise ValueError('Title must be a non-empty string.')
        return value
    
    @validates('description')
    def validate_description(self, key, value):
        if not isinstance(value, str) and len(value) == 0:
            raise ValueError('Description must be a non-empty string.')
        return value
    
    @validates('tags')
    def validate_tags(self, key, value):
        if not isinstance(value, str) and len(value) < 3:
            raise ValueError ('Tags must be a string longer than 2 characters.')
        return value


class Color(db.Model, SerializerMixin):
    __tablename__ = 'colors'

    id = db.Column(db.Integer, primary_key=True)
    hex_code = db.Column(db.String)
    usage_frequency = db.Column(db.Integer)

    #RELATIONSHIPS

    color_associations = db.relationship('ColorAssociation', back_populates='color')

    #SERIALIZATION RULES

    serialize_rules = ('-color_associations.color', '-color_associations.palette')



    def __repr__(self):
        return f'Color: {self.hex_code}, Usage Frequency: {self.usage_frequency}'

    #VALIDATION

    #Check if hex string is valid
    @validates('hex_code')
    def validate_hex_code(self, key, value):
        if not isinstance(value, str):
            raise ValueError('Hex code must be a string.')
        elif not (len(value) == 4 or len(value) == 5 or len(value) == 7 or len(value) == 9) and value.startswith('#'):
            raise ValueError('Hex code must be #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.')
        return value
    

class ColorAssociation(db.Model, SerializerMixin):
    __tablename__ = 'color_associations'

    id = db.Column(db.Integer, primary_key=True)
    palette_id = db.Column(db.Integer, db.ForeignKey('palettes.id'))
    color_id = db.Column(db.Integer, db.ForeignKey('colors.id'))
    combined_scores = db.Column(db.Float)

    #RELATIONSHIPS

    palette = db.relationship('Palette', back_populates='color_associations')
    color = db.relationship('Color', back_populates='color_associations')

    #SERIALIZATION RULES

    serialize_rules = ('-palette.color_associations', '-color.color_associations')
