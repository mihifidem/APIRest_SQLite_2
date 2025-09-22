const express = require('express');
const app = express();
const cors = require ('cors');
const morgan = require('morgan');

const PORT = 3000;

const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const tagRoutes = require('./routes/tags');

app.use(express.json());
app.use(morgan('dev'));

app.get('/health',(_req, res)=> res.json({ ok:true}));

app.use('/api/v1/tasks',taskRoutes);
// app.use('/api/v1/users',userRoutes);
// app.use('/api/v1/tags',tagRoutes);


app.listen(PORT, ()=>{
    console.log(`Servidor en http://localhost:${PORT}`);
});