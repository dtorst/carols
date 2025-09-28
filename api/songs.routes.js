import { Router } from 'express';
import Song from './song.model.js';


const r = Router();


r.get('/', async (_req, res, next) => {
    try {
        const songs = await Song.findAll({ order: [['title', 'ASC']] });
        res.json({ songs: songs.map(s => ({
            id: s.id,
            title: s.title,
            key: s.key,
            composer: s.composer,
            hasScore: !!s.score_url,
            hasParts: !!(s.ref_s_url||s.ref_a_url||s.ref_t_url||s.ref_b_url||s.ref_full_url),
            references: [
                { title: 'Full Choir', value: 'ref_full_url', url: s.ref_full_url },
                { title: 'Soprano', value: 'ref_s_url', url: s.ref_s_url },
                { title: 'Alto', value: 'ref_a_url', url: s.ref_a_url }, 
                { title: 'Tenor', value: 'ref_t_url', url: s.ref_t_url },
                { title: 'Bass', value: 'ref_b_url', url: s.ref_b_url }
            ].filter(p => p.url)
        })) });
    } catch (e) { next(e); }
});


r.get('/:id', async (req, res, next) => {
    try {
        const song = await Song.findByPk(req.params.id);
        if (!song) return res.status(404).json({ error: 'Not found' });
        res.json({ song });
    } catch (e) { next(e); }
});


r.post('/', async (req, res, next) => {
    try {
        const song = await Song.create(req.body);
        res.status(201).json({ song });
    } catch (e) { next(e); }
});


r.patch('/:id/notes', async (req, res, next) => {
    try {
        const song = await Song.findByPk(req.params.id);
        if (!song) return res.status(404).json({ error: 'Not found' });
        song.notes = req.body.notes ?? '';
        await song.save();
        res.json({ ok: true });
    } catch (e) { next(e); }
});


export default r;