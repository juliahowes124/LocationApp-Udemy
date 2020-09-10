const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location');

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

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => {
        return p.id == placeId;
    });

    if (!place) {
        return next(new HttpError('Could not find a place for the provided place id.', 404));
    }
    res.json({place});
};

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;

    const userPlaces = DUMMY_PLACES.filter(p => {
        return p.creator === userId;
    })

    if (!userPlaces || userPlaces.length === 0) {
        return next(new HttpError('Could not find a place for the provided user id.', 404));
    }
    
    res.json({userPlaces});
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
    
    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator
    };

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({place: createdPlace});
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    if (!DUMMY_PLACES.find(p => p.id === placeId)) {
        throw new HttpError('Could not find a place for that id', 404);
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

    res.status(200).json({message: 'Deleted place.'});

};

const updatePlace = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError('Invalid inputs passed, please check your data', 422);
    }
    
    const placeId = req.params.pid;
    const placeForUpdate = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    const {title, description} = req.body;
    placeForUpdate.title = title;
    placeForUpdate.description = description;

    DUMMY_PLACES[placeIndex] = placeForUpdate;

    res.status(200).json({place: placeForUpdate});
    
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;