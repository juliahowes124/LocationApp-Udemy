const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'famous building',
        location: {
            lat: 40.7,
            lng: -73
        },
        address: '123 poopoo st. New York, NY 10001',
        creator: 'u1'
    },
    {
        id: 'p2',
        title: 'Empire State Building',
        description: 'famous building',
        location: {
            lat: 40.7,
            lng: -73
        },
        address: '123 poopoo st. New York, NY 10001',
        creator: 'u1'
    }
];

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

    let userPlaces;
    try {
        userPlaces = await Place.find( { creator: userId });
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find places.', 500);
        return next(error);
    }
    

    if (!userPlaces || userPlaces.length === 0) {
        return next(new HttpError('Could not find a place for the provided user id.', 404));
    }
    
    res.json({userPlaces: userPlaces.map(place => place.toObject({getters: true}))});
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

    try {
        await createdPlace.save();
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
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find place to delete.', 500);
        return next(error);
    }

    try {
        await place.remove();
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
        throw new HttpError('Invalid inputs passed, please check your data', 422);
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