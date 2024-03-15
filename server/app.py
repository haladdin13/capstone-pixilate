#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, make_response, session
from flask_restful import Resource

# Local imports
from config import app, db, api
# Add your model imports
from models import *

class CheckSession(Resource):
    def get(self):
        user = User.query.filter(User.id == session.get('user_id')).first()
        if not user:
            return make_response({'error': "Unauthorized: you must be logged in"}, 401)
        else:
            return make_response(user.to_dict(), 200)
        
api.add_resource(CheckSession, '/check_session', endpoint='check_session')

class Signup(Resource):
    def post(self):
        json = request.get_json()
        try:
            user = User(
                username=json['username'],
                email=json['email']
            )
            user.password_hash = json['password']
            db.session.add(user)
            db.session.commit()
            session['user_id'] = user.id

            return make_response(user.to_dict(), 201)
        except Exception as e:
            return make_response({'error': str(e) }, 422)
        
api.add_resource(Signup, '/signup', endpoint='signup')

class Login(Resource):
    def post(self):
        username = request.get_json()['username']

        user = User.query.filter(User.username == username).first()
        password = request.get_json()['password']

        if not user:
            response_body = {'error': 'User not found'}
            status = 404
        else:
            if user.authenticate(password):
                session['user_id'] = user.id
                response_body = user.to_dict()
                status = 200
            else:
                response_body = {'error': 'Invalid username or password'}
                status = 401
        return make_response(response_body, status)

api.add_resource(Login, '/login', endpoint='login')

class Logout(Resource):
    def delete(self):
        session['user_id'] = None
        return {}, 204
    
api.add_resource(Logout, '/logout', endpoint='logout')


allowed_endpoints = ['signup', 'login', 'check_session']
@app.before_request
def check_if_logged_in():
    if not session.get('user_id') and request.endpoint not in allowed_endpoints:
        return {'error': 'Unauthorized'}, 401


# Views go here!

@app.route('/')
def index():
    return '<h1>Project Server</h1>'




#Get all palettes
    
class PaletteGallery(Resource):
    def get(self):

        palette_list = [palette.to_dict() for palette in Palette.query.all()]
        
        response = make_response(palette_list, 200)

        return response
    

    def post(self):

        json_data = request.get_json()

        try:
            new_palette = Palette(
                title = json_data['title'],
                description = json_data['description'],
                tags = json_data['tags'],
                likes = json_data['likes'],
                public = json_data['public'],
                user_id = json_data['user_id']
            )

            db.session.add(new_palette)
            db.session.commit()

            response = make_response(new_palette.to_dict(), 201)

            return response
        except Exception as e:
            return make_response({'error': str(e) }, 422)
    
api.add_resource(PaletteGallery, '/palettes', endpoint='palettes')

#Get a palette by ID

class PaletteID(Resource):
    def get(self, id):

        palette = Palette.query.filter(Palette.id == id).first()

        if palette:
            response = make_response(palette.to_dict(), 200)
        else:
            response = make_response({'error': 'Palette not found'}, 404)

        return response
    
    def patch(self, id):
        json_data = request.get_json()
        palette = Palette.query.filter(Palette.id == id).first()

        if palette:
            palette.title = json_data['title']
            palette.description = json_data['description']
            palette.tags = json_data['tags']
            palette.likes = json_data['likes']
            palette.public = json_data['public']
            palette.user_id = json_data['user_id']

            db.session.commit()

            response = make_response(palette.to_dict(), 200)
        else:
            response = make_response({'error': 'Palette not found'}, 404)

        return response
    
    def delete(self, id):
        palette = Palette.query.filter(Palette.id == id).first()

        if palette:
            db.session.delete(palette)
            db.session.commit()

            response = make_response(palette.to_dict(), 200)
        else:
            response = make_response({'error': 'Palette not found'}, 404)

        return response
    
api.add_resource(PaletteID, '/palettes/<int:id>', endpoint='palettes_id')


#Get Palette Galley by User ID


class PaletteGalleryByUserID(Resource):
    def get(self, id):
        palette_list = [palette.to_dict() for palette in Palette.query.filter(Palette.user_id == id).all()]
        
        response = make_response(palette_list, 200)

        return response
    


api.add_resource(PaletteGalleryByUserID, '/palettes/user/<int:id>', endpoint='palettes_user_id')

#Get all colors

class ColorResource(Resource):
    def get(self):

        color_list = [color.to_dict() for color in Color.query.all()]
        
        response = make_response(color_list, 200)

        return response
    

    def post(self):

        #check if color exists, if exists, increment usage frequency by 1
        json_data = request.get_json()
        hex_code = json_data.get('hex_code')
        color = Color.query.filter_by(hex_code=hex_code).first()

        if color:
            color.usage_frequency += 1
            db.session.commit()

            response = make_response(color.to_dict(), 200)
        else:
            new_color = Color(
                hex_code = hex_code,
                usage_frequency = 1
            )

            db.session.add(new_color)
            db.session.commit()

            response = make_response(new_color.to_dict(), 201)

        return response
    
api.add_resource(ColorResource, '/colors', endpoint='colors')


#Get/Post Color Association

class ColorAssociationRes(Resource):
    def get(self):
        color_association_list = [color_association.to_dict() for color_association in ColorAssociation.query.all()]
        return make_response(color_association_list, 200)

    def post(self):
        json_data = request.get_json()
        palette_id = json_data.get('palette_id')
        color_ids = json_data.get('color_id')
        color_id_list = [color_id for color_id in color_ids]

        if not isinstance(color_id_list, list):
            return make_response({'error': 'color_ids must be a list'}, 400)

        palette = Palette.query.get(palette_id)
        if not palette:
            return make_response({'error': 'Palette not found'}, 404)

        for color_id in color_ids:
            color = Color.query.get(color_id)
            if not color:

                return make_response({'error': f'Color with id {color_id} not found'}, 404)

            existing_association = ColorAssociation.query.filter_by(palette_id=palette_id, color_id=color_id).first()
            if existing_association:
                continue

            combined_scores = (1 + palette.likes / 100) * color.usage_frequency
            color_association = ColorAssociation(palette_id=palette_id, color_id=color_id, combined_scores=combined_scores)
            db.session.add(color_association)
            db.session.commit()
            return make_response(color_association.to_dict(), 201)
        # else:
        #     return make_response({'error': 'No colors found'}, 404)
        

    
api.add_resource(ColorAssociationRes, '/color_associations', endpoint='color_associations')


if __name__ == '__main__':
    app.run(port=5555, debug=True)