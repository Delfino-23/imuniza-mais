import express from 'express';
import { atualizarAgendamento, criarAgendamento, excluirAgendamento, listarAgendamentos } from '../controllers/agendamentoController.js';
const router = express.Router();

// Rota GET para listar todos os agendamentos (Join com todos os dados)
router.get('/', listarAgendamentos);

// Rota POST para criar agendamento (Com Validação de Duplicidade Ativa)
router.post('/', criarAgendamento);

// Rota PUT para atualizar status (Com Lógica de Estoque Centralizada)
router.put('/:id', atualizarAgendamento);

// Rota DELETE para excluir agendamento
router.delete('/:id', excluirAgendamento);

export default router;