import express from 'express';
import {
    atualizarVacina,
    criarVacina,
    excluirVacina,
    listarVacinaPorId,
    listarVacinas
} from '../controllers/vacinaController.js';
const router = express.Router();

router.get('/', listarVacinas);
router.get('/:id', listarVacinaPorId);
router.post('/', criarVacina);
router.put('/:id', atualizarVacina);
router.delete('/:id', excluirVacina);

export default router;