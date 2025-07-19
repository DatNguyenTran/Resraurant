const express = require('express');
const eventSpecialsController = require('../controllers/eventSpecialsController');

const eventSpecialsRoutes = express.Router();

eventSpecialsRoutes.use(express.json());
eventSpecialsRoutes.use(express.urlencoded({ extended: true }));

eventSpecialsRoutes.route('/')
.get(eventSpecialsController.findAll)
.post(eventSpecialsController.create)
.put((req, res) => {
    res.status(403).json('PUT operation not supported on /eventSpecials');
})
.delete(eventSpecialsController.delete);

eventSpecialsRoutes.route('/:id')
.get(eventSpecialsController.findById)
.post((req, res) => {
    res.status(403).json('POST operation not supported on /eventSpecials/:id' + req.params.id);
})
.put(eventSpecialsController.update)
.delete(eventSpecialsController.delete);

module.exports = eventSpecialsRoutes;