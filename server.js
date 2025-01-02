const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

// Banco de dados
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error(err.message);
    console.log('Conectado ao banco de dados SQLite.');
});

// Configurar tabelas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS active_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS default_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TEXT NOT NULL UNIQUE
    )`);
});

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.get('/active-days', (req, res) => {
    db.all('SELECT day FROM active_days', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(row => row.day));
    });
});

app.post('/active-days', (req, res) => {
    const { day } = req.body;
    db.run('INSERT OR IGNORE INTO active_days (day) VALUES (?)', [day], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).send('Dia adicionado com sucesso.');
    });
});

app.delete('/active-days/:day', (req, res) => {
    const { day } = req.params;
    db.run('DELETE FROM active_days WHERE day = ?', [day], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.send('Dia removido com sucesso.');
    });
});

app.get('/default-schedule', (req, res) => {
    db.all('SELECT time FROM default_schedule', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(row => row.time));
    });
});

app.post('/default-schedule', (req, res) => {
    const { time } = req.body;
    db.run('INSERT OR IGNORE INTO default_schedule (time) VALUES (?)', [time], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).send('Horário adicionado com sucesso.');
    });
});

app.delete('/default-schedule/:time', (req, res) => {
    const { time } = req.params;
    db.run('DELETE FROM default_schedule WHERE time = ?', [time], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.send('Horário removido com sucesso.');
    });
});

app.get('/appointments', (req, res) => {
    db.all('SELECT * FROM appointments', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/appointments', (req, res) => {
    const { name, phone, appointment_date, appointment_time } = req.body;
    db.run(
        'INSERT INTO appointments (name, phone, appointment_date, appointment_time) VALUES (?, ?, ?, ?)',
        [name, phone, appointment_date, appointment_time],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).send('Agendamento criado com sucesso.');
        }
    );
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}.`));
