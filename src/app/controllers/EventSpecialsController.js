const EventSpecial = require('../models/eventSpecials');
exports.findAll = async (req, res) => {
    try {
        const eventSpecials = await EventSpecial.find();
        res.status(200).json(eventSpecials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.create = async (req, res) => {
    try {
        const eventSpecial = new EventSpecial(req.body);
        await eventSpecial.save();
        res.status(201).json(eventSpecial);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const eventSpecial = await EventSpecial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!eventSpecial) return res.status(404).json({ message: 'Event Special not found.' });
        res.status(200).json(eventSpecial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const eventSpecial = await EventSpecial.findByIdAndDelete(req.params.id);
        if (!eventSpecial) return res.status(404).json({ message: 'Event Special not found.' });
        res.status(200).json(eventSpecial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.findById = async (req, res) => {
    try {
        const eventSpecial = await EventSpecial.findById(req.params.id);
        if (!eventSpecial) return res.status(404).json({ message: 'Event Special not found.' });
        res.status(200).json(eventSpecial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};