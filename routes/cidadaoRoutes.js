import express from 'express';
import {
    listarCidadaos,
    listarCidadaoPorCpf,
    criarCidadao,
    atualizarCidadao,
    excluirCidadao
} from '../controllers/cidadaoController.js';

const router = express.Router();

router.get('/', listarCidadaos);
router.get('/:cpf', listarCidadaoPorCpf);
router.post('/', criarCidadao);
router.put('/:cpf', atualizarCidadao);
router.delete('/:cpf', excluirCidadao);

export default router;