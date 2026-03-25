// Lead Clinical Documentation Microservice: Kanzurrizk Rihan
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const prescriptionRoutes = require('./src/routes/prescriptionRoutes');

const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Options
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Prescription Service API',
            version: '1.0.0',
            description: 'API for Prescription operations',
        },
        servers: [
            { url: `http://localhost:${PORT}` }
        ]
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/prescriptions/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Mount routes
app.use('/prescriptions', prescriptionRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medihealth_prescription_db')
    .then(() => console.log('Prescription Service: Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Prescription Service is running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/prescriptions/api-docs`);
});
