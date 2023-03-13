const HttpError = require("../modules/http-error");
const { validationResult } = require("express-validator");
const uuid = require("uuid");
const getCordsForAddress = require("../util/location");

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u2",
  },
];

const getPlaceByPlaceId = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId && !p.delete);
  if (!place) {
    throw new HttpError("NO place found for provided place id", 404);
  }
  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => p.creator === userId && !p.delete);
  if (places.length === 0) {
    return next(new HttpError("NO place found for provided user id", 404));
  }
  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty) {
    throw new HttpError("Invalid input passed, please check your data", 422);
  }
  const { title, creator, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCordsForAddress(address);
  } catch (error) {
    throw error;
  }
  const newPlace = {
    id: uuid.v4(),
    title,
    creator,
    location: coordinates,
    description,
    address,
  };
  DUMMY_PLACES.push(newPlace);
  res.status(201).json({ place: newPlace });
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty) {
    next(new HttpError("Invalid input passed, please check your data", 422));
  }
  const { title, creator, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCordsForAddress(address);
  } catch (error) {
    throw error;
  }
  const placeId = req.params.pid;
  const placeIndex = DUMMY_PLACES.findIndex((p, i) => p.id === placeId);
  const placeTobeUpdated = { ...DUMMY_PLACES[placeIndex] };
  if (placeIndex === -1 || placeTobeUpdated.delete === true) {
    return next(new HttpError("NO place found for provided place id", 404));
  }
  DUMMY_PLACES[placeIndex] = {
    placeTobeUpdated,
    title,
    creator,
    location: coordinates,
    description,
    address,
  };
  res.status(200).json({ place: placeTobeUpdated });
};

const deletePlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const placeIndex = DUMMY_PLACES.findIndex((p, i) => p.id === placeId);
  const placeTobeDeleted = { ...DUMMY_PLACES[placeIndex] };
  if (placeIndex === -1) {
    return next(new HttpError("NO place found for provided place id", 404));
  }
  DUMMY_PLACES[placeIndex] = {
    placeTobeDeleted,
    delete: true,
  };
  res.status(200).json({
    place: placeTobeDeleted,
  });
};

exports.getPlaceByPlaceId = getPlaceByPlaceId;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
