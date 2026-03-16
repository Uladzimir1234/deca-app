/**
 * DECA Window Configurator — API Server
 * Express + PostgreSQL (schema: configurator)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;
const SCHEMA = process.env.DB_SCHEMA || 'configurator';

// ── Database ──
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('connect', (client) => {
  client.query(`SET search_path TO ${SCHEMA}, public`);
});

const db = {
  query: (text, params) => pool.query(text, params),
  getOne: async (text, params) => { const r = await pool.query(text, params); return r.rows[0] || null; },
  getAll: async (text, params) => { const r = await pool.query(text, params); return r.rows; },
};

// ── Middleware ──
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('short'));

// ── Health Check ──
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.getOne('SELECT now() AS time, current_schema() AS schema');
    res.json({ status: 'ok', ...result, version: '1.0.0' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════
// GENERIC CRUD FACTORY
// ══════════════════════════════════════════════

function crudRoutes(table, { orderBy = 'created_at DESC', searchFields = [] } = {}) {
  const router = express.Router();

  // GET all
  router.get('/', async (req, res) => {
    try {
      const { search, limit = 100, offset = 0 } = req.query;
      let sql = `SELECT * FROM ${SCHEMA}.${table}`;
      const params = [];
      if (search && searchFields.length) {
        const clauses = searchFields.map((f, i) => `${f} ILIKE $${i + 1}`);
        params.push(...searchFields.map(() => `%${search}%`));
        sql += ` WHERE (${clauses.join(' OR ')})`;
      }
      sql += ` ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      const rows = await db.getAll(sql, params);
      res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET one
  router.get('/:id', async (req, res) => {
    try {
      const row = await db.getOne(`SELECT * FROM ${SCHEMA}.${table} WHERE id = $1`, [req.params.id]);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // POST create
  router.post('/', async (req, res) => {
    try {
      const keys = Object.keys(req.body);
      const vals = Object.values(req.body);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `INSERT INTO ${SCHEMA}.${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const row = await db.getOne(sql, vals);
      res.status(201).json(row);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // PUT update
  router.put('/:id', async (req, res) => {
    try {
      const keys = Object.keys(req.body);
      const vals = Object.values(req.body);
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const sql = `UPDATE ${SCHEMA}.${table} SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`;
      const row = await db.getOne(sql, [...vals, req.params.id]);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const result = await db.query(`DELETE FROM ${SCHEMA}.${table} WHERE id = $1`, [req.params.id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ deleted: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  return router;
}

// ══════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════

app.use('/api/profiles', crudRoutes('profiles', { orderBy: 'name ASC', searchFields: ['name', 'code'] }));
app.use('/api/colors', crudRoutes('colors', { orderBy: 'category, sort_order', searchFields: ['name'] }));
app.use('/api/muntins', crudRoutes('muntins', { orderBy: 'width_mm, color_name' }));
app.use('/api/glass', crudRoutes('glass_units', { orderBy: 'u_value ASC', searchFields: ['name'] }));
app.use('/api/hardware', crudRoutes('hardware', { orderBy: 'category, name', searchFields: ['name', 'brand'] }));
app.use('/api/accessories', crudRoutes('accessories', { orderBy: 'type, name', searchFields: ['name'] }));
app.use('/api/screens', crudRoutes('screens', { orderBy: 'type, name' }));
app.use('/api/constraints', crudRoutes('constraints', { orderBy: 'sort_order' }));
app.use('/api/users', crudRoutes('users', { orderBy: 'name ASC', searchFields: ['name', 'email'] }));
app.use('/api/invoices', crudRoutes('invoices', { orderBy: 'created_at DESC' }));

// ── Customers (with nested projects) ──
const customersRouter = crudRoutes('customers', { orderBy: 'last_name, first_name', searchFields: ['first_name', 'last_name', 'email', 'phone'] });

customersRouter.get('/:id/full', async (req, res) => {
  try {
    const customer = await db.getOne(`SELECT * FROM ${SCHEMA}.customers WHERE id = $1`, [req.params.id]);
    if (!customer) return res.status(404).json({ error: 'Not found' });
    const projects = await db.getAll(`SELECT * FROM ${SCHEMA}.projects WHERE customer_id = $1 ORDER BY created_at DESC`, [req.params.id]);
    for (const proj of projects) {
      proj.quotes = await db.getAll(`SELECT * FROM ${SCHEMA}.quotes WHERE project_id = $1 ORDER BY created_at DESC`, [proj.id]);
      for (const q of proj.quotes) {
        q.constructions = await db.getAll(`SELECT * FROM ${SCHEMA}.constructions WHERE quote_id = $1 ORDER BY sort_order`, [q.id]);
        for (const c of q.constructions) {
          c.positions = await db.getAll(`SELECT * FROM ${SCHEMA}.positions WHERE construction_id = $1 ORDER BY idx`, [c.id]);
        }
        q.invoices = await db.getAll(`SELECT * FROM ${SCHEMA}.invoices WHERE quote_id = $1 ORDER BY created_at DESC`, [q.id]);
      }
    }
    customer.projects = projects;
    res.json(customer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.use('/api/customers', customersRouter);

// ── Projects ──
app.use('/api/projects', crudRoutes('projects', { orderBy: 'created_at DESC', searchFields: ['name'] }));

// ── Quotes ──
const quotesRouter = crudRoutes('quotes', { orderBy: 'created_at DESC', searchFields: ['name', 'quote_number'] });

quotesRouter.get('/:id/full', async (req, res) => {
  try {
    const quote = await db.getOne(`SELECT * FROM ${SCHEMA}.quotes WHERE id = $1`, [req.params.id]);
    if (!quote) return res.status(404).json({ error: 'Not found' });
    quote.constructions = await db.getAll(`SELECT * FROM ${SCHEMA}.constructions WHERE quote_id = $1 ORDER BY sort_order`, [req.params.id]);
    for (const c of quote.constructions) {
      c.positions = await db.getAll(`SELECT * FROM ${SCHEMA}.positions WHERE construction_id = $1 ORDER BY idx`, [c.id]);
    }
    quote.invoices = await db.getAll(`SELECT * FROM ${SCHEMA}.invoices WHERE quote_id = $1 ORDER BY created_at DESC`, [req.params.id]);
    res.json(quote);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.use('/api/quotes', quotesRouter);

// ── Constructions ──
app.use('/api/constructions', crudRoutes('constructions', { orderBy: 'sort_order' }));
app.use('/api/positions', crudRoutes('positions', { orderBy: 'idx' }));

// ── Bulk: Get all settings at once (for frontend init) ──
app.get('/api/settings', async (req, res) => {
  try {
    const [profiles, colors, muntins, glass, hardware, accessories, screens, constraints, users] = await Promise.all([
      db.getAll(`SELECT * FROM ${SCHEMA}.profiles ORDER BY name`),
      db.getAll(`SELECT * FROM ${SCHEMA}.colors ORDER BY category, sort_order`),
      db.getAll(`SELECT * FROM ${SCHEMA}.muntins ORDER BY width_mm`),
      db.getAll(`SELECT * FROM ${SCHEMA}.glass_units ORDER BY u_value`),
      db.getAll(`SELECT * FROM ${SCHEMA}.hardware ORDER BY category, name`),
      db.getAll(`SELECT * FROM ${SCHEMA}.accessories ORDER BY type, name`),
      db.getAll(`SELECT * FROM ${SCHEMA}.screens ORDER BY type, name`),
      db.getAll(`SELECT * FROM ${SCHEMA}.constraints ORDER BY sort_order`),
      db.getAll(`SELECT * FROM ${SCHEMA}.users WHERE active = true ORDER BY name`),
    ]);
    res.json({ profiles, colors, muntins, glass, hardware, accessories, screens, constraints, users });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AI: Vector search for parameter matching ──
app.post('/api/ai/resolve', async (req, res) => {
  try {
    const { phrases } = req.body; // array of strings
    if (!phrases || !phrases.length) return res.status(400).json({ error: 'phrases required' });

    const results = [];
    for (const phrase of phrases) {
      // Exact match first (fast)
      const exact = await db.getOne(
        `SELECT * FROM ${SCHEMA}.parameter_embeddings WHERE $1 = ANY(synonyms) LIMIT 1`,
        [phrase.toLowerCase()]
      );
      if (exact) {
        results.push({ phrase, match: exact, confidence: 1.0 });
        continue;
      }
      // Vector search (requires embedding to be computed client-side or via Google API)
      // Placeholder — will be enhanced when Google Embeddings are configured
      results.push({ phrase, match: null, confidence: 0 });
    }
    res.json({ results });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Stats ──
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getOne(`
      SELECT
        (SELECT count(*) FROM ${SCHEMA}.customers) AS customers,
        (SELECT count(*) FROM ${SCHEMA}.projects) AS projects,
        (SELECT count(*) FROM ${SCHEMA}.quotes) AS quotes,
        (SELECT count(*) FROM ${SCHEMA}.constructions) AS constructions,
        (SELECT count(*) FROM ${SCHEMA}.positions) AS positions
    `);
    res.json(stats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🪟 DECA Configurator API running on port ${PORT}`);
  console.log(`   Database: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`   Schema: ${SCHEMA}`);
});
