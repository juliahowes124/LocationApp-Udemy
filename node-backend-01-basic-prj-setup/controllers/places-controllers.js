const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');

const DUMMY_PLACES = [
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

const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const userPlaces = [];

    userCheck = DUMMY_PLACES.find(p => {
        return p.creator == userId;
    });
    if (!userCheck) {
        return next(new Error('Could not find a place for the provided user id.', 404));
    }


    for (i=0; i<DUMMY_PLACES.length; i++) {
        const placeToAppend = DUMMY_PLACES.find(p => {
            return p.creator == userId;
        });
        userPlaces.push(placeToAppend);
    }
   
    
    res.json({userPlaces});
};

const createPlace = (req, res, next) => {
    const {title, description, coordinates, address, creator} = req.body;
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

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;