#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, make_response, session
from flask_restful import Resource
from sqlalchemy.sql import func

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
                email=json['email'],
                user_avatar=json['user_avatar']
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


allowed_endpoints = ['signup', 'login', 'logout', 'check_session', 'palettes', 'colors', 'color_associations', 'color_associations_palette_id', 'colors_id', 'palettes_id', 'users', 'user_id', 'palettes_user_id', 'color_associations_id', 'recommended_palettes']
@app.before_request
def check_if_logged_in():
    if request.method == "OPTIONS":
        # Allow OPTIONS requests to pass through without authentication
        return None  # Returning None allows the request to continue to the intended route
    if not session.get('user_id') and request.endpoint not in allowed_endpoints:
        return {'error': 'Unauthorized'}, 401


# Views go here!

@app.route('/')
def index():
    return '<h1>Project Server</h1>'


# #Get All Users
    
class Users(Resource):
    def get(self):
        user_list = [user.to_dict() for user in User.query.all()]
        
        response = make_response(user_list, 200)

        return response

api.add_resource(Users, '/users', endpoint='users')



# #Get a user by ID

class UserID(Resource):
    def get(self, id):

        user = User.query.filter(User.id == id).first()

        if user:
            response = make_response(user.to_dict(), 200)

            return response
        else:
            response = make_response({'error': 'User not found'}, 404)

            return response
        
    def patch(self,id):
        json_data = request.get_json()

        try:
            user = User.query.filter(User.id == id).first()
            user.username = json_data['username']
            user.email = json_data['email']
            db.session.commit()

            response = make_response(user.to_dict(), 200)

            return response
        except Exception as e:
            return make_response({'error': str(e) }, 422)
        


api.add_resource(UserID, '/user/<int:id>', endpoint='user_id')


#Get all palettes
    
class PaletteGallery(Resource):
    def get(self):

        user_id = session.get('user_id')

        if user_id:
            palettes = Palette.query.filter(
                (Palette.public == True) | (Palette.user_id == user_id)
            ).all()

        else:
            palettes = Palette.query.filter_by(public=True).all()
        
        palette_data = [palette.to_dict() for palette in palettes]
        response = make_response(palette_data, 200)

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
            palette.title = json_data.get('title', palette.title)
            palette.description = json_data.get('description', palette.description)
            palette.tags = json_data.get('tags', palette.tags)
            palette.likes = json_data.get('likes', palette)
            palette.public = json_data.get('public', palette)
            palette.user_id = json_data.get('user_id', palette.user_id)

            submitted_colors = set(json_data.get('colors', []))

            existing_assoc = {assoc.color.hex_code: assoc for assoc in palette.color_associations}

            # color_to_add = submitted_colors - existing_assoc
            # color_to_remove = existing_assoc - submitted_colors

            for assoc in list(palette.color_associations):
                if assoc.color.hex_code not in submitted_colors:
                    db.session.delete(assoc)
                else:
                    submitted_colors.remove(assoc.color.hex_code)

            for hex_code in submitted_colors:
                color = Color.query.filter_by(hex_code=hex_code).first()
                if not color:
                    color = Color(hex_code=hex_code)
                    db.session.add(color)
                    db.session.flush()
    

                new_assoc = ColorAssociation(palette_id=id, color_id=color.id)
                db.session.add(new_assoc)

            db.session.commit()

            response = make_response(palette.to_dict_with_colors, 200)
        else:
            response = make_response({'error': 'Palette not found'}, 404)

        return response
    
    def delete(self, id):
        palette = Palette.query.filter(Palette.id == id).first()

        if palette:
            db.session.delete(palette)
            db.session.commit()

            response = make_response({'message': 'Delete Successful'}, 200)
        else:
            response = make_response({'error': 'Palette not found'}, 404)

        return response
    
api.add_resource(PaletteID, '/palettes/<int:id>', endpoint='palettes_id')


#Get Palette Galley by User ID


class PaletteGalleryByUserID(Resource):
    def get(self, id):
        palettes = Palette.query.filter(Palette.user_id == id).all()
        palette_list = [palette.to_dict_with_colors for palette in palettes]
        
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


#Get a color by ID

class ColorID(Resource):
    def get(self, id):
        color = Color.query.filter(Color.id == id).first()

        if color:
            response = make_response(color.to_dict(), 200)
        else:
            response = make_response({'error': 'Color not found'}, 404)

        return response
    
    def patch(self, id):

        json_data = request.get_json()

        color = Color.query.filter(Color.id == id).first()
        if color:
            if 'hex_code' in json_data:
                color.hex_code = json_data['hex_code']
            if 'usage_frequency' in json_data:
                color.usage_frequency = json_data['usage_frequency']

            db.session.commit()

            response = make_response(color.to_dict(), 200)

            return response
        
        return make_response({'error': 'Color not found'}, 404)
    
    def delete(self, id):

        color = Color.query.filter(Color.id == id).first()

        if color:
            db.session.delete(color)
            db.session.commit()

            response = make_response(color.to_dict(), 200)

            return response
        
        return make_response({'error': 'Color not found'}, 404)
    
api.add_resource(ColorID, '/colors/<int:id>', endpoint='colors_id')


#Get/Post Color Association

class ColorAssociationRes(Resource):
    def get(self):
        color_association_list = [color_association.to_dict() for color_association in ColorAssociation.query.all()]
        return make_response(color_association_list, 200)

    def post(self):
        json_data = request.get_json()
        palette_id = json_data.get('palette_id')
        color_ids = json_data.get('color_id')

        if not isinstance(color_ids, list):
            color_ids = [color_ids] if color_ids else []

        if not color_ids:
            return make_response({'error': 'Color IDs are required and must be a list'}, 404)

        palette = Palette.query.get(palette_id)
        if not palette:
            return make_response({'error': 'Palette not found'}, 404)

        for color_id in color_ids:
            color = Color.query.filter(color_id == color_id).first()
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


#Get Color Association By ID

class ColorAssociationByID(Resource):
    def get(self, id):
        color_association = ColorAssociation.query.filter(ColorAssociation.id == id).first()

        if color_association:
            response = make_response(color_association.to_dict(), 200)
        else:
            response = make_response({'error': 'Color Association not found'}, 404)

        return response
    
    def patch(self, id):
        json_data = request.get_json()
        color_associations = ColorAssociation.query.filter(ColorAssociation.palette_id == id).all()
        color_ids = json_data.get('color_id')
        palette_id = json_data.get('palette_id')
        if color_associations:
            for color_association in color_associations:
                # Assuming the JSON data contains a mapping of color_id to combined_scores
                if str(color_association.color_id) in json_data:
                    color_association.combined_scores = json_data[str(color_association.color_id)]['combined_scores']
            
            if not isinstance(color_ids, list):
                color_ids = [color_ids] if color_ids else []

            if not color_ids:
                return make_response({'error': 'Color IDs are required and must be a list'}, 404)

            palette = Palette.query.get(palette_id)
            if not palette:
                return make_response({'error': 'Palette not found'}, 404)
        
            for color_id in color_ids:
                color = Color.query.filter(color_id == color_id).first()
                if not color:

                    return make_response({'error': f'Color with id {color_id} not found'}, 404)

                existing_association = ColorAssociation.query.filter_by(palette_id=palette_id, color_id=color_id).first()
                if existing_association:
                    continue

                combined_scores = (1 + palette.likes / 100) * color.usage_frequency
                color_association = ColorAssociation(palette_id=palette_id, color_id=color_id, combined_scores=combined_scores)


                return make_response(color_association.to_dict(), 201)
            
            
            db.session.commit()
            
            updated_color_associations = [ca.to_dict() for ca in color_associations]
            return make_response((updated_color_associations), 200)
        else:
            return make_response({'error': 'No color associations found for the given palette ID'}, 404)
        
    def delete(self, id):
        color_association = ColorAssociation.query.filter(ColorAssociation.id == id).first()

        if color_association:
            db.session.delete(color_association)
            db.session.commit()

            response = make_response(color_association.to_dict(), 200)

        else:
            response = make_response({'error': 'Color Association not found'}, 404)

        return response
    
api.add_resource(ColorAssociationByID, '/color_associations/<int:id>', endpoint='color_associations_id')
    

#Get Color Association by Palette ID

class ColorAssociationByPaletteID(Resource):
    def get(self, id):
        color_association_list = [color_association.to_dict() for color_association in ColorAssociation.query.filter(ColorAssociation.palette_id == id).all()]
        return make_response(color_association_list, 200)
    

    def patch(self, id):
        incomingData = request.get_json()
        incomingColorIdsRaw = incomingData.get('color_id', [])

        if not isinstance(incomingColorIdsRaw, list):
            incomingColorIdsRaw = [incomingColorIdsRaw] if incomingColorIdsRaw else []

        incomingColorIds = set(incomingColorIdsRaw)
        

        currentAssociations = ColorAssociation.query.filter_by(palette_id=id).all()
        existingColorIds = set(assoc.color_id for assoc in currentAssociations)

        colorsToAdd = incomingColorIds.difference(existingColorIds)
        colorsToRemove = existingColorIds.difference(incomingColorIds)

        ColorAssociation.query.filter(ColorAssociation.palette_id == id, ColorAssociation.color_id.in_(colorsToRemove)).delete(synchronize_session='fetch')

        for color_id in colorsToAdd:
            newAssoc = ColorAssociation(palette_id=id, color_id=color_id)
            db.session.add(newAssoc)



        db.session.commit()
        return {'message': 'Color associations updated successfully'}, 200
            
    
    def delete(self, id):

        color_association = ColorAssociation.query.filter(ColorAssociation.palette_id == id).first()

        if color_association:
            db.session.delete(color_association)
            db.session.commit()

            response = make_response(color_association.to_dict(), 200)

        else:
            response = make_response({'error': 'Color Association not found'}, 404)

        return response
    
api.add_resource(ColorAssociationByPaletteID, '/color_associations/palette/<int:id>', endpoint='color_associations_palette_id')


#Query to get top 5 recommended palettes by combined score

class RecommendedPalettes(Resource):
    def get(self):
        recommended_palletes_query = db.session.query(
            Palette,
            func.sum(ColorAssociation.combined_scores).label('combined_score')
        ).join(
            ColorAssociation
        ).group_by(
            Palette.id
        ).order_by(
            func.sum(ColorAssociation.combined_scores).desc()
        ).limit(5).all()

        recommended_palletes = [{
            'id': palette.id,
            'title': palette.title,
            'description': palette.description,
            'colors': [assoc.color.hex_code for assoc in palette.color_associations]
        } for palette, combined_score in recommended_palletes_query]

        return make_response({'palettes': recommended_palletes}, 200)
    
api.add_resource(RecommendedPalettes, '/recommended_palettes', endpoint='recommended_palettes')

if __name__ == '__main__':
    app.run(port=5555, debug=True)