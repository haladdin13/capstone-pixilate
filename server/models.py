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

    @hybrid_property
    def password_hash(self):
        raise Exception("Password hashes may not be viewed.")
    

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))
    
    serialize_rules = ('-_password_hash',)

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