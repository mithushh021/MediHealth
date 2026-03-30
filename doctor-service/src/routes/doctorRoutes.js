const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

/**
 * @swagger
 * components:
 *   schemas:
 *     Doctor:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - specialization
 *         - experienceYears
 *         - contactNumber
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the doctor
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         specialization:
 *           type: string
 *         experienceYears:
 *           type: number
 *         contactNumber:
 *           type: string
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Returns the list of all the doctors
 *     responses:
 *       200:
 *         description: The list of the doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 */
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.available === 'true') {
            filter.isAvailable = true;
            filter.isApproved = true;
        }
        const doctors = await Doctor.find(filter);
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get a doctor by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The doctor id
 *     responses:
 *       200:
 *         description: The doctor description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: The doctor was not found
 */
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create a new doctor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Doctor'
 *     responses:
 *       201:
 *         description: The doctor was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       400:
 *         description: Bad request
 */
/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update a doctor by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Doctor'
 *     responses:
 *       200:
 *         description: The doctor was successfully updated
 */
router.put('/:id', async (req, res) => {
    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDoctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(updatedDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    const doctor = new Doctor(req.body);
    try {
        const newDoctor = await doctor.save();
        res.status(201).json(newDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /doctors/{id}/approve:
 *   put:
 *     summary: Approve or reject a doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:id/approve', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if(!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.params.id, 
            { $set: { isApproved: !doctor.isApproved } },
            { new: true, runValidators: false } // Bypassing other validators for this toggle
        );
        res.json(updatedDoctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /doctors/{id}/reset-password:
 *   put:
 *     summary: Reset doctor password to default medi@1234
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id/reset-password', async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { $set: { password: 'medi@1234', needsPasswordReset: true } },
            { new: true, runValidators: false }
        );
        if(!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /doctors/{id}/change-password:
 *   put:
 *     summary: Change doctor password and clear reset flag
 */
router.put('/:id/change-password', async (req, res) => {
    const { newPassword } = req.body;
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { $set: { password: newPassword, needsPasswordReset: false } },
            { new: true }
        );
        if(!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /doctors/{id}/availability:
 *   put:
 *     summary: Toggle doctor availability status
 */
router.put('/:id/availability', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if(!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { $set: { isAvailable: !doctor.isAvailable } },
            { new: true, runValidators: false }
        );
        res.json(updatedDoctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /doctors/{id}/busy-slots:
 *   post:
 *     summary: Add a busy time slot
 */
router.post('/:id/busy-slots', async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { $push: { busySlots: req.body } },
            { new: true }
        );
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /doctors/{id}/busy-slots/{slotId}:
 *   delete:
 *     summary: Remove a busy time slot
 */
router.delete('/:id/busy-slots/:slotId', async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { $pull: { busySlots: { _id: req.params.slotId } } },
            { new: true }
        );
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Delete a doctor by id
 */
router.delete('/:id', async (req, res) => {
    try {
        const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!deletedDoctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
