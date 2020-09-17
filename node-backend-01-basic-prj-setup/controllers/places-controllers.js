const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find place', 500);
        return next(error);
    }
    
    if (!place) {
        const error = new HttpError('Could not find a place for the provided place id.', 404);
        return next(error);
    }

    res.json({place: place.toObject( {getters: true}) }); //returns place as javascript object and getters returns id as string 
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find places.', 500);
        return next(error);
    }
    

    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(new HttpError('Could not find a place for the provided user id.', 404));
    }
    
    res.json({userPlaces: userWithPlaces.places.map(place => place.toObject({getters: true}))});
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }
    const {title, description, address, creator} = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }
    
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://cdn.getyourguide.com/img/location/5ca3484e4fa26.jpeg/148.jpg',
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch(err) {
        const error = new HttpError('Creating place failed. Could not retrieve user.', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Creating place failed', 500);
        return next(error);
    }
    

    res.status(201).json({place: createdPlace});
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find place to delete.', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for this id', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not delete place.', 500);
        return next(error);
    }

    res.status(200).json({message: 'Deleted place.'});

};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        const error = new HttpError('Invalid inputs passed, please check your data', 422);
        return next(error);
    }
    
    const placeId = req.params.pid;
    const {title, description} = req.body;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find place to update.', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not update place to DB.', 500);
        return next(error);
    }
    

    res.status(200).json({place: place.toObject({ getters: true })});
    
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;