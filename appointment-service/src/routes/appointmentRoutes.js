const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *         - appointmentDate
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the appointment
 *         patientId:
 *           type: string
 *         doctorId:
 *           type: string
 *         appointmentDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [Scheduled, Completed, Cancelled]
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Returns the list of all the appointments
 *     responses:
 *       200:
 *         description: The list of the appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get an appointment by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The appointment id
 *     responses:
 *       200:
 *         description: The appointment description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: The appointment was not found
 */
router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: The appointment was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Bad request
 */
router.post('/', async (req, res) => {
    const appointment = new Appointment(req.body);
    try {
        const newAppointment = await appointment.save();
        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /appointments/{id}/status:
 *   put:
 *     summary: Update an appointment status
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated appointment
 *       400:
 *         description: Bad request
 */
router.put('/:id/status', async (req, res) => {
    try {
        const updated = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status },
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
