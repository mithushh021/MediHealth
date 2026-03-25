const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');

/**
 * @swagger
 * components:
 *   schemas:
 *     Medication:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         dosage:
 *           type: string
 *         frequency:
 *           type: string
 *         duration:
 *           type: string
 *     Prescription:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the prescription
 *         patientId:
 *           type: string
 *         doctorId:
 *           type: string
 *         medications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Medication'
 *         dateIssued:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *         status:
 *           type: string
 *           enum: [New, Seen]
 */

/**
 * @swagger
 * /prescriptions:
 *   get:
 *     summary: Returns the list of all the prescriptions
 *     responses:
 *       200:
 *         description: The list of the prescriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 */
router.get('/', async (req, res) => {
    try {
        const prescriptions = await Prescription.find();
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /prescriptions/{id}:
 *   get:
 *     summary: Get a prescription by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The prescription id
 *     responses:
 *       200:
 *         description: The prescription description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescription'
 *       404:
 *         description: The prescription was not found
 */
router.get('/:id', async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
        res.json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /prescriptions/patient/{patientId}:
 *   get:
 *     summary: Get prescriptions by patient id
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: string
 *         required: true
 *         description: The patient id to find prescriptions for
 *     responses:
 *       200:
 *         description: The list of prescriptions for the patient
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 */
router.get('/patient/:patientId', async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.params.patientId });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /prescriptions:
 *   post:
 *     summary: Create a new prescription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prescription'
 *     responses:
 *       201:
 *         description: The prescription was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Bad request
 */
router.post('/', async (req, res) => {
    const prescription = new Prescription(req.body);
    try {
        const newPrescription = await prescription.save();
        res.status(201).json(newPrescription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /prescriptions/{id}/status:
 *   put:
 *     summary: Update prescription status
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The prescription id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [New, Seen]
 *     responses:
 *       200:
 *         description: The prescription status was successfully updated
 *       404:
 *         description: The prescription was not found
 */
router.put('/:id/status', async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
        res.json(prescription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
