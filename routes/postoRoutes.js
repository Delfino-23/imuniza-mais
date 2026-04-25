import express from 'express';
import {
    atualizarPosto,
    criarPosto,
    excluirPosto,
    listarPostoPorId,
    listarPostos
} from '../controllers/postoController.js';

const router = express.Router();

router.get('/', listarPostos);
router.get('/:id', listarPostoPorId);
router.post('/', criarPosto);
router.put('/:id', atualizarPosto);
router.delete('/:id', excluirPosto);

export default router;