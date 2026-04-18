import express from 'express';
import { 
    listarCidadaos, 
    listarCidadaoPorId, 
    criarCidadao, 
    atualizarCidadao, 
    excluirCidadao 
} from '../controllers/cidadaoController.js';

const router = express.Router();

router.get('/', listarCidadaos);
router.get('/:id', listarCidadaoPorId);
router.post('/', criarCidadao);
router.put('/:id', atualizarCidadao);
router.delete('/:id', excluirCidadao);

export default router;